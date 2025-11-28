import React from 'react';
import { Download, Loader2, Play } from 'lucide-react';
import { clsx } from 'clsx';

interface ActionPanelProps {
    onProcess: () => void;
    onDownload: () => void;
    canProcess: boolean;
    canDownload: boolean;
    isProcessing: boolean;
}

export function ActionPanel({ onProcess, onDownload, canProcess, canDownload, isProcessing }: ActionPanelProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg md:relative md:bg-transparent md:border-0 md:shadow-none md:p-0 md:mt-8">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row gap-4 justify-end">
                <button
                    onClick={onProcess}
                    disabled={!canProcess || isProcessing}
                    className={clsx(
                        "flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                        !canProcess || isProcessing
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg active:scale-95"
                    )}
                >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
                    {isProcessing ? 'Processing...' : 'Process File'}
                </button>

                {canDownload && (
                    <button
                        onClick={onDownload}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transition-all active:scale-95 animate-in fade-in slide-in-from-bottom-4"
                    >
                        <Download size={20} />
                        Download ZIP
                    </button>
                )}
            </div>
        </div>
    );
}
