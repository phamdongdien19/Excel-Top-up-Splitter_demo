'use client';

import React, { useState } from 'react';
import { PreviewDashboard } from '@/components/PreviewDashboard';
import { ActionPanel } from '@/components/ActionPanel';
import { ProcessedResult } from '@/lib/processor';
import { LayoutDashboard, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';

// --- Static Dummy Data ---
const DUMMY_RESULT: ProcessedResult = {
    zipBlob: new Blob(), // Not used in preview
    report: [
        'complete-topup-evoucher_gotit-156-4680000.xlsx (156 rows)',
        'referrer-42-1260000.xlsx (42 rows)',
        'pp_purespectrum-85-cpi1.5.xlsx (85 rows)',
        'pp_fulcrum-120-cpi2.0.xlsx (120 rows)',
        'pp_dynata-45-cpi1.8.xlsx (45 rows)',
        'zalogroup-32.xlsx (32 rows)',
        'fulcrum_120-cpi2.0.txt',
        'evoucher_gotit-merged-198-5940000.csv'
    ],
    previewStats: {
        totalComplete: 480,
        totalEvoucherSum: 4680000,
        totalReferralSum: 1260000,
        countsBySrc: {
            '': 124,           // Internal
            'zalogroup': 32,
            'referral': 42,
            'pp_purespectrum': 85,
            'pp_fulcrum': 120,
            'pp_dynata': 45,
            'pp_lucid': 32
        },
        incentiveSumBySrc: {
            '': 3720000,
            'zalogroup': 960000,
            'referral': 1260000,
            'pp_purespectrum': 0,
            'pp_fulcrum': 0,
            'pp_dynata': 0,
            'pp_lucid': 0
        },
        vendorCosts: {
            'pp_purespectrum': 127.5,
            'pp_fulcrum': 240,
            'pp_dynata': 81,
            'pp_lucid': 0 // To showcase missing CPI warning
        }
    }
};

const INITIAL_VENDOR_CPIS: Record<string, number> = {
    'pp_purespectrum': 1.5,
    'pp_fulcrum': 2.0,
    'pp_dynata': 1.8,
    'pp_lucid': 0 // Showcase warning
};

export default function DemoPage() {
    const [vendorCpis, setVendorCpis] = useState<Record<string, number>>(INITIAL_VENDOR_CPIS);
    const [smsCost, setSmsCost] = useState<number>(150000);
    const [emailCost, setEmailCost] = useState<number>(50000);
    const [otherCost, setOtherCost] = useState<number>(200000);

    const handleCpiChange = (vendor: string, cpi: number) => {
        setVendorCpis(prev => ({ ...prev, [vendor]: cpi }));
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24 md:pb-8">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500">
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <LayoutDashboard size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-900 leading-none">Excel Top-up Splitter</h1>
                            <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Interactive Demo Mode</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-100 rounded-full">
                            <Info size={14} className="text-amber-600" />
                            <span className="text-xs font-medium text-amber-700">Displaying Sample Data</span>
                        </div>
                        <div className="text-sm text-gray-400">v1.1.0-demo</div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Demo Notice */}
                <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center md:text-left">
                            <h2 className="text-2xl font-black tracking-tight">Showcase Dashboard</h2>
                            <p className="text-indigo-100 text-sm max-w-xl">
                                This page displays sample data so recruiters can experience live reporting,
                                charting, and cost calculation features without uploading an actual Excel file.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                href="/"
                                className="px-6 py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-sm hover:bg-indigo-50 transition-all flex items-center gap-2 text-sm"
                            >
                                <ArrowLeft size={16} />
                                Back to Home
                            </Link>
                            <a
                                href="https://github.com/phamdongdien19/Excel-Top-up-Splitter_v1"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-indigo-500/30 backdrop-blur-md border border-indigo-400 text-white font-bold rounded-xl hover:bg-indigo-500/40 transition-all flex items-center gap-2 text-sm"
                            >
                                <ExternalLink size={16} />
                                View Source Code
                            </a>
                        </div>
                    </div>
                    {/* Abstract background elements */}
                    <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                    {/* Preview Area */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 border-l-4 border-indigo-600 pl-3">Live Reporting Preview</h2>
                            <div className="flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-tighter">Live Demo Environment</span>
                            </div>
                        </div>

                        <PreviewDashboard
                            result={DUMMY_RESULT}
                            isLoading={false}
                            vendorCpis={vendorCpis}
                            onCpiChange={handleCpiChange}
                            smsCost={smsCost}
                            setSmsCost={setSmsCost}
                            emailCost={emailCost}
                            setEmailCost={setEmailCost}
                            otherCost={otherCost}
                            setOtherCost={setOtherCost}
                        />
                    </div>
                </div>
            </div>

            <ActionPanel
                onProcess={() => alert('Demo Mode: File processing is disabled.')}
                onDownload={() => alert('Demo Mode: Download feature is disabled.')}
                canProcess={false}
                canDownload={true}
                isProcessing={false}
            />
        </main>
    );
}
