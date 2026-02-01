'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { Upload, FileText, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function DocumentUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setAnalysis(null);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const result = await api.uploadDocument(file);
      setAnalysis(result.analysis);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const renderAnalysis = () => {
    if (!analysis) return null;

    if (analysis.error) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <XCircle className="w-5 h-5" />
            <span className="font-semibold">Error: {analysis.error}</span>
          </div>
        </div>
      );
    }

    if (analysis.type === 'pdf' && analysis.analysis) {
      const { checks, recommendations, confidence } = analysis.analysis;

      return (
        <div className="space-y-4">
          <div className={`border rounded-lg p-4 ${
            confidence === 'high' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
          }`}>
            <h4 className="font-semibold mb-2">Document Analysis</h4>
            
            <div className="space-y-2">
              {checks.appears_to_be_bank_statement ? (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Appears to be a bank statement</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-4 h-4" />
                  <span>May not be a valid bank statement</span>
                </div>
              )}

              {checks.has_balance_field && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Balance field detected</span>
                </div>
              )}

              {checks.has_date_information && (
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-4 h-4" />
                  <span>Date information found</span>
                </div>
              )}

              {checks.potential_balances && checks.potential_balances.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm font-semibold">Potential balance amounts found:</p>
                  <ul className="list-disc list-inside text-sm">
                    {checks.potential_balances.map((balance: string, idx: number) => (
                      <li key={idx}>{balance}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Recommendations
            </h4>
            <ul className="space-y-1">
              {recommendations.map((rec: string, idx: number) => (
                <li key={idx} className="text-sm">{rec}</li>
              ))}
            </ul>
          </div>

          {analysis.preview && (
            <details className="bg-gray-50 border rounded-lg p-4">
              <summary className="cursor-pointer font-semibold">View Document Preview</summary>
              <pre className="mt-2 text-xs whitespace-pre-wrap overflow-auto max-h-64">
                {analysis.preview}
              </pre>
            </details>
          )}
        </div>
      );
    }

    if (analysis.type === 'image') {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-blue-800 mb-2">
            <CheckCircle className="w-5 h-5" />
            <span className="font-semibold">Image uploaded successfully</span>
          </div>
          <p className="text-sm">Format: {analysis.format}</p>
          <p className="text-sm">Size: {analysis.size[0]} x {analysis.size[1]}</p>
          <p className="text-sm text-gray-600 mt-2">{analysis.message}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4">Document Upload & Analysis</h3>
      <p className="text-gray-600 mb-6">
        Upload bank statements, passports, or other documents for automated analysis
      </p>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf,.png,.jpg,.jpeg"
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-semibold mb-2">
            {file ? file.name : 'Click to upload or drag and drop'}
          </p>
          <p className="text-sm text-gray-500">
            PDF, PNG, JPG up to 10MB
          </p>
        </label>
      </div>

      {file && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FileText className="w-5 h-5" />
            {uploading ? 'Analyzing...' : 'Analyze Document'}
          </button>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          {error}
        </div>
      )}

      {analysis && (
        <div className="mt-6">
          {renderAnalysis()}
        </div>
      )}
    </div>
  );
}