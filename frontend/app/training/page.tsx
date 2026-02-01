'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Play, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function TrainingPage() {
  const [training, setTraining] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runTraining = async () => {
    setTraining(true);
    try {
      const data = await api.testTraining();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setTraining(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🎓 Training Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Watch the AI learn in real-time from actual consultant conversations
        </p>

        {/* Training Control */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">Run Training Session</h2>
              <p className="text-gray-600">Process 3 sample conversations and improve the AI</p>
            </div>
            <button
              onClick={runTraining}
              disabled={training}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition shadow-lg hover:shadow-xl"
            >
              <Play className="w-5 h-5" />
              {training ? 'Training in Progress...' : 'Start Training'}
            </button>
          </div>

          {training && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">Training AI on real conversations...</p>
              <p className="text-sm text-gray-500 mt-2">This may take 30-60 seconds</p>
            </div>
          )}

          {results && !training && (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <p className="text-green-900 font-semibold text-lg">{results.message}</p>
                </div>
                <p className="text-green-700">
                  Processed 3 conversations out of {results.total_sequences_available} available
                </p>
              </div>

              {/* Training Results */}
              {results.results?.map((result: any, idx: number) => (
                <div key={idx} className="border-2 border-gray-200 rounded-lg p-6 bg-white hover:shadow-lg transition">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Sequence #{result.sequence_num}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{result.scenario}</p>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      ID: {result.contact_id}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {/* AI Prediction */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-semibold text-blue-900">AI Predicted:</p>
                      </div>
                      <p className="text-sm text-gray-800">{result.predicted_reply}</p>
                    </div>

                    {/* Actual Consultant */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <p className="text-sm font-semibold text-green-900">Actual Consultant:</p>
                      </div>
                      <p className="text-sm text-gray-800">{result.actual_reply}</p>
                    </div>
                  </div>

                  {/* Analysis */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-purple-900 mb-2">
                      🧠 What the AI Learned:
                    </p>
                    <p className="text-sm text-gray-800">{result.analysis}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold mb-3">How Training Works</h3>
          <ol className="space-y-2 text-green-50">
            <li>1️⃣ AI generates response based on current knowledge</li>
            <li>2️⃣ Compare AI response with real consultant's answer</li>
            <li>3️⃣ Analyze differences in tone, content, and structure</li>
            <li>4️⃣ Update AI prompt with specific improvements</li>
            <li>5️⃣ Next conversation uses the improved prompt</li>
          </ol>
        </div>
      </div>
    </div>
  );
}