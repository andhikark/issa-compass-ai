"""
Enhanced Database Service with conversation history and metrics
"""
import os
import json
from typing import Optional, List, Dict
from datetime import datetime

class DatabaseService:
    def __init__(self):
        self.db_type = os.getenv('DATABASE_TYPE', 'memory')
        
        if self.db_type == 'memory':
            self._init_memory_db()
        else:
            raise ValueError(f"Only memory database supported")
    
    def _init_memory_db(self):
        """Initialize enhanced in-memory storage"""
        self.storage = {
            'chatbot_prompt': self._load_base_prompt(),
            'version': 1,
            'last_updated': datetime.now().isoformat(),
            'improvement_history': [],
            'conversations': [],  # NEW: Conversation history
            'performance_metrics': [],  # NEW: Performance tracking
            'documents': []  # NEW: Uploaded documents
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
        
        # Save old prompt to history
        self.storage['improvement_history'].append({
            'version': self.storage['version'],
            'prompt': self.storage['chatbot_prompt'],
            'timestamp': self.storage['last_updated'],
            'metadata': metadata or {}
        })
        
        old_version = self.storage['version']
        old_prompt = self.storage['chatbot_prompt']
        
        self.storage['chatbot_prompt'] = prompt
        self.storage['version'] += 1
        self.storage['last_updated'] = timestamp
        
        return {
            'success': True,
            'version': self.storage['version'],
            'previous_version': old_version,
            'updated_at': timestamp,
            'old_prompt': old_prompt,  # NEW: Return old prompt for diff
            'new_prompt': prompt
        }
    
    def get_improvement_history(self) -> list:
        """Get prompt improvement history"""
        return self.storage['improvement_history']
    
    # NEW: Conversation History Methods
    def save_conversation(self, conversation_data: dict) -> dict:
        """Save a conversation"""
        conversation = {
            'id': len(self.storage['conversations']) + 1,
            'timestamp': datetime.now().isoformat(),
            **conversation_data
        }
        self.storage['conversations'].append(conversation)
        return conversation
    
    def get_conversations(self, limit: int = 50, offset: int = 0) -> List[dict]:
        """Get conversations with pagination"""
        conversations = self.storage['conversations']
        return conversations[offset:offset + limit]
    
    def search_conversations(self, query: str) -> List[dict]:
        """Search conversations by text"""
        query_lower = query.lower()
        return [
            conv for conv in self.storage['conversations']
            if query_lower in conv.get('client_message', '').lower()
            or query_lower in conv.get('ai_reply', '').lower()
        ]
    
    # NEW: Performance Metrics Methods
    def log_performance(self, metric_data: dict):
        """Log performance metrics"""
        metric = {
            'timestamp': datetime.now().isoformat(),
            **metric_data
        }
        self.storage['performance_metrics'].append(metric)
    
    def get_performance_metrics(self, limit: int = 100) -> List[dict]:
        """Get recent performance metrics"""
        return self.storage['performance_metrics'][-limit:]
    
    def get_performance_summary(self) -> dict:
        """Get performance summary statistics"""
        metrics = self.storage['performance_metrics']
        
        if not metrics:
            return {
                'total_requests': 0,
                'avg_response_time': 0,
                'total_tokens': 0,
                'avg_tokens_per_request': 0,
                'total_cost': 0
            }
        
        total_requests = len(metrics)
        avg_response_time = sum(m.get('response_time', 0) for m in metrics) / total_requests
        total_tokens = sum(m.get('tokens_used', 0) for m in metrics)
        total_cost = sum(m.get('estimated_cost', 0) for m in metrics)
        
        return {
            'total_requests': total_requests,
            'avg_response_time': round(avg_response_time, 3),
            'total_tokens': total_tokens,
            'avg_tokens_per_request': round(total_tokens / total_requests, 0),
            'total_cost': round(total_cost, 4)
        }
    
    # NEW: Document Storage Methods
    def save_document(self, document_data: dict) -> dict:
        """Save uploaded document metadata"""
        doc = {
            'id': len(self.storage['documents']) + 1,
            'timestamp': datetime.now().isoformat(),
            **document_data
        }
        self.storage['documents'].append(doc)
        return doc
    
    def get_documents(self, user_id: str = None) -> List[dict]:
        """Get documents, optionally filtered by user"""
        if user_id:
            return [d for d in self.storage['documents'] if d.get('user_id') == user_id]
        return self.storage['documents']

# Singleton instance
db_service = DatabaseService()