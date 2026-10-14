import React from 'react';
import { Database, ShieldCheck } from 'lucide-react';
import { JOB_POSTINGS } from '../data/jobPostings';

export const DemoBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900/40 via-cyan-900/30 to-purple-900/40 border-b border-blue-500/20 text-xs py-2 px-4 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-2 text-cyan-300">
        <Database className="w-4 h-4 text-cyan-400 animate-pulse" />
        <span className="font-semibold uppercase tracking-wider text-[11px]">Academic Prototype:</span>
        <span className="text-gray-300">
          Data: real LinkedIn job postings (asaniczka datasets on Kaggle), sampled to <strong>{JOB_POSTINGS.length}</strong> postings. Salary, education and industry are not available in the source.
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <span className="inline-flex items-center gap-1 text-cyan-400 bg-cyan-400/10 px-2.5 py-0.5 rounded-full border border-cyan-400/20 text-[10px] font-medium">
          REAL LINKEDIN DATASET
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2.5 py-0.5 rounded-full border border-emerald-400/20 text-[10px] font-medium">
          <ShieldCheck className="w-3 h-3" />
          Data Mining Engine Active
        </span>
      </div>
    </div>
  );
};
