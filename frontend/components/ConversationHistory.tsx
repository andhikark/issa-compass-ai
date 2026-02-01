'use client';

import { useState, useEffect } from 'react';
import { api, Conversation } from '@/lib/api';
import { Search, Download, RefreshCw } from 'lucide-react';

export default function ConversationHistory() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const data = await api.getConversations(50, 0);
      setConversations(data.conversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadConversations();
      return;
    }

    setSearching(true);
    try {
      const data = await api.searchConversations(searchQuery);
      setConversations(data.results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await api.exportConversations();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'conversations.csv';
      a.click();
    } catch (error) {
      console.error('Error exporting:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading conversations...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Conversation History</h3>
        <div className="flex gap-2">
          <button
            onClick={loadConversations}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search conversations..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            {searching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {conversations.length === 0 ? (
          <p className="text-center text-gray-500">No conversations found</p>
        ) : (
          conversations.map((conv) => (
            <div key={conv.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(conv.timestamp).toLocaleString()}
                </span>
                {conv.confidence && (
                  <span className={`text-xs px-2 py-1 rounded ${
                    conv.confidence.level === 'high' ? 'bg-green-100 text-green-800' :
                    conv.confidence.level === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {Math.round(conv.confidence.score * 100)}% confident
                  </span>
                )}
              </div>
              
              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-600">Client:</p>
                <p className="text-gray-900">{conv.client_message}</p>
              </div>
              
              <div>
                <p className="text-sm font-semibold text-gray-600">AI Response:</p>
                <p className="text-gray-900">{conv.ai_reply}</p>
              </div>

              {conv.sentiment && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Sentiment:</span>
                  <span className="text-lg">{conv.sentiment.emoji}</span>
                  <span className="text-sm text-gray-600">{conv.sentiment.description}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}