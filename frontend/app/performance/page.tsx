'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PerformanceDashboard from '@/components/PerformanceDashboard';

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ⚡ Performance Metrics
        </h1>
        <p className="text-gray-600 mb-8">
          Monitor response times, token usage, and estimated costs
        </p>

        <PerformanceDashboard />
      </div>
    </div>
  );
}