import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  Network,
  Boxes,
  BrainCircuit,
  TrendingUp,
  Target,
  Briefcase,
  Database,
  GitMerge,
  Sun,
  Moon,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { JOB_POSTINGS } from '../data/jobPostings';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDark, onToggleTheme }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Skill Analytics', path: '/skill-analytics', icon: BarChart3 },
    { name: 'Association Mining', path: '/association-mining', icon: Network },
    { name: 'Clustering', path: '/clustering', icon: Boxes },
    { name: 'Classification', path: '/classification', icon: BrainCircuit },
    { name: 'Trend Mining', path: '/trend-mining', icon: TrendingUp },
    { name: 'Skill Gap Analyzer', path: '/skill-gap', icon: Target },
    { name: 'Job Explorer', path: '/job-explorer', icon: Briefcase },
    { name: 'Data Warehouse', path: '/data-warehouse', icon: Database },
    { name: 'Mining Workflow', path: '/mining-workflow', icon: GitMerge },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-xl border-r border-slate-800 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight text-white">JobIntel</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">AI</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Skill Demand Mining System</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-thin">
          <div className="px-3 py-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Analytics & Algorithms
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-white' : 'text-slate-500'}`} />
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Dataset Status Widget */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Dataset: LinkedIn, Dec 2023
              </span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full w-full rounded-full" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 flex items-center justify-between">
              <span>Static file</span>
              <span className="text-slate-400 font-mono">{JOB_POSTINGS.length} Records</span>
            </p>
          </div>
        </div>

        {/* Footer / Theme Toggle */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-cyan-400">
              DM
            </div>
            <div>
              <p className="text-xs font-medium text-slate-200">DMDW Academic</p>
              <p className="text-[10px] text-slate-400">Project Engine v1.0</p>
            </div>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-400" />}
          </button>
        </div>
      </aside>
    </>
  );
};
