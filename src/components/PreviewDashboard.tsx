import React from 'react';
import { BarChart3, CheckCircle2, DollarSign, FileText, Ban, Mail, MessageSquare, PlusSquare, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { ProcessedResult } from '@/lib/processor';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const COLORS = [
    '#3b82f6', // blue-500
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#ef4444', // red-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#06b6d4', // cyan-500
    '#f97316', // orange-500
];

const COST_COLORS: Record<string, string> = {
    'IFM Evouchers': '#10b981',
    'Referrers': '#3b82f6',
    'Vendors': '#8b5cf6',
    'Extra Services': '#f59e0b'
};

interface PreviewDashboardProps {
    result: ProcessedResult | null;
    isLoading: boolean;
    vendorCpis: Record<string, number>;
    onCpiChange: (vendor: string, cpi: number) => void;
    smsCost: number;
    setSmsCost: (val: number) => void;
    emailCost: number;
    setEmailCost: (val: number) => void;
    otherCost: number;
    setOtherCost: (val: number) => void;
}

const EXCHANGE_RATE = 26000;

export function PreviewDashboard({
    result,
    isLoading,
    vendorCpis,
    onCpiChange,
    smsCost,
    setSmsCost,
    emailCost,
    setEmailCost,
    otherCost,
    setOtherCost
}: PreviewDashboardProps) {
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

    // Calculate Costs Dynamically (so it's reactive when viewing history)
    const totalVendorCostUsd = Object.entries(previewStats.countsBySrc).reduce((sum, [src, count]) => {
        if (src.startsWith('pp_')) {
            return sum + (count * (vendorCpis[src] || 0));
        }
        return sum;
    }, 0);

    const totalVendorCostVnd = totalVendorCostUsd * EXCHANGE_RATE;
    const totalEvoucherVnd = previewStats.totalEvoucherSum;
    const totalReferralVnd = previewStats.totalReferralSum;

    const grandTotalVnd = totalVendorCostVnd + totalEvoucherVnd + totalReferralVnd + smsCost + emailCost + otherCost;

    // Data for Charts
    const completesData = Object.entries(previewStats.countsBySrc)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

    const budgetData = [
        { name: 'IFM Evouchers', value: totalEvoucherVnd, fill: COST_COLORS['IFM Evouchers'] },
        { name: 'Referrers', value: totalReferralVnd, fill: COST_COLORS['Referrers'] },
        { name: 'Vendors', value: totalVendorCostVnd, fill: COST_COLORS['Vendors'] },
        { name: 'Extra Services', value: smsCost + emailCost + otherCost, fill: COST_COLORS['Extra Services'] }
    ].filter(d => d.value > 0);

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
                        <p className="text-sm text-gray-500 font-medium">Internal Costs (VND)</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {(totalEvoucherVnd + totalReferralVnd).toLocaleString('vi-VN')}
                        </h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Vendor Costs (USD)</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            ${totalVendorCostUsd.toLocaleString()}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Main Report Section */}
            <div className="bg-white rounded-xl border-2 border-blue-100 shadow-lg overflow-hidden">
                <div className="bg-blue-600 px-6 py-4 flex items-center justify-between text-white">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={20} />
                        <h3 className="font-bold text-lg">Detailed Project Cost Report</h3>
                    </div>
                    <span className="text-xs bg-blue-500 px-2 py-1 rounded">Rate: $1 = {EXCHANGE_RATE.toLocaleString()} VND</span>
                </div>

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Breakdown Column */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Baseline Costs (Actual)</h4>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Total Evoucher (Panel IFM)</span>
                                <span className="font-semibold text-gray-900">{totalEvoucherVnd.toLocaleString()} VND</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Total Referrers</span>
                                <span className="font-semibold text-gray-900">{totalReferralVnd.toLocaleString()} VND</span>
                            </div>

                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-4">Calculated Costs (Estimated)</h4>
                            <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                <span className="text-gray-600">Total Vendors (${totalVendorCostUsd.toLocaleString()})</span>
                                <span className="font-semibold text-gray-900">{totalVendorCostVnd.toLocaleString()} VND</span>
                            </div>
                        </div>

                        {/* Additional Services Column */}
                        <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Additional Services</h4>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <MessageSquare size={16} className="text-gray-400" />
                                    <label className="text-sm flex-1 text-gray-600">SMS Export</label>
                                    <input
                                        type="number"
                                        value={smsCost || ''}
                                        onChange={(e) => setSmsCost(parseInt(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 text-right border rounded bg-white text-gray-900 font-medium"
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-gray-400 w-8">VND</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-gray-400" />
                                    <label className="text-sm flex-1 text-gray-600">Email Send</label>
                                    <input
                                        type="number"
                                        value={emailCost || ''}
                                        onChange={(e) => setEmailCost(parseInt(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 text-right border rounded bg-white text-gray-900 font-medium"
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-gray-400 w-8">VND</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <PlusSquare size={16} className="text-gray-400" />
                                    <label className="text-sm flex-1 text-gray-600">Others</label>
                                    <input
                                        type="number"
                                        value={otherCost || ''}
                                        onChange={(e) => setOtherCost(parseInt(e.target.value) || 0)}
                                        className="w-24 px-2 py-1 text-right border rounded bg-white text-gray-900 font-medium"
                                        placeholder="0"
                                    />
                                    <span className="text-xs text-gray-400 w-8">VND</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t-2 border-blue-50 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-center md:text-left">
                            <p className="text-gray-500 text-sm">Preliminary Total Cost Estimate</p>
                            <p className="text-xs text-gray-400">Including evouchers, referrals, and external vendors</p>
                        </div>
                        <div className="bg-blue-50 px-8 py-4 rounded-2xl border border-blue-100 flex flex-col items-end">
                            <div className="flex items-center gap-4">
                                <span className="text-blue-600 font-bold text-xl">TOTAL:</span>
                                <span className="text-4xl font-black text-blue-800">{grandTotalVnd.toLocaleString()} VND</span>
                            </div>
                            {Object.entries(previewStats.countsBySrc).some(([src, count]) => src.startsWith('pp_') && count > 0 && !vendorCpis[src]) && (
                                <p className="text-[10px] text-red-500 font-bold mt-1 animate-pulse">
                                    ⚠️ Some vendors are missing CPI values!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Completes Distribution */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp size={20} className="text-blue-500" />
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Completes Distribution</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={completesData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {completesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Chart 2: Budget Allocation */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon size={20} className="text-emerald-500" />
                        <h3 className="font-bold text-gray-700 uppercase text-xs tracking-wider">Budget Allocation (VND)</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={budgetData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {budgetData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any) => `${Number(value).toLocaleString()} VND`}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Breakdown Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={20} className="text-gray-500" />
                        <h3 className="font-semibold text-gray-700">Detailed Breakdown by Source</h3>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                            <tr>
                                <th className="px-6 py-4">Source Group</th>
                                <th className="px-6 py-4 text-right">Completes</th>
                                <th className="px-6 py-4 text-center">CPI Control</th>
                                <th className="px-6 py-4 text-right">Est. Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {Object.entries(previewStats.countsBySrc).sort().map(([src, count]) => {
                                const isPPVendor = src.startsWith('pp_');
                                const cpi = vendorCpis[src] || 0;
                                const costUsd = isPPVendor ? count * cpi : 0;
                                const costVndPerSrc = isPPVendor ? (costUsd * EXCHANGE_RATE) : 0;

                                // Calculate average incentive for internal sources
                                const totalIncentive = previewStats.incentiveSumBySrc[src] || 0;
                                const avgIncentive = count > 0 ? Math.round(totalIncentive / count) : 0;

                                return (
                                    <tr key={src} className={`${!isPPVendor ? 'bg-amber-50/30' : 'hover:bg-gray-50'} transition-colors`}>
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-[200px] truncate">
                                            {src === '' ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-400 italic font-normal">(blank)</span>
                                                    <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold">IFM</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span>{src}</span>
                                                    {!isPPVendor && (
                                                        <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold uppercase">Actual</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-gray-700 font-semibold">{count.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-center">
                                            {isPPVendor ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <span className="text-gray-400 text-xs">$</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={vendorCpis[src] || ''}
                                                            onChange={(e) => onCpiChange(src, parseFloat(e.target.value) || 0)}
                                                            placeholder="0.00"
                                                            className={`w-20 px-2 py-1 text-right border ${!vendorCpis[src] && count > 0 ? 'border-red-300 bg-red-50' : 'border-gray-300'} rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-gray-950`}
                                                        />
                                                    </div>
                                                    {!vendorCpis[src] && count > 0 && <span className="text-[9px] text-red-500 font-bold uppercase">Missing CPI</span>}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center text-amber-600">
                                                    <span className="font-bold text-xs">{avgIncentive.toLocaleString()} VND</span>
                                                    <span className="text-[9px] uppercase font-bold opacity-70">Avg. Incentive</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-medium">
                                            {isPPVendor ? (
                                                <div className="flex flex-col">
                                                    <span className="text-gray-900">${costUsd.toLocaleString()}</span>
                                                    <span className="text-[10px] text-gray-400 font-normal">≈ {costVndPerSrc.toLocaleString()} VND</span>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col">
                                                    <span className="text-amber-700 text-xs font-bold">{totalIncentive.toLocaleString()} VND</span>
                                                    <span className="text-[9px] text-amber-600/60 uppercase">Total Survey Pay</span>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                            {Object.keys(previewStats.countsBySrc).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 italic">
                                        No complete records found in the uploaded file.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                        {Object.keys(previewStats.countsBySrc).length > 0 && (
                            <tfoot className="bg-gray-50/80 border-t-2 border-gray-200">
                                <tr>
                                    <td className="px-6 py-4 font-black text-gray-900 uppercase tracking-wider">TOTAL</td>
                                    <td className="px-6 py-4 text-right text-blue-700 font-black text-base">
                                        {previewStats.totalComplete.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center text-gray-400">-</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col">
                                            <span className="text-blue-800 font-black text-base">
                                                {(totalVendorCostVnd + totalEvoucherVnd + totalReferralVnd).toLocaleString()} VND
                                            </span>
                                            <span className="text-[10px] text-gray-400 font-normal uppercase">Sum of Est. Cost</span>
                                        </div>
                                    </td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>

            {/* Generated Files List (Preview) */}
            {result.report.length > 0 && (
                <div className="bg-gray-900 rounded-xl p-6 shadow-xl overflow-hidden border border-gray-800">
                    <h4 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                        <FileText size={16} className="text-blue-400" /> Package Contents ({result.report.length})
                    </h4>
                    <div className="space-y-2">
                        {result.report.map((line, i) => {
                            // Extract row count if exists: filename.xlsx (N rows)
                            const match = line.match(/(.*)\s\((.*)\)/);
                            const filename = match ? match[1] : line;
                            const details = match ? match[2] : '';

                            return (
                                <div key={i} className="group flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 p-3 rounded-lg border border-gray-700/50 transition-all">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="p-1.5 bg-blue-500/10 rounded text-blue-400">
                                            <FileText size={14} />
                                        </div>
                                        <span className="text-xs font-mono text-gray-300 truncate">{filename}</span>
                                    </div>
                                    {details && (
                                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                                            {details}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
