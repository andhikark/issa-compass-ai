import os
import json
from typing import Optional
from datetime import datetime

class DatabaseService:
    def __init__(self):
        self.db_type = os.getenv('DATABASE_TYPE', 'memory')
        
        if self.db_type == 'memory':
            self._init_memory_db()
        else:
            raise ValueError(f"Only memory database supported in this guide")
    
    def _init_memory_db(self):
        """Initialize in-memory storage"""
        self.storage = {
            'chatbot_prompt': self._load_base_prompt(),
            'version': 1,
            'last_updated': datetime.now().isoformat(),
            'improvement_history': []
        }
    
    def _load_base_prompt(self) -> str:
        """Load the base prompt from file"""
        prompt_path = os.path.join(os.path.dirname(__file__), 'base_prompt.txt')
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def get_prompt(self) -> str:
        """Retrieve the current AI chatbot prompt"""
        return self.storage['chatbot_prompt']
    
    def set_prompt(self, prompt: str, metadata: dict = None) -> dict:
        """Update the AI chatbot prompt"""
        timestamp = datetime.now().isoformat()
        
        # Save to history
        self.storage['improvement_history'].append({
            'version': self.storage['version'],
            'prompt': self.storage['chatbot_prompt'],
            'timestamp': self.storage['last_updated'],
            'metadata': metadata or {}
        })
        
        old_version = self.storage['version']
        self.storage['chatbot_prompt'] = prompt
        self.storage['version'] += 1
        self.storage['last_updated'] = timestamp
        
        return {
            'success': True,
            'version': self.storage['version'],
            'previous_version': old_version,
            'updated_at': timestamp
        }
    
    def get_improvement_history(self) -> list:
        """Get prompt improvement history"""
        return self.storage['improvement_history']

# Singleton instance
db_service = DatabaseService()