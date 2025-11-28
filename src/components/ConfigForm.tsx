import React from 'react';
import { Settings } from 'lucide-react';

interface ConfigFormProps {
    config: {
        projectCode: string;
        headers: any;
    };
    onChange: (newConfig: any) => void;
}

export function ConfigForm({ config, onChange }: ConfigFormProps) {
    const handleChange = (key: string, value: string) => {
        onChange({
            ...config,
            [key]: value
        });
    };

    const handleHeaderChange = (key: string, value: string) => {
        onChange({
            ...config,
            headers: {
                ...config.headers,
                [key]: value
            }
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Settings size={20} className="text-gray-500" />
                <h2 className="font-semibold text-gray-700">Configuration</h2>
            </div>

            <div className="p-6 space-y-6">
                {/* Project Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project Code (Prefix)
                    </label>
                    <input
                        type="text"
                        value={config.projectCode}
                        onChange={(e) => handleChange('projectCode', e.target.value)}
                        placeholder="e.g. 123456"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Leave empty to auto-detect from file name (6 digits).
                    </p>
                </div>

                {/* Headers Configuration (Collapsible or just list) */}
                <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Column Headers Mapping</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(config.headers).map(([key, value]) => (
                            <div key={key}>
                                <label className="block text-xs font-medium text-gray-500 mb-1 capitalize">
                                    {key.replace(/_/g, ' ')}
                                </label>
                                <input
                                    type="text"
                                    value={value as string}
                                    onChange={(e) => handleHeaderChange(key, e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
