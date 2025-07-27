import React, { useState, useMemo, useCallback } from 'react';
import type { CaseReport, EvidenceItem, EvidenceTag } from '../types';
import { LEGAL_STATUTES } from '../constants';
import { Download, Printer, Copy, Check, AlertCircle } from './Icons';

interface ReportDisplayProps {
    report: CaseReport;
}

const getConfidenceClass = (confidence: EvidenceItem['confidence']) => {
    switch (confidence?.toLowerCase()) {
        case 'high': return 'bg-green-800 text-green-200';
        case 'medium': return 'bg-yellow-800 text-yellow-200';
        case 'low': return 'bg-gray-600 text-gray-300';
        default: return 'bg-gray-700 text-gray-400';
    }
};

const getTagClass = (tag: EvidenceItem['tag']) => {
    switch (tag) {
        case EvidenceTag.IMMIGRATION_INTENT: return 'bg-red-900 text-red-200';
        case EvidenceTag.FINANCIAL_TRANSACTION: return 'bg-yellow-900 text-yellow-200';
        case EvidenceTag.DECEPTION: return 'bg-purple-900 text-purple-200';
        case EvidenceTag.EMOTIONAL_MANIPULATION: return 'bg-pink-900 text-pink-200';
        case EvidenceTag.ID_DISCREPANCY: return 'bg-indigo-900 text-indigo-200';
        case EvidenceTag.LOVE_DENIAL: return 'bg-rose-900 text-rose-200';
        default: return 'bg-blue-900 text-blue-200';
    }
};

export const ReportDisplay: React.FC<ReportDisplayProps> = ({ report }) => {
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        report.evidenceLog.forEach(item => tags.add(item.tag));
        return Array.from(tags);
    }, [report]);

    const evidence = useMemo(() => {
        if (!activeTag) return report.evidenceLog;
        return report.evidenceLog.filter(item => item.tag === activeTag);
    }, [report, activeTag]);

    const copyItem = useCallback((item: EvidenceItem, idx: number) => {
        navigator.clipboard.writeText(JSON.stringify(item, null, 2));
        setCopiedIndex(idx);
        setTimeout(() => setCopiedIndex(null), 1500);
    }, []);

    const downloadReport = useCallback(() => {
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'case-report.json';
        a.click();
        URL.revokeObjectURL(url);
    }, [report]);

    const printReport = useCallback(() => {
        window.print();
    }, []);

    return (
        <div id="report-container" className="bg-gray-800 border border-gray-700 rounded-lg p-6 shadow-lg print:bg-white print:text-black print:border-gray-300">
            <div className="flex justify-end space-x-2 mb-4 no-print">
                <button onClick={printReport} className="px-3 py-2 bg-gray-700 rounded-md text-sm flex items-center hover:bg-gray-600">
                    <Printer className="w-4 h-4 mr-1" /> Print
                </button>
                <button onClick={downloadReport} className="px-3 py-2 bg-gray-700 rounded-md text-sm flex items-center hover:bg-gray-600">
                    <Download className="w-4 h-4 mr-1" /> Download
                </button>
            </div>

            <h3 className="text-xl font-bold text-blue-300 mb-2">{report.concern}</h3>
            <p className="text-gray-400 mb-4">{report.overview}</p>

            <div className="flex flex-wrap gap-2 mb-4 no-print">
                {availableTags.map(tag => (
                    <button
                        key={tag}
                        onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                        className={`px-2 py-1 rounded-md text-xs ${activeTag === tag ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-200'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            <ul className="space-y-4">
                {evidence.map((item, idx) => (
                    <li key={idx} className="border border-gray-700 rounded-md p-4">
                        <div className="flex justify-between items-start">
                            <span className={`px-2 py-1 text-xs font-semibold rounded ${getTagClass(item.tag)}`}>{item.tag}</span>
                            <button onClick={() => copyItem(item, idx)} className="no-print text-gray-400 hover:text-white">
                                {copiedIndex === idx ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-sm mt-2"><span className="font-semibold">Date:</span> {item.date}</p>
                        <p className="text-sm"><span className="font-semibold">Source:</span> {item.source}</p>
                        <p className="text-sm mt-2">{item.quote}</p>
                        <p className="text-sm mt-2 italic">Statute: {LEGAL_STATUTES[item.statute as keyof typeof LEGAL_STATUTES] || item.statute}</p>
                        <span className={`mt-2 inline-block px-2 py-1 text-xs rounded ${getConfidenceClass(item.confidence)}`}>{item.confidence} confidence</span>
                    </li>
                ))}
                {evidence.length === 0 && (
                    <li className="p-4 bg-gray-700 text-gray-200 rounded-md flex items-center">
                        <AlertCircle className="w-4 h-4 mr-2" /> No evidence for selected tag.
                    </li>
                )}
            </ul>
        </div>
    );
};


