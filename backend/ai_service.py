import os
import json
from typing import List, Dict
from llm_service import llm_service
from database_service import db_service

class AIService:
    def __init__(self):
        self.llm = llm_service
        self.db = db_service
        
        editor_prompt_path = os.path.join(os.path.dirname(__file__), 'editor_prompt.txt')
        with open(editor_prompt_path, 'r', encoding='utf-8') as f:
            self.editor_prompt = f.read()
    
    def format_chat_history(self, chat_history: List[Dict]) -> str:
        """Format chat history for LLM"""
        if not chat_history:
            return "(No previous conversation)"
        
        formatted = []
        for msg in chat_history:
            role = msg['role'].upper()
            message = msg['message']
            formatted.append(f"[{role}] {message}")
        
        return "\n".join(formatted)
    
    def format_client_sequence(self, client_sequence) -> str:
        """Format client messages"""
        if isinstance(client_sequence, str):
            return client_sequence
        return "\n".join(client_sequence)
    
    def generate_reply(self, client_sequence, chat_history: List[Dict], provider: str = None) -> str:
        """Generate AI reply"""
        chatbot_prompt = self.db.get_prompt()
        
        chat_history_formatted = self.format_chat_history(chat_history)
        client_sequence_formatted = self.format_client_sequence(client_sequence)
        
        user_message = f"""CHAT HISTORY:
{chat_history_formatted}

CLIENT SEQUENCE:
{client_sequence_formatted}

Generate response in JSON with "reply" field."""
        
        response = self.llm.generate_response(
            prompt=chatbot_prompt,
            user_message=user_message,
            provider=provider
        )
        
        return response.get('reply', '')
    
    def improve_prompt_auto(self, client_sequence, chat_history: List[Dict], 
                           consultant_reply, provider: str = None) -> Dict:
        """Auto-improve prompt by comparing AI vs human"""
        predicted_reply = self.generate_reply(client_sequence, chat_history, provider)
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

Analyze and provide improved prompt."""
        
        editor_response = self.llm.generate_response(
            prompt=self.editor_prompt,
            user_message=editor_user_message,
            provider=provider or 'claude'
        )
        
        updated_prompt = editor_response.get('updated_prompt', current_prompt)
        analysis = editor_response.get('analysis', 'No analysis')
        changes_made = editor_response.get('changes_made', 'No changes')
        
        self.db.set_prompt(updated_prompt, {
            'analysis': analysis,
            'changes': changes_made
        })
        
        return {
            'predicted_reply': predicted_reply,
            'actual_reply': consultant_reply_formatted,
            'analysis': analysis,
            'changes_made': changes_made,
            'updated_prompt': updated_prompt
        }
    
    def improve_prompt_manual(self, instructions: str, provider: str = None) -> Dict:
        """Manually improve prompt"""
        current_prompt = self.db.get_prompt()
        
        user_message = f"""CURRENT PROMPT:
{current_prompt}

USER INSTRUCTIONS:
{instructions}

Update the prompt. Return JSON:
{{"explanation": "...", "updated_prompt": "..."}}"""
        
        response = self.llm.generate_response(
            prompt="You are a prompt engineer. Update prompts based on instructions.",
            user_message=user_message,
            provider=provider or 'claude'
        )
        
        updated_prompt = response.get('updated_prompt', current_prompt)
        explanation = response.get('explanation', 'Updated')
        
        self.db.set_prompt(updated_prompt, {'manual_instruction': instructions})
        
        return {
            'explanation': explanation,
            'updated_prompt': updated_prompt
        }

# Singleton
ai_service = AIService()