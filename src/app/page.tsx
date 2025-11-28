'use client';

import React, { useState, useEffect } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { ConfigForm } from '@/components/ConfigForm';
import { PreviewDashboard } from '@/components/PreviewDashboard';
import { ActionPanel } from '@/components/ActionPanel';
import { processExcelFile, Config, ProcessedResult } from '@/lib/processor';
import { FileText, LayoutDashboard } from 'lucide-react';

const DEFAULT_CONFIG: Config = {
  projectCode: '',
  headers: {
    src: 'src - source',
    response_id: 'Response ID',
    db_mobile: 'db.mobile',
    complete_incentive: 'complete incentive',
    pprid: "pprid - panel provider's respondent id",
    ref: 'ref - referrer',
    referral_incentive: 'referral incentive',
    status: 'Status'
  }
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-process for preview when file or config changes
  useEffect(() => {
    if (file) {
      handleProcess(true);
    } else {
      setResult(null);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, config.projectCode]); // Don't re-process on every header keystroke, maybe? Or debounce.
  // For simplicity, let's process on explicit action or file change.
  // Actually, user asked for "Preview", so maybe auto-preview is good.
  // But processing might be heavy for large files. Let's do it on file drop and have a button for "Refresh Preview" or just rely on "Process" button to do both?
  // The plan said "Preview Dashboard".
  // Let's make "Process" button generate the ZIP, but we try to generate stats immediately if possible.
  // Or better: "Analyze" step first?
  // Let's stick to: Upload -> Auto Analyze (Preview) -> User clicks Process to Download.

  const handleProcess = async (isPreviewOnly: boolean = false) => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await processExcelFile(file, config);
      setResult(res);

      if (!isPreviewOnly) {
        // Trigger download
        const blob = res.zipBlob;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `processed_files_${config.projectCode || 'export'}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while processing the file.");
      setResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg text-white">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Excel Top-up Splitter</h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
            v1.0.0
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Input & Config */}
          <div className="space-y-6 lg:col-span-1">
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} /> Input File
              </h2>
              <FileUploader
                selectedFile={file}
                onFileSelect={setFile}
                onClear={() => { setFile(null); setResult(null); setError(null); }}
              />
            </section>

            <section>
              <ConfigForm
                config={config}
                onChange={setConfig}
              />
            </section>
          </div>

          {/* Right Column: Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Preview & Results</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!file && !error && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                <p>Upload a file to see the preview.</p>
              </div>
            )}

            {file && (
              <PreviewDashboard
                result={result}
                isLoading={isProcessing && !result}
              />
            )}
          </div>
        </div>
      </div>

      <ActionPanel
        onProcess={() => handleProcess(false)}
        onDownload={() => handleProcess(false)} // Same action for now, or separate if we store blob
        canProcess={!!file && !error}
        canDownload={!!result} // If result exists, we can download (re-generate or use stored)
        isProcessing={isProcessing}
      />
    </main>
  );
}
