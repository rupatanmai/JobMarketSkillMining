import React from 'react';
import { Menu, Download, Sparkles } from 'lucide-react';

import { exportCSV } from '../utils/miningAlgorithms';
import { JOB_POSTINGS } from '../data/jobPostings';

interface HeaderProps {
  onOpenSidebar: () => void;
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSidebar, title, subtitle }) => {
  const handleExport = () => {
    exportCSV(JOB_POSTINGS, `job_intel_${JOB_POSTINGS.length}_postings.csv`);
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            {title}
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">{subtitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="hidden sm:flex items-center space-x-2 bg-slate-800/60 border border-slate-700/60 px-3 py-1.5 rounded-xl text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Mining <strong>{JOB_POSTINGS.length}</strong> Records</span>
        </div>

        <button
          onClick={handleExport}
          className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium text-xs md:text-sm px-3.5 py-2 rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>
    </header>
  );
};
