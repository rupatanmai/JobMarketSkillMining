import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Cpu,
  Search,
  FileCode,
  Filter,
  CheckCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts';
import { JOB_POSTINGS, ROLE_CATEGORIES } from '../data/jobPostings';
import { calculateSkillFrequency, extractSkillsFromText } from '../utils/miningAlgorithms';


export const SkillAnalyticsPage: React.FC = () => {
  const [selectedRoleCategory, setSelectedRoleCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sampleText, setSampleText] = useState<string>(
    "Looking for a Senior Data Scientist proficient in Python, SQL, and Pandas. Experience with Machine Learning, PyTorch, Docker, AWS, and Kubernetes is highly preferred. Must have experience with Git and REST APIs."
  );

  // Filter jobs by category first
  const filteredJobs = useMemo(() => {
    if (selectedRoleCategory === 'All') return JOB_POSTINGS;
    return JOB_POSTINGS.filter(j => j.roleCategory === selectedRoleCategory);
  }, [selectedRoleCategory]);

  const skillFrequencies = useMemo(() => {
    const freq = calculateSkillFrequency(filteredJobs);
    if (!searchTerm) return freq;
    return freq.filter(s => s.skill.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [filteredJobs, searchTerm]);

  // NLP Extracted Skills from sample text
  const extractedResults = useMemo(() => extractSkillsFromText(sampleText), [sampleText]);

  const top15 = skillFrequencies.slice(0, 15);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-cyan-400" />
              Skill Frequency & Demand Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Extract and rank technical skill occurrences across {filteredJobs.length} job posting records. Filter by specific role categories to analyze specialized domain skill demands.
            </p>
          </div>

          {/* Role Filter Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <Filter className="w-4 h-4 text-cyan-400 ml-2" />
            <select
              value={selectedRoleCategory}
              onChange={(e) => setSelectedRoleCategory(e.target.value)}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-white">All Role Categories ({JOB_POSTINGS.length})</option>
              {ROLE_CATEGORIES.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900 text-white">
                  {cat} ({JOB_POSTINGS.filter(j => j.roleCategory === cat).length})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-400" />
              Top Technical Skill Demands ({selectedRoleCategory})
            </h3>
            <p className="text-xs text-slate-400">Frequency percentage out of total jobs in selected category</p>
          </div>
          <div className="relative w-48 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top15} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="skill" stroke="#94a3b8" fontSize={11} tickLine={false} angle={-25} textAnchor="end" />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                formatter={(val: any, _: any, item: any) => [
                  `${item.payload.count} Jobs (${val}%)`,
                  'Demand Frequency'
                ]}
              />

              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {top15.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={index < 3 ? '#06b6d4' : index < 8 ? '#3b82f6' : '#8b5cf6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Skill Frequency Leaderboard & Interactive Text NLP Extractor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leaderboard Table */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              Skill Demand Leaderboard
            </h3>

            <div className="overflow-x-auto max-h-96 scrollbar-thin">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                    <th className="pb-2 pl-2">Rank</th>
                    <th className="pb-2">Skill Name</th>
                    <th className="pb-2 text-right">Job Postings</th>
                    <th className="pb-2 text-right pr-2">Market Share</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {skillFrequencies.slice(0, 12).map((item, idx) => (
                    <tr key={item.skill} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 pl-2 font-mono text-slate-500 font-bold">#{idx + 1}</td>
                      <td className="py-2.5 font-semibold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        {item.skill}
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-300">{item.count}</td>
                      <td className="py-2.5 text-right pr-2">
                        <div className="flex items-center justify-end space-x-2">
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                              style={{ width: `${Math.min(100, item.percentage * 2)}%` }}
                            />
                          </div>
                          <span className="font-mono text-cyan-400 font-bold">{item.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Live NLP Text Mining Extractor */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                Live NLP Skill Extraction Engine
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Text Processing
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Paste any raw job description below to test our dictionary-based NLP skill extraction logic in real time:
            </p>

            <textarea
              rows={4}
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono scrollbar-thin"
              placeholder="Paste job posting text..."
            />

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-300">
                  Extracted Skills ({extractedResults.extracted.length}):
                </span>
                <span className="text-[11px] text-slate-500">Dictionary Match</span>
              </div>

              {extractedResults.extracted.length > 0 ? (
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto scrollbar-thin p-2 bg-slate-950/50 rounded-xl border border-slate-800">
                  {extractedResults.frequencies.map((item) => (
                    <span
                      key={item.skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-gradient-to-r from-blue-900/50 to-purple-900/50 text-cyan-300 border border-cyan-500/30 shadow-sm"
                    >
                      <CheckCircle className="w-3 h-3 text-cyan-400" />
                      {item.skill}
                      <span className="bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
                        {item.occurrences}x
                      </span>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs bg-slate-950/50 rounded-xl border border-slate-800">
                  No technical skills matched in the text above.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
