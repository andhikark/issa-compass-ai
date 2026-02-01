"""
Enhanced AI Service with confidence scoring and sentiment analysis
(TextBlob removed; uses lightweight heuristic sentiment)
"""
import os
import json
import time
import re
from typing import List, Dict, Any, Optional

from llm_service import llm_service
from database_service import db_service


class AIService:
    def __init__(self):
        self.llm = llm_service
        self.db = db_service

        editor_prompt_path = os.path.join(os.path.dirname(__file__), "editor_prompt.txt")
        with open(editor_prompt_path, "r", encoding="utf-8") as f:
            self.editor_prompt = f.read()

    def _provider_used(self, provider: Optional[str]) -> str:
        # Default to openai to avoid "claude not available" surprises
        return provider or os.getenv("DEFAULT_LLM_PROVIDER", "openai")

    def format_chat_history(self, chat_history: List[Dict]) -> str:
        """Format chat history for LLM"""
        if not chat_history:
            return "(No previous conversation)"

        formatted = []
        for msg in chat_history:
            role = str(msg.get("role", "")).upper()
            message = str(msg.get("message", ""))
            formatted.append(f"[{role}] {message}")

        return "\n".join(formatted)

    def format_client_sequence(self, client_sequence) -> str:
        """Format client messages"""
        if isinstance(client_sequence, str):
            return client_sequence
        if isinstance(client_sequence, list):
            return "\n".join(map(str, client_sequence))
        return str(client_sequence)

    # -------------------------
    # Sentiment (no TextBlob)
    # -------------------------
    def analyze_sentiment(self, text: str) -> dict:
        """
        Lightweight heuristic sentiment analysis (no external deps).
        Returns: positive/neutral/negative + rough score.
        """
        try:
            t = (text or "").lower()

            positive = {
                "thanks", "thank", "great", "good", "awesome", "perfect",
                "ok", "okay", "understood", "nice", "love", "cool"
            }
            negative = {
                "angry", "frustrated", "upset", "bad", "terrible", "hate",
                "worried", "confused", "problem", "issue", "refund", "scam",
                "cannot", "can't", "fail", "failed", "error"
            }

            tokens = re.findall(r"[a-zA-Z']+", t)
            pos_hits = sum(1 for w in tokens if w in positive)
            neg_hits = sum(1 for w in tokens if w in negative)

            exclam = t.count("!")
            question = t.count("?")

            # heuristic score (NOT probability)
            score = (pos_hits - neg_hits) + (0.2 * exclam) - (0.1 * question)

            if score >= 1:
                sentiment, emoji = "positive", "😊"
            elif score <= -1:
                sentiment, emoji = "negative", "😟"
            else:
                sentiment, emoji = "neutral", "😐"

            return {
                "sentiment": sentiment,
                "score": round(float(score), 2),
                "pos_hits": pos_hits,
                "neg_hits": neg_hits,
                "emoji": emoji,
                "description": self._get_sentiment_description(score),
            }
        except Exception as e:
            return {
                "sentiment": "unknown",
                "score": 0,
                "pos_hits": 0,
                "neg_hits": 0,
                "emoji": "❓",
                "description": "Unable to analyze",
                "error": str(e),
            }

    def _get_sentiment_description(self, score: float) -> str:
        if score >= 2:
            return "Very positive"
        if score >= 1:
            return "Positive"
        if score <= -2:
            return "Very negative - may need attention"
        if score <= -1:
            return "Negative - user may be frustrated"
        return "Neutral"

    # -------------------------
    # Confidence (provider-safe)
    # -------------------------
    def calculate_confidence(self, reply: str, chat_history: List[Dict], provider: Optional[str] = None) -> dict:
        """
        Use LLM to assess confidence when available; fallback to heuristic if it fails.
        IMPORTANT: Uses the same provider default as the rest of the app (no hardcoded 'claude').
        """
        provider_used = self._provider_used(provider)

        try:
            confidence_prompt = f"""Analyze this AI response and rate its confidence level.

AI Response:
{reply}

Consider:
1. Completeness of information
2. Specificity of details
3. Clarity and certainty of language
4. Whether it includes caveats or uncertainties

Return STRICT JSON only:
{{
  "confidence": 0.85,
  "reasoning": "Clear answer with specific details",
  "flags": []
}}
"""

            result = self.llm.generate_response(
                prompt="You are a confidence analyzer. Assess AI responses objectively.",
                user_message=confidence_prompt,
                provider=provider_used,
            )

            # Some LLM wrappers return str; normalize to dict
            if isinstance(result, str):
                try:
                    result = json.loads(result)
                except Exception:
                    result = {}

            confidence = float(result.get("confidence", 0.7))
            reasoning = result.get("reasoning", "Standard confidence")
            flags = result.get("flags", [])

            if confidence >= 0.9:
                level, color = "high", "green"
            elif confidence >= 0.7:
                level, color = "medium", "yellow"
            else:
                level, color = "low", "red"

            return {
                "score": round(confidence, 2),
                "level": level,
                "color": color,
                "reasoning": reasoning,
                "flags": flags,
                "should_review": confidence < 0.7,
            }

        except Exception as e:
            # Simple heuristic fallback (no extra deps)
            text = (reply or "").lower()
            vague_markers = ["maybe", "might", "not sure", "cannot determine", "unclear", "depends"]
            has_vague = any(v in text for v in vague_markers)
            score = 0.65 if has_vague else 0.75

            return {
                "score": round(score, 2),
                "level": "medium" if score >= 0.7 else "low",
                "color": "yellow" if score >= 0.7 else "red",
                "reasoning": "Heuristic estimate (LLM confidence failed)",
                "flags": ["confidence_fallback"],
                "should_review": score < 0.7,
                "error": str(e),
            }

    # -------------------------
    # Core endpoints
    # -------------------------
    def generate_reply(
        self,
        client_sequence,
        chat_history: List[Dict],
        provider: str = None,
        include_analytics: bool = True,
    ) -> Dict[str, Any]:
        """Generate AI reply with confidence and sentiment"""
        start_time = time.time()
        provider_used = self._provider_used(provider)

        chatbot_prompt = self.db.get_prompt()

        chat_history_formatted = self.format_chat_history(chat_history)
        client_sequence_formatted = self.format_client_sequence(client_sequence)

        user_message = f"""CHAT HISTORY:
{chat_history_formatted}

CLIENT SEQUENCE:
{client_sequence_formatted}

Generate response in JSON with "reply" field only.
"""

        response = self.llm.generate_response(
            prompt=chatbot_prompt,
            user_message=user_message,
            provider=provider_used,
        )

        # normalize if response is a JSON string
        if isinstance(response, str):
            try:
                response = json.loads(response)
            except Exception:
                response = {}

        ai_reply = response.get("reply", "")
        response_time = time.time() - start_time

        result: Dict[str, Any] = {
            "reply": ai_reply,
            "response_time": round(response_time, 3),
            "provider": provider_used,
        }

        if include_analytics:
            sentiment = self.analyze_sentiment(client_sequence_formatted)
            confidence = self.calculate_confidence(ai_reply, chat_history, provider=provider_used)

            result["sentiment"] = sentiment
            result["confidence"] = confidence

            # Log performance (optional)
            self.db.log_performance(
                {
                    "endpoint": "generate_reply",
                    "response_time": response_time,
                    "tokens_used": len(ai_reply.split()) * 1.3,  # rough estimate
                    "estimated_cost": len(ai_reply.split()) * 0.000002,  # rough estimate
                    "provider": provider_used,
                }
            )

            # Save conversation (optional)
            self.db.save_conversation(
                {
                    "client_message": client_sequence_formatted,
                    "ai_reply": ai_reply,
                    "sentiment": sentiment,
                    "confidence": confidence,
                    "response_time": response_time,
                    "provider": provider_used,
                }
            )

        return result

    def improve_prompt_auto(
        self,
        client_sequence,
        chat_history: List[Dict],
        consultant_reply,
        provider: str = None,
    ) -> Dict[str, Any]:
        """Auto-improve prompt with diff tracking"""
        provider_used = self._provider_used(provider)

        predicted_result = self.generate_reply(
            client_sequence, chat_history, provider_used, include_analytics=False
        )
        predicted_reply = predicted_result["reply"]

        current_prompt = self.db.get_prompt()

        consultant_reply_formatted = self.format_client_sequence(consultant_reply)
        chat_history_formatted = self.format_chat_history(chat_history)
        client_sequence_formatted = self.format_client_sequence(client_sequence)

        editor_user_message = f"""EXISTING_PROMPT:
{current_prompt}

CHAT HISTORY:
{chat_history_formatted}

CLIENT SEQUENCE:
{client_sequence_formatted}

PREDICTED_AI_REPLY:
{predicted_reply}

ACTUAL_CONSULTANT_REPLY:
{consultant_reply_formatted}

Analyze and provide improved prompt. Return JSON with:
- updated_prompt
- analysis
- changes_made
"""

        editor_response = self.llm.generate_response(
            prompt=self.editor_prompt,
            user_message=editor_user_message,
            provider=provider_used,
        )

        if isinstance(editor_response, str):
            try:
                editor_response = json.loads(editor_response)
            except Exception:
                editor_response = {}

        updated_prompt = editor_response.get("updated_prompt", current_prompt)
        analysis = editor_response.get("analysis", "No analysis")
        changes_made = editor_response.get("changes_made", "No changes")

        update_result = self.db.set_prompt(
            updated_prompt,
            {
                "analysis": analysis,
                "changes": changes_made,
                "provider": provider_used,
            },
        )

        return {
            "predicted_reply": predicted_reply,
            "actual_reply": consultant_reply_formatted,
            "analysis": analysis,
            "changes_made": changes_made,
            "updated_prompt": updated_prompt,
            "old_prompt": update_result["old_prompt"],
            "new_prompt": update_result["new_prompt"],
            "provider": provider_used,
        }

    def improve_prompt_manual(self, instructions: str, provider: str = None) -> Dict[str, Any]:
        """Manually improve prompt"""
        provider_used = self._provider_used(provider)
        current_prompt = self.db.get_prompt()

        user_message = f"""CURRENT PROMPT:
{current_prompt}

USER INSTRUCTIONS:
{instructions}

Return STRICT JSON only:
{{"explanation": "...", "updated_prompt": "..."}}
"""

        response = self.llm.generate_response(
            prompt="You are a prompt engineer. Update prompts based on instructions.",
            user_message=user_message,
            provider=provider_used,
        )

        if isinstance(response, str):
            try:
                response = json.loads(response)
            except Exception:
                response = {}

        updated_prompt = response.get("updated_prompt", current_prompt)
        explanation = response.get("explanation", "Updated")

        update_result = self.db.set_prompt(
            updated_prompt,
            {"manual_instruction": instructions, "provider": provider_used},
        )

        return {
            "explanation": explanation,
            "updated_prompt": updated_prompt,
            "old_prompt": update_result["old_prompt"],
            "new_prompt": update_result["new_prompt"],
            "provider": provider_used,
        }


# Singleton
ai_service = AIService()
