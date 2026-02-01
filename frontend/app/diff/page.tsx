'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import PromptDiffViewer from '@/components/PromptDiffViewer';


export default function DiffPage() {
  const [diffData, setDiffData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiff();
  }, []);

  const loadDiff = async () => {
    try {
      const data = await api.getPromptDiff();
      setDiffData(data);
    } catch (error) {
      console.error('Error loading diff:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-pink-600 hover:text-pink-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🔍 Prompt Diff Viewer
        </h1>
        <p className="text-gray-600 mb-8">
          See exactly how the AI prompt has changed over time
        </p>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto" />
            <p className="mt-4">Loading prompt differences...</p>
          </div>
        ) : diffData ? (
          <PromptDiffViewer 
            oldPrompt={diffData.old_prompt} 
            newPrompt={diffData.new_prompt}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <p className="text-gray-600">No prompt changes available yet.</p>
            <p className="text-sm text-gray-500 mt-2">Run training to see changes!</p>
          </div>
        )}
      </div>
    </div>
  );
}