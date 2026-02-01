import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export interface ChatMessage {
  role: 'client' | 'consultant';
  message: string;
  timestamp?: number;
}

export interface SentimentData {
  sentiment: string;
  polarity: number;
  subjectivity: number;
  emoji: string;
  description: string;
}

export interface ConfidenceData {
  score: number;
  level: string;
  color: string;
  reasoning: string;
  flags: string[];
  should_review: boolean;
}

export interface Conversation {
  id: number;
  timestamp: string;
  client_message: string;
  ai_reply: string;
  sentiment?: SentimentData;
  confidence?: ConfidenceData;
  response_time?: number;
}

export interface PerformanceMetric {
  timestamp: string;
  endpoint: string;
  response_time: number;
  tokens_used: number;
  estimated_cost: number;
  provider: string;
}

export const api = {
  // Chat
  async generateReply(data: {
    clientSequence: string | string[];
    chatHistory: ChatMessage[];
    provider?: string;
    includeAnalytics?: boolean;
  }) {
    const response = await axios.post(`${API_URL}/generate-reply`, data);
    return response.data;
  },

  // Training
  async improveAI(data: {
    clientSequence: string | string[];
    chatHistory: ChatMessage[];
    consultantReply: string | string[];
    provider?: string;
  }) {
    const response = await axios.post(`${API_URL}/improve-ai`, data);
    return response.data;
  },

  async improveAIManual(instructions: string) {
    const response = await axios.post(`${API_URL}/improve-ai-manual`, { instructions });
    return response.data;
  },

  async testTraining() {
    const response = await axios.get(`${API_URL}/test-training`);
    return response.data;
  },

  // Prompts
  async getPrompt() {
    const response = await axios.get(`${API_URL}/get-prompt`);
    return response.data;
  },

  async getPromptDiff(version?: number) {
    const params = version ? { version } : {};
    const response = await axios.get(`${API_URL}/prompt-diff`, { params });
    return response.data;
  },

  // Analytics
  async getAnalytics() {
    const response = await axios.get(`${API_URL}/analytics`);
    return response.data;
  },

  // Conversations
  async getConversations(limit = 50, offset = 0) {
    const response = await axios.get(`${API_URL}/conversations`, {
      params: { limit, offset }
    });
    return response.data;
  },

  async searchConversations(query: string) {
    const response = await axios.post(`${API_URL}/conversations/search`, { query });
    return response.data;
  },

  async exportConversations() {
    const response = await axios.get(`${API_URL}/conversations/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Performance
  async getPerformanceMetrics(limit = 100) {
    const response = await axios.get(`${API_URL}/performance`, {
      params: { limit }
    });
    return response.data;
  },

  // Documents
  async uploadDocument(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  async getDocuments() {
    const response = await axios.get(`${API_URL}/documents`);
    return response.data;
  },

  // Health
  async health() {
    const response = await axios.get(`${API_URL}/health`);
    return response.data;
  }
};