import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ReportDisplay } from './components/ReportDisplay';
import { Loader } from './components/Loader';
import { generateReport } from './services/geminiService';
import type { CaseReport } from './types';
import { AlertTriangle, CheckCircle, RefreshCw } from './components/Icons';

const App: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [report, setReport] = useState<CaseReport | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleFilesChange = useCallback((newFiles: File[]) => {
        setFiles(newFiles);
        setError(null);
    }, []);

    const handleGenerateReport = async () => {
        if (files.length === 0) {
            setError("Please upload at least one file to analyze.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setReport(null);
        try {
            const result = await generateReport(files);
            setReport(result);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Failed to generate report. ${errorMessage}. Please check the console for details and ensure your API key is configured correctly.`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartNewCase = () => {
        setFiles([]);
        setReport(null);
        setError(null);
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <Header />
                <main className="mt-8">
                    {error && (
                        <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg flex items-center" role="alert">
                            <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0" />
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {isLoading && (
                         <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-800 border border-gray-700 rounded-lg">
                              <Loader />
                              <p className="mt-4 text-lg text-blue-300">Analyzing evidence... This may take a moment.</p>
                              <p className="text-gray-400">Your files are being processed by the AI. Please do not navigate away.</p>
                          </div>
                    )}

                    {!isLoading && !report && (
                         <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-2xl">
                             <h2 className="text-xl font-semibold text-blue-300 mb-4">Step 1: Upload Evidence</h2>
                             <p className="text-gray-400 mb-6">
                                 Upload documents (.txt, .pdf, .docx), images (.png, .jpg), audio (.mp3, .m4a), or video (.mp4) files. The AI will process the content to identify relevant evidence.
                             </p>
                             <FileUpload onFilesChange={handleFilesChange} />
                             
                             {!error && files.length > 0 && (
                                <div className="mt-6 bg-green-900/50 border border-green-700 text-green-200 px-4 py-3 rounded-lg flex items-center" role="status">
                                    <CheckCircle className="h-5 w-5 mr-3" />
                                    <span className="block sm:inline">{files.length} {files.length === 1 ? 'file is' : 'files are'} ready. Click "Generate Report" to begin analysis.</span>
                                </div>
                             )}

                             <div className="mt-6 flex justify-end">
                                 <button
                                     onClick={handleGenerateReport}
                                     disabled={files.length === 0}
                                     className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 flex items-center"
                                 >
                                     Step 2: Generate Fraud Report
                                 </button>
                             </div>
                         </div>
                    )}
                    
                    {report && !isLoading && (
                        <>
                            <div className="flex justify-between items-center mb-6 no-print">
                                <h2 className="text-xl font-semibold text-blue-300">Step 3: Review & Export Report</h2>
                                <button
                                    onClick={handleStartNewCase}
                                    className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-500 transition-all duration-300 flex items-center"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Start New Case
                                </button>
                            </div>
                            <ReportDisplay report={report} />
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
