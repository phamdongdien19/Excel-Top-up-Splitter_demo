'use client';

import React, { useState, useEffect } from 'react';
import { FileUploader } from '@/components/FileUploader';
import { ConfigForm } from '@/components/ConfigForm';
import { PreviewDashboard } from '@/components/PreviewDashboard';
import { ActionPanel } from '@/components/ActionPanel';
import { HistoryList } from '@/components/HistoryList';
import { processExcelFile, Config, ProcessedResult } from '@/lib/processor';
import { FileText, LayoutDashboard, History } from 'lucide-react';

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
  const [vendorCpis, setVendorCpis] = useState<Record<string, number>>({});
  const [smsCost, setSmsCost] = useState<number>(0);
  const [emailCost, setEmailCost] = useState<number>(0);
  const [otherCost, setOtherCost] = useState<number>(0);
  const [result, setResult] = useState<ProcessedResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyUpdateKey, setHistoryUpdateKey] = useState(0);

  const loadProjectData = (projectData: any) => {
    if (projectData.headers) setConfig(prev => ({ ...prev, headers: projectData.headers }));
    if (projectData.vendorCpis) setVendorCpis(projectData.vendorCpis);
    if (projectData.smsCost !== undefined) setSmsCost(projectData.smsCost);
    if (projectData.emailCost !== undefined) setEmailCost(projectData.emailCost);
    if (projectData.otherCost !== undefined) setOtherCost(projectData.otherCost);

    if (projectData.previewStats) {
      setResult({
        zipBlob: new Blob(), // Placeholder
        report: projectData.report || [],
        previewStats: projectData.previewStats
      });
    }
  };

  const handleHistorySelect = (projectCode: string) => {
    console.log("Selecting history project:", projectCode); // Debug
    const history = JSON.parse(localStorage.getItem('project_history') || '{}');
    const projectData = history[projectCode];
    if (projectData) {
      setError(null);
      setFile(null);
      setConfig(prev => ({ ...prev, projectCode }));
      loadProjectData(projectData);
    }
  };

  const handleHistoryDelete = (projectCode: string) => {
    const history = JSON.parse(localStorage.getItem('project_history') || '{}');
    delete history[projectCode];
    localStorage.setItem('project_history', JSON.stringify(history));

    // If it was the current one, clear it
    if (config.projectCode === projectCode) {
      setResult(null);
      setConfig(DEFAULT_CONFIG);
      setVendorCpis({});
    }
    setHistoryUpdateKey(prev => prev + 1);
  };

  // Get active filename for title
  const getActiveFileName = () => {
    if (file) return file.name;
    const history = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('project_history') || '{}') : {};
    return history[config.projectCode]?.fileName || '';
  };

  const activeFileName = getActiveFileName();

  // Save current config to localStorage
  const saveProjectToHistory = (processedRes?: ProcessedResult) => {
    if (!config.projectCode) return;

    const history = JSON.parse(localStorage.getItem('project_history') || '{}');
    const existing = history[config.projectCode] || {};

    history[config.projectCode] = {
      ...existing,
      headers: config.headers,
      vendorCpis,
      smsCost,
      emailCost,
      otherCost,
      fileName: file ? file.name : (existing.fileName || 'Unknown'),
      previewStats: processedRes ? processedRes.previewStats : existing.previewStats,
      report: processedRes ? processedRes.report : existing.report,
      timestamp: Date.now()
    };

    // Keep only last 50 projects
    const keys = Object.keys(history).sort((a, b) => history[b].timestamp - history[a].timestamp);
    if (keys.length > 50) {
      keys.slice(50).forEach(k => delete history[k]);
    }

    localStorage.setItem('project_history', JSON.stringify(history));
    setHistoryUpdateKey(prev => prev + 1);
  };

  // Auto-process for preview when file, project code, or CPIs change
  useEffect(() => {
    if (file) {
      handleProcess(true);
    } else if (result) {
      // If we have a result (loaded from history) but no file, we still save metadata if costs change
      saveProjectToHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, config.projectCode, vendorCpis, smsCost, emailCost, otherCost]);

  const handleCpiChange = (vendor: string, cpi: number) => {
    setVendorCpis(prev => ({
      ...prev,
      [vendor]: cpi
    }));
  };

  const handleProcess = async (isPreviewOnly: boolean = false) => {
    if (!file) {
      if (!isPreviewOnly && result) {
        setError("The original Excel file is needed to generate the export. Please re-upload the file.");
      }
      return;
    };

    setIsProcessing(true);
    setError(null);

    try {
      // saveProjectToHistory(); // Removed redundant call

      // Create a combined config with weightings/CPIs
      const fullConfig: Config = {
        ...config,
        vendorCpis
      };

      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));

      const res = await processExcelFile(file, fullConfig);
      setResult(res);
      saveProjectToHistory(res);

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
                onFileSelect={(newFile) => {
                  setFile(newFile);
                  setResult(null); // Clear previous result when new file is added
                  if (newFile) {
                    // Extract leading digits (e.g., 250550 from 250550_Entre_Topup.xlsx)
                    const match = newFile.name.match(/^(\d+)/);
                    if (match) {
                      const detectedCode = match[1];
                      // Always update prefix to avoid mismatching history
                      setConfig(prev => ({ ...prev, projectCode: detectedCode }));
                    }
                  }
                }}
                onClear={() => {
                  setFile(null);
                  setResult(null);
                  setError(null);
                  setVendorCpis({});
                  setSmsCost(0);
                  setEmailCost(0);
                  setOtherCost(0);
                }}
              />
            </section>

            <HistoryList
              onSelect={handleHistorySelect}
              onDelete={handleHistoryDelete}
              currentProjectCode={config.projectCode}
              refreshKey={historyUpdateKey}
            />

            <section>
              <ConfigForm
                config={config}
                onChange={setConfig}
              />
            </section>
          </div>

          {/* Right Column: Preview & Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 border-l-4 border-blue-600 pl-3">Preview & Results</h2>
              </div>
              {activeFileName && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Active Project File</span>
                  <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                    <FileText size={16} />
                    <span className="text-sm font-black font-mono tracking-tight">{activeFileName}</span>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!file && !result && !error && (
              <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-400">
                <p>Upload a file to see the preview.</p>
              </div>
            )}

            {result && (
              <PreviewDashboard
                result={result}
                isLoading={isProcessing && !result}
                vendorCpis={vendorCpis}
                onCpiChange={handleCpiChange}
                smsCost={smsCost}
                setSmsCost={setSmsCost}
                emailCost={emailCost}
                setEmailCost={setEmailCost}
                otherCost={otherCost}
                setOtherCost={setOtherCost}
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
