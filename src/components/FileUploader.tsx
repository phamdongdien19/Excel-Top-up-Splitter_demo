import React, { useCallback } from 'react';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface FileUploaderProps {
    onFileSelect: (file: File) => void;
    selectedFile: File | null;
    onClear: () => void;
}

export function FileUploader({ onFileSelect, selectedFile, onClear }: FileUploaderProps) {
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
                onFileSelect(file);
            } else {
                alert('Please upload an Excel file (.xlsx)');
            }
        }
    }, [onFileSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileSelect(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {!selectedFile ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className={twMerge(
                        "border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-blue-500 transition-colors cursor-pointer bg-gray-50 hover:bg-blue-50",
                        "flex flex-col items-center justify-center gap-4"
                    )}
                    onClick={() => document.getElementById('file-input')?.click()}
                >
                    <div className="p-4 bg-blue-100 rounded-full text-blue-600">
                        <Upload size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700">Upload Excel File</h3>
                        <p className="text-sm text-gray-500 mt-1">Drag & drop or click to browse</p>
                    </div>
                    <input
                        id="file-input"
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleChange}
                    />
                </div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-100 rounded-lg text-green-600">
                            <FileSpreadsheet size={24} />
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-900">{selectedFile.name}</h3>
                            <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                    </div>
                    <button
                        onClick={onClear}
                        className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>
            )}
        </div>
    );
}
