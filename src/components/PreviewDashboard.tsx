import React from 'react';
import { BarChart3, CheckCircle2, DollarSign, FileText } from 'lucide-react';
import { ProcessedResult } from '@/lib/processor';

interface PreviewDashboardProps {
    result: ProcessedResult | null;
    isLoading: boolean;
    vendorCpis: Record<string, number>;
    onCpiChange: (vendor: string, cpi: number) => void;
}

export function PreviewDashboard({ result, isLoading, vendorCpis, onCpiChange }: PreviewDashboardProps) {
    if (isLoading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-24 bg-gray-200 rounded-xl"></div>
                <div className="h-64 bg-gray-200 rounded-xl"></div>
            </div>
        );
    }

    if (!result) return null;

    const { previewStats } = result;

    // Calculate Grand Total Cost of all vendors
    const grandTotalVendorCost = Object.values(previewStats.vendorCosts).reduce((a, b) => a + b, 0);

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Complete</p>
                        <h3 className="text-2xl font-bold text-gray-900">{previewStats.totalComplete}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Evoucher Sum</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {previewStats.totalEvoucherSum.toLocaleString('vi-VN')} VND
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Vendor Cost</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            ${grandTotalVendorCost.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-700">Breakdown by Source</h3>
                    </div>
                    <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        Enter CPI for <strong>pp_</strong> vendors to estimate cost
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Source</th>
                                <th className="px-6 py-3 text-right">Count</th>
                                <th className="px-6 py-3 text-right">CPI ($)</th>
                                <th className="px-6 py-3 text-right">Total Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {Object.entries(previewStats.countsBySrc).sort().map(([src, count]) => {
                                const isPPVendor = src.startsWith('pp_');
                                const cost = previewStats.vendorCosts[src] || 0;

                                return (
                                    <tr key={src} className="hover:bg-gray-50">
                                        <td className="px-6 py-3 font-medium text-gray-900">
                                            {src === '' ? <span className="text-gray-400 italic">(blank)</span> : src}
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-600">{count}</td>
                                        <td className="px-6 py-3 text-right">
                                            {isPPVendor ? (
                                                <input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={vendorCpis[src] || ''}
                                                    onChange={(e) => onCpiChange(src, parseFloat(e.target.value) || 0)}
                                                    placeholder="0.00"
                                                    className="w-20 px-2 py-1 text-right border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                />
                                            ) : (
                                                <span className="text-gray-300">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3 text-right font-medium text-gray-900">
                                            {cost > 0 ? `$${cost.toLocaleString()}` : <span className="text-gray-300">-</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                            {Object.keys(previewStats.countsBySrc).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">
                                        No complete records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generated Files List (Preview) */}
            {result.report.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FileText size={16} /> Generated Files Preview:
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1 font-mono">
                        {result.report.map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
