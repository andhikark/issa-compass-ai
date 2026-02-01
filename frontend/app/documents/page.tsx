'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import DocumentUpload from '@/components/DocumentUpload';

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Link>
        
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          📄 Document Analysis
        </h1>
        <p className="text-gray-600 mb-8">
          Upload bank statements, passports, or other visa documents for automated verification
        </p>

        <DocumentUpload />
      </div>
    </div>
  );
}