'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ConversationHistory from '@/components/ConversationHistory';

export default function ConversationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          💬 Conversation History
        </h1>
        <p className="text-gray-600 mb-8">
          Search, filter, and export all conversations with sentiment analysis
        </p>

        <ConversationHistory />
      </div>
    </div>
  );
}