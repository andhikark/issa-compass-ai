'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Clock, DollarSign, Zap } from 'lucide-react';

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      const data = await api.getPerformanceMetrics(100);
      setMetrics(data);
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading performance metrics...</div>;
  }

  const summary = metrics?.summary || {};
  const chartData = metrics?.recent_metrics?.map((m: any, idx: number) => ({
    index: idx + 1,
    responseTime: m.response_time,
    tokens: m.tokens_used,
    cost: m.estimated_cost * 1000 // Convert to micro-dollars for visibility
  })) || [];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Requests</p>
              <p className="text-3xl font-bold text-blue-600">
                {summary.total_requests || 0}
              </p>
            </div>
            <Activity className="w-12 h-12 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Response Time</p>
              <p className="text-3xl font-bold text-green-600">
                {summary.avg_response_time || 0}s
              </p>
            </div>
            <Clock className="w-12 h-12 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Tokens</p>
              <p className="text-3xl font-bold text-purple-600">
                {summary.total_tokens?.toLocaleString() || 0}
              </p>
            </div>
            <Zap className="w-12 h-12 text-purple-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Estimated Cost</p>
              <p className="text-3xl font-bold text-orange-600">
                ${summary.total_cost?.toFixed(4) || '0.0000'}
              </p>
            </div>
            <DollarSign className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Response Time Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Response Time Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: 'Request #', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Response Time (s)', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="responseTime" stroke="#3b82f6" name="Response Time" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Token Usage Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Token Usage</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="index" label={{ value: 'Request #', position: 'insideBottom', offset: -5 }} />
            <YAxis label={{ value: 'Tokens', angle: -90, position: 'insideLeft' }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="tokens" fill="#8b5cf6" name="Tokens Used" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}