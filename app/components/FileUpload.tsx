
import React, { useState, useCallback, useMemo } from 'react';
import { FileText, ImageIcon, Music, Video, UploadCloud, X } from './Icons';

interface FileUploadProps {
    onFilesChange: (files: File[]) => void;
}

const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-purple-400" />;
    if (fileType.startsWith('audio/')) return <Music className="h-6 w-6 text-pink-400" />;
    if (fileType.startsWith('video/')) return <Video className="h-6 w-6 text-red-400" />;
    return <FileText className="h-6 w-6 text-blue-400" />;
};

const formatBytes = (bytes: number, decimals = 2): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const FileUpload: React.FC<FileUploadProps> = ({ onFilesChange }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = useCallback((incomingFiles: FileList | null) => {
        if (incomingFiles) {
            const newFiles = Array.from(incomingFiles);
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            onFilesChange(updatedFiles);
        }
    }, [files, onFilesChange]);

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    const removeFile = (index: number) => {
        const updatedFiles = files.filter((_, i) => i !== index);
        setFiles(updatedFiles);
        onFilesChange(updatedFiles);
    };

    const fileList = useMemo(() => (
        <div className="mt-4 space-y-3">
            {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                    <div className="flex-shrink-0">{getFileIcon(file.type)}</div>
                    <div className="ml-4 flex-grow truncate">
                        <p className="text-sm font-medium text-gray-200 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatBytes(file.size)}</p>
                    </div>
                    <button onClick={() => removeFile(index)} className="ml-4 p-1 rounded-full hover:bg-gray-600 transition-colors">
                        <X className="h-5 w-5 text-gray-400 hover:text-white" />
                    </button>
                </div>
            ))}
        </div>
    ), [files, onFilesChange]);


    return (
        <div>
            <div
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isDragging ? 'border-blue-500 bg-gray-700/50' : 'border-gray-600 hover:border-gray-500'}`}
            >
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept=".txt,.pdf,.docx,.png,.jpg,.jpeg,.webp,.m4a,.mp3,.wav,.ogg,.mp4,.mov,.webm"
                />
                <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                    <UploadCloud className={`h-12 w-12 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`} />
                    <p className="font-semibold text-gray-300">Drag & drop files here</p>
                    <p>or <span className="text-blue-400 font-semibold">click to browse</span></p>
                </div>
            </div>
            {files.length > 0 && fileList}
        </div>
    );
};
