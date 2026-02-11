import React, { useState } from 'react';
import { Info, CheckCircle2, ChevronDown, ChevronUp, Star } from 'lucide-react';

export function FileRequirementGuide() {
    const [isOpen, setIsOpen] = useState(false);

    const requirements = [
        { label: 'src - source', desc: 'Category of respondents (e.g., pp_vendor, referral)', required: true },
        { label: 'Response ID', desc: 'Unique identifier for each record', required: true },
        { label: 'Status', desc: 'Rows must be "Complete" or "Completed" to be processed', required: true },
        { label: 'db.mobile', desc: 'Phone numbers for top-up (VND calculation)', required: true },
        { label: 'complete incentive', desc: 'The reward amount for completion', required: true },
        { label: 'pprid', desc: 'ID for Panel Provider vendors (optional)', required: false },
        { label: 'ref - referrer', desc: 'Source for referral programs (optional)', required: false },
        { label: 'referral incentive', desc: 'Incentive for the referrer (optional)', required: false },
    ];

    return (
        <div className="mb-6">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group"
            >
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-600 text-white rounded-lg group-hover:scale-110 transition-transform">
                        <Info size={18} />
                    </div>
                    <div className="text-left">
                        <h3 className="font-bold text-blue-900 text-sm">File Requirements Guide</h3>
                        <p className="text-xs text-blue-700 opacity-80">Click to see required Excel columns</p>
                    </div>
                </div>
                {isOpen ? <ChevronUp size={20} className="text-blue-600" /> : <ChevronDown size={20} className="text-blue-600" />}
            </button>

            {isOpen && (
                <div className="mt-2 p-5 bg-white border border-gray-100 rounded-xl shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Star size={14} className="text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mandatory Columns</span>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            {requirements.map((req, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/50 border border-transparent hover:border-gray-200 transition-all">
                                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${req.required ? 'bg-red-500' : 'bg-gray-300'}`} title={req.required ? 'Required' : 'Optional'}></div>
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-800 font-mono italic">
                                            {req.label}
                                            {req.required && <span className="text-red-500 ml-1">*</span>}
                                        </h4>
                                        <p className="text-[11px] text-gray-500 mt-0.5">{req.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                            <p className="text-[10px] text-amber-800 leading-relaxed">
                                <span className="font-bold uppercase">Pro Tip:</span> The system uses "Smart Matching" but works best if your column headers match these names exactly. Case-insensitive.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
