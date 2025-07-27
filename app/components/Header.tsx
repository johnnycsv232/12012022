
import React from 'react';
import { Briefcase } from './Icons';

export const Header: React.FC = () => (
    <header className="text-center">
        <div className="flex justify-center items-center gap-4 mb-4">
            <Briefcase className="w-10 h-10 text-blue-400"/>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-400">
                Marriage Fraud Evidence Processor
            </h1>
        </div>
        <p className="max-w-2xl mx-auto text-gray-400">
            This tool leverages AI to analyze submitted evidence and generate structured legal reports for potential marriage fraud cases, cross-referencing findings with federal and state statutes.
        </p>
    </header>
);
