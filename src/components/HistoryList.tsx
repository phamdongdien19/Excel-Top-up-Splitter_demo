import React, { useState, useEffect } from 'react';
import { History, FileBarChart, Clock, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

interface HistoryItem {
    projectCode: string;
    fileName: string;
    timestamp: number;
    previewStats?: any;
    report?: string[];
}

interface HistoryListProps {
    onSelect: (projectCode: string) => void;
    currentProjectCode: string;
}

export function HistoryList({ onSelect, currentProjectCode }: HistoryListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

    // Get history only after mount to avoid hydration mismatch
    useEffect(() => {
        const historyMap = JSON.parse(localStorage.getItem('project_history') || '{}');
        const items: HistoryItem[] = Object.keys(historyMap)
            .map(code => ({
                projectCode: code,
                fileName: historyMap[code].fileName || `Historical Data (${code})`,
                timestamp: historyMap[code].timestamp,
                previewStats: historyMap[code].previewStats,
                report: historyMap[code].report
            }))
            .sort((a, b) => b.timestamp - a.timestamp);
        setHistoryItems(items);
    }, [currentProjectCode]);

    if (historyItems.length === 0) return null;

    const displayedItems = isExpanded ? historyItems : historyItems.slice(0, 5);

    return (
        <section className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <History size={16} className="text-blue-500" /> Recent Projects
                </h3>
                <span className="text-[10px] bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                    {historyItems.length}
                </span>
            </div>

            <div className="divide-y divide-gray-50">
                {displayedItems.map((item) => (
                    <button
                        key={item.projectCode}
                        onClick={() => onSelect(item.projectCode)}
                        className={`w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors group flex items-center justify-between ${currentProjectCode === item.projectCode ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''
                            }`}
                    >
                        <div className="overflow-hidden">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-gray-900">{item.projectCode}</span>
                                <span className="text-[10px] text-gray-400 font-medium truncate italic max-w-[150px]">
                                    {item.fileName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock size={10} className="text-gray-400" />
                                <span className="text-[10px] text-gray-400">
                                    {new Date(item.timestamp).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <ExternalLink size={14} className="text-gray-300 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                ))}
            </div>

            {historyItems.length > 5 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="w-full py-2 bg-gray-50/50 text-[11px] font-bold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-100"
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp size={14} /></>
                    ) : (
                        <>Show All History ({historyItems.length - 5} more) <ChevronDown size={14} /></>
                    )}
                </button>
            )}
        </section>
    );
}
