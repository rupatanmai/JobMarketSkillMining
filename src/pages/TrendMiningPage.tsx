import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  AlertTriangle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { JOB_POSTINGS } from '../data/jobPostings';
import { calculateSkillTrends } from '../utils/miningAlgorithms';

export const TrendMiningPage: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Surging' | 'Steady' | 'Declining' | 'New'>('All');

  const trends = useMemo(() => calculateSkillTrends(JOB_POSTINGS), []);

  const filteredEmerging = useMemo(() => {
    if (statusFilter === 'All') return trends.emergingSkills;
    return trends.emergingSkills.filter(s => s.status === statusFilter);
  }, [trends, statusFilter]);

  const topSkill = trends.emergingSkills[0];

  const formatGrowth = (val: number | null | undefined): string => {
    if (val === null || val === undefined) return 'New';
    if (val > 1000) return '>1000%';
    if (val > 0) return `+${val}%`;
    return `${val}%`;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Prominent Amber Warning Box */}
      <div className="rounded-2xl p-4 md:p-5 border border-amber-500/40 bg-amber-500/10 text-amber-200 flex items-start gap-3.5 shadow-lg shadow-amber-950/20">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs md:text-sm leading-relaxed text-amber-200/95 font-medium">
          <strong className="text-amber-300 font-bold">Important:</strong> all postings in this dataset were collected on 3 dates (17, 20 and 25 Dec 2023), and each date comes from a different source file (Data Engineer, Data Analyst and Software Engineering jobs). The Surging/Declining labels here therefore reflect differences between those sources, not real changes in demand over time. The module is built to work with data spanning several months.
        </div>
      </div>

      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
              Time-Series Skill Trend Mining
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Skill demand by posting date (demo) across {JOB_POSTINGS.length} technical job postings.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs text-emerald-300 font-mono">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>
              Top Surging: {topSkill?.skill} ({formatGrowth(topSkill?.growthPercentage)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Historical Trend Chart */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              Daily Tech Skill Demand Trajectory (%)
            </h3>
            <p className="text-xs text-slate-400">Proportion of job postings specifying key technologies over time</p>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trends.monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="datePeriod" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="Python" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="SQL" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="PyTorch" stroke="#ec4899" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Kubernetes" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="AWS" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="React" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Emerging Skills Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Emerging &amp; Surging Skill Leaderboard
            </h3>
            <p className="text-xs text-slate-400">Growth rate calculated comparing early vs recent posting periods</p>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <Filter className="w-4 h-4 text-slate-400 ml-2" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Surging' | 'Steady' | 'Declining' | 'New')}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Trends ({trends.emergingSkills.length})</option>
              <option value="Surging" className="bg-slate-900 text-white">Surging (&gt;+15%)</option>
              <option value="Steady" className="bg-slate-900 text-white">Steady (±15%)</option>
              <option value="Declining" className="bg-slate-900 text-white">Declining (&lt;-15%)</option>
              <option value="New" className="bg-slate-900 text-white">New Skills (Recent)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                <th className="py-3 px-3">Skill Name</th>
                <th className="py-3 px-3 text-right">Early Period Demand</th>
                <th className="py-3 px-3 text-right">Recent Period Demand</th>
                <th className="py-3 px-3 text-right">Total Postings</th>
                <th className="py-3 px-3 text-right">Growth Rate %</th>
                <th className="py-3 px-3 text-right">Status Badge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredEmerging.map((item) => (
                <tr key={item.skill} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {item.skill}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">{item.initialCount} jobs</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-200">{item.recentCount} jobs</td>
                  <td className="py-3 px-3 text-right font-mono text-cyan-400 font-bold">{item.totalDemand}</td>

                  <td className="py-3 px-3 text-right font-mono font-bold">
                    {item.growthPercentage !== null && item.growthPercentage !== undefined ? (
                      <span className={`inline-flex items-center gap-0.5 ${item.growthPercentage > 0 ? 'text-emerald-400' : item.growthPercentage < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                        {item.growthPercentage > 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : item.growthPercentage < 0 ? <ArrowDownRight className="w-3.5 h-3.5" /> : null}
                        {formatGrowth(item.growthPercentage)}
                      </span>
                    ) : (
                      <span className="text-cyan-400 font-mono">New</span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-right">
                    {item.status === 'Surging' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Surging ⚡
                      </span>
                    )}
                    {item.status === 'Steady' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                        Steady
                      </span>
                    )}
                    {item.status === 'Declining' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold">
                        Declining
                      </span>
                    )}
                    {item.status === 'New' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                        New
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
