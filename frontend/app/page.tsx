import ChatInterface from '@/components/ChatInterface';
import Link from 'next/link';
import { BarChart3, History, TrendingUp, Upload, FileText, Zap } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-3">
            🧭 Issa Compass AI Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Self-learning AI for Thai DTV visa consultation with advanced analytics
          </p>
          
          {/* Navigation Pills */}
          <div className="flex flex-wrap justify-center gap-3">
            <Link 
              href="/analytics" 
              className="px-4 py-2 bg-white rounded-full shadow hover:shadow-lg transition flex items-center gap-2 text-blue-600 font-semibold"
            >
              <TrendingUp className="w-4 h-4" />
              Analytics
            </Link>
            <Link 
              href="/training" 
              className="px-4 py-2 bg-white rounded-full shadow hover:shadow-lg transition flex items-center gap-2 text-green-600 font-semibold"
            >
              <Zap className="w-4 h-4" />
              Training
            </Link>
            <Link 
              href="/conversations" 
              className="px-4 py-2 bg-white rounded-full shadow hover:shadow-lg transition flex items-center gap-2 text-purple-600 font-semibold"
            >
              <History className="w-4 h-4" />
              History
            </Link>
            <Link 
              href="/performance" 
              className="px-4 py-2 bg-white rounded-full shadow hover:shadow-lg transition flex items-center gap-2 text-orange-600 font-semibold"
            >
              <BarChart3 className="w-4 h-4" />
              Performance
            </Link>
            <Link 
              href="/documents" 
              className="px-4 py-2 bg-white rounded-full shadow hover:shadow-lg transition flex items-center gap-2 text-indigo-600 font-semibold"
            >
              <Upload className="w-4 h-4" />
              Documents
            </Link>
            <Link 
              href="/diff" 
              className="px-4 py-2 bg-white rounded-full shadow hover:shadow-lg transition flex items-center gap-2 text-pink-600 font-semibold"
            >
              <FileText className="w-4 h-4" />
              Diff Viewer
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chat Interface - 2 columns */}
          <div className="lg:col-span-2">
            <ChatInterface />
          </div>
          
          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Features */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Premium Features
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-semibold">Self-Learning AI</span>
                    <p className="text-sm text-gray-600">Improves with every conversation</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-semibold">Confidence Scoring</span>
                    <p className="text-sm text-gray-600">Know how confident the AI is</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-semibold">Sentiment Analysis</span>
                    <p className="text-sm text-gray-600">Detect user emotions</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-semibold">Conversation History</span>
                    <p className="text-sm text-gray-600">Search and export chats</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-semibold">Performance Metrics</span>
                    <p className="text-sm text-gray-600">Track response times & costs</p>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <div>
                    <span className="font-semibold">Document Analysis</span>
                    <p className="text-sm text-gray-600">Upload & verify documents</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* About DTV */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">About DTV Visa</h3>
              <p className="mb-4 text-blue-50">
                The Destination Thailand Visa is perfect for remote workers, 
                digital nomads, and long-term stays.
              </p>
              <div className="space-y-2 text-sm">
                <p><strong>💰 Financial:</strong> 500,000 THB required</p>
                <p><strong>⏱️ Processing:</strong> 5-10 business days</p>
                <p><strong>💵 Service Fee:</strong> 18,000 THB</p>
                <p><strong>🌏 Apply From:</strong> Indonesia, Malaysia, Vietnam, Taiwan</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Multi-LLM Support</span>
                  <span className="font-bold text-blue-600">2 Providers</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Training Data</span>
                  <span className="font-bold text-green-600">128 Sequences</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Features</span>
                  <span className="font-bold text-purple-600">6 Premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}