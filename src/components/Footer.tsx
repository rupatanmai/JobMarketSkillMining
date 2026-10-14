import React from 'react';
import { ShieldAlert, BookOpen, Code } from 'lucide-react';
import { JOB_POSTINGS } from '../data/jobPostings';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-12 bg-slate-900/60 border-t border-slate-800 text-slate-400 py-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Project Info */}
          <div>
            <div className="flex items-center space-x-2 text-slate-200 font-bold mb-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>JobIntel AI – Data Mining System</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              An academic Data Mining & Data Warehousing (DMDW) prototype analyzing technical skill demand, association rules, skill clustering, and career readiness scoring.
            </p>
          </div>

          {/* Core Algorithms */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-400" />
              Algorithmic Frameworks
            </h4>
            <ul className="space-y-1 text-slate-400">
              <li>• Apriori Association Rule Mining (Support, Confidence, Lift)</li>
              <li>• K-Means Vector Clustering (Cosine / Euclidean space)</li>
              <li>• Role Classification (KNN k=5, Decision Trees, Naive Bayes)</li>
              <li>• Time-Series Skill Demand Trend Extraction</li>
            </ul>
          </div>

          {/* Academic Disclaimer */}
          <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
            <h4 className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" />
              Academic Disclaimer
            </h4>
            <p className="text-[11px] text-slate-300 italic leading-snug">
              "This is an academic prototype analyzing real LinkedIn job postings. Mining results and career recommendations are analytical estimates and should not be considered guaranteed employment advice."
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© 2026 JobIntel AI — DMDW Academic Capstone Project. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="text-cyan-400">Dataset: {JOB_POSTINGS.length} Records</span>
            <span>React + TS + Vite + Recharts</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
