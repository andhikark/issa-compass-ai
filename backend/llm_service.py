import os
import json
from typing import Dict, Optional
from anthropic import Anthropic
from openai import OpenAI
import google.generativeai as genai

class LLMService:
    def __init__(self):
        self.anthropic_client = None
        self.openai_client = None
        self.google_configured = False
        
        # Initialize available clients
        if os.getenv('ANTHROPIC_API_KEY'):
            self.anthropic_client = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))
        
        if os.getenv('OPENAI_API_KEY'):
            self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        if os.getenv('GOOGLE_API_KEY'):
            genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))
            self.google_configured = True
    
    def generate_response(self, prompt: str, user_message: str, provider: Optional[str] = None) -> Dict:
        """Generate a response using specified LLM provider"""
        if provider is None:
            provider = os.getenv('DEFAULT_LLM_PROVIDER', 'claude')
        
        try:
            if provider == 'claude' and self.anthropic_client:
                return self._call_claude(prompt, user_message)
            elif provider == 'openai' and self.openai_client:
                return self._call_openai(prompt, user_message)
            elif provider == 'google' and self.google_configured:
                return self._call_google(prompt, user_message)
            else:
                raise ValueError(f"Provider {provider} not available")
        except Exception as e:
            raise Exception(f"LLM API call failed: {str(e)}")
    
    def _call_claude(self, prompt: str, user_message: str) -> Dict:
        """Call Claude API"""
        response = self.anthropic_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            system=prompt,
            messages=[{"role": "user", "content": user_message}]
        )
        
        reply_text = response.content[0].text
        
        try:
            return json.loads(reply_text)
        except json.JSONDecodeError:
            return {"reply": reply_text}
    
    def _call_openai(self, prompt: str, user_message: str) -> Dict:
        """Call OpenAI API"""
        response = self.openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": prompt},
                {"role": "user", "content": user_message}
            ],
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        
        reply_text = response.choices[0].message.content
        
        try:
            return json.loads(reply_text)
        except json.JSONDecodeError:
            return {"reply": reply_text}
    
    def _call_google(self, prompt: str, user_message: str) -> Dict:
        """Call Google Gemini API"""
        model = genai.GenerativeModel('gemini-1.5-flash')
        full_prompt = f"{prompt}\n\nUser message:\n{user_message}\n\nRespond in JSON format."
        
        response = model.generate_content(full_prompt)
        reply_text = response.text
        
        # Clean up markdown
        if reply_text.startswith('```json'):
            reply_text = reply_text.split('```json')[1].split('```')[0].strip()
        elif reply_text.startswith('```'):
            reply_text = reply_text.split('```')[1].split('```')[0].strip()
        
        try:
            return json.loads(reply_text)
        except json.JSONDecodeError:
            return {"reply": reply_text}

# Singleton instance
llm_service = LLMService()