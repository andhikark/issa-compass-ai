'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, Zap, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const chartData = analytics?.improvement_history?.map((item: any, idx: number) => ({
    version: item.version,
    improvements: idx + 1
  })) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Chat
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Track AI learning progress and improvements over time
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Version</p>
                <p className="text-3xl font-bold text-blue-600">
                  v{analytics?.current_version || 1}
                </p>
                <p className="text-xs text-gray-500 mt-1">AI Prompt Iterations</p>
              </div>
              <Activity className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Improvements</p>
                <p className="text-3xl font-bold text-green-600">
                  {analytics?.total_improvements || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Learning Sessions</p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Learning Status</p>
                <p className="text-lg font-bold text-purple-600">
                  🟢 Active
                </p>
                <p className="text-xs text-gray-500 mt-1">Continuously Improving</p>
              </div>
              <Zap className="w-12 h-12 text-purple-600 opacity-20" />
            </div>
          </div>
        </div>

        {/* Improvement Trend Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Learning Curve</h2>
          <p className="text-gray-600 mb-4">
            This chart shows how the AI has improved over time. Each point represents a training iteration.
          </p>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="version" 
                label={{ value: 'Version', position: 'insideBottom', offset: -5 }} 
              />
              <YAxis 
                label={{ value: 'Cumulative Improvements', angle: -90, position: 'insideLeft' }} 
              />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="improvements" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 5 }}
                activeDot={{ r: 8 }}
                name="Total Improvements"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Improvements */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Improvements</h2>
          <p className="text-gray-600 mb-6">
            Track what the AI learned in recent training sessions
          </p>
          
          <div className="space-y-4">
            {analytics?.improvement_history?.slice(-10).reverse().map((item: any, idx: number) => (
              <div 
                key={idx} 
                className="border-l-4 border-blue-600 bg-blue-50 pl-4 py-3 rounded-r-lg hover:bg-blue-100 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-blue-900">Version {item.version}</p>
                      <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">
                      {item.metadata?.analysis || 'Prompt optimized based on training data'}
                    </p>
                    {item.metadata?.changes && (
                      <p className="text-xs text-gray-600 mt-2">
                        <strong>Changes:</strong> {item.metadata.changes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(!analytics?.improvement_history || analytics.improvement_history.length === 0) && (
              <p className="text-center text-gray-500 py-8">
                No improvements yet. Run training to see results here!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}