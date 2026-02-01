'use client';

import { useMemo, useState } from 'react';
import {
  Send,
  Bot,
  User,
  AlertCircle,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { api, ChatMessage } from '@/lib/api';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  sentiment?: any;
  confidence?: any;
  responseTime?: number;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Build chat history from current state
  const chatHistory: ChatMessage[] = useMemo(() => {
    return messages.map((msg) => ({
      role: msg.role === 'user' ? 'client' : 'consultant',
      message: msg.text,
    }));
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMessage: Message = { role: 'user', text: trimmed };

    // optimistic UI
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // include the newest user message (avoid stale state)
      const nextChatHistory: ChatMessage[] = [
        ...chatHistory,
        { role: 'client', message: trimmed },
      ];

      const response = await api.generateReply({
        clientSequence: trimmed,
        chatHistory: nextChatHistory,
        includeAnalytics: true,
      });

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: response.aiReply,
          sentiment: response.sentiment,
          confidence: response.confidence,
          responseTime: response.responseTime,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: 'Sorry, there was an error. Please try again.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getConfidenceBadge = (confidence: any) => {
    if (!confidence) return null;

    const { score, level, color } = confidence;

    const Icon =
      level === 'high' ? CheckCircle : level === 'medium' ? AlertTriangle : AlertCircle;

    const bgColor =
      color === 'green'
        ? 'bg-green-100 text-green-800'
        : color === 'yellow'
        ? 'bg-yellow-100 text-yellow-800'
        : 'bg-red-100 text-red-800';

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${bgColor} mt-2`}>
        <Icon className="w-3 h-3" />
        <span>{Math.round(score * 100)}% confident</span>
      </div>
    );
  };

  const getSentimentBadge = (sentiment: any) => {
    if (!sentiment) return null;

    return (
      <span className="text-xl ml-2" title={sentiment.description}>
        {sentiment.emoji}
      </span>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h2 className="text-xl font-bold">Issa Compass AI Assistant</h2>
        <p className="text-sm opacity-90">Thai DTV Visa Consultation with AI Analytics</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-semibold">Start a conversation</p>
            <p className="text-sm mt-1">
              Ask about Thai DTV visa requirements, documents, or process
            </p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';

          return (
            <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl p-3 shadow-sm ${
                  isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="flex items-start gap-2">
                  {!isUser && <Bot className="w-5 h-5 mt-1 flex-shrink-0 opacity-80" />}

                  <div className="flex-1 min-w-0">
                    {isUser ? (
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.text}</p>
                    ) : (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-li:my-1 prose-ul:my-2 prose-ol:my-2 prose-headings:my-2">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            // Make links look nice + safe
                            a: ({ children, ...props }) => (
                              <a
                                {...props}
                                className="text-blue-600 hover:underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            // Optional: style code blocks
                            code: ({ children }) => (
                              <code className="px-1 py-0.5 rounded bg-gray-200 text-gray-900">
                                {children}
                              </code>
                            ),
                          }}
                        >
                          {msg.text}
                        </ReactMarkdown>
                      </div>
                    )}

                    {!isUser && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {getConfidenceBadge(msg.confidence)}
                        {msg.responseTime != null && (
                          <span className="text-xs text-gray-500">
                            {msg.responseTime.toFixed(2)}s
                          </span>
                        )}
                      </div>
                    )}

                    {isUser && msg.sentiment && (
                      <div className="mt-1">{getSentimentBadge(msg.sentiment)}</div>
                    )}
                  </div>

                  {isUser && <User className="w-5 h-5 mt-1 flex-shrink-0 opacity-90" />}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-3 shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 opacity-80" />
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:120ms]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:240ms]" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !loading) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask about DTV visa..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-60"
            disabled={loading}
          />

          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label="Send"
            title="Send"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-2">
          💡 Powered by AI with confidence scoring and sentiment analysis
        </p>
      </div>
    </div>
  );
}
