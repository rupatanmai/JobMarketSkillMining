import React, { useState, useMemo } from 'react';
import {
  Target,
  CheckCircle2,
  AlertCircle,
  Award,
  Plus,
  TrendingUp
} from 'lucide-react';
import { JOB_POSTINGS, ROLE_CATEGORIES, ALL_SKILLS } from '../data/jobPostings';
import { calculateSkillGap } from '../utils/miningAlgorithms';
import type { SkillGapAnalysisResult } from '../utils/miningAlgorithms';

export const SkillGapPage: React.FC = () => {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([
    'Python', 'Java', 'SQL', 'Git'
  ]);
  const [targetRole, setTargetRole] = useState<string>('Data Science & AI');

  // Quick Student Persona Presets
  const presets = [
    { name: 'CS Student (Basic)', skills: ['Python', 'Java', 'SQL', 'Git'] },
    { name: 'Frontend Aspirant', skills: ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Git'] },
    { name: 'Data Science Student', skills: ['Python', 'SQL', 'Pandas', 'NumPy', 'Excel'] },
    { name: 'DevOps Enthusiast', skills: ['Linux', 'Docker', 'Git', 'Python', 'AWS'] }
  ];

  // Perform calculation using pure data mining logic
  const gapResults: SkillGapAnalysisResult = useMemo(() => {
    return calculateSkillGap(JOB_POSTINGS, selectedSkills, targetRole);
  }, [selectedSkills, targetRole]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Target className="w-6 h-6 text-emerald-400" />
              Student Skill-Gap Analyzer &amp; Readiness Intelligence
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Benchmark student competencies against real job posting demands across {JOB_POSTINGS.length} market positions. Computes career readiness scores, missing high-value skills, and personalized learning pathways.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl text-xs text-emerald-300 font-mono">
            <Award className="w-4 h-4 text-emerald-400" />
            <span>Readiness Score: {gapResults.readinessScore}%</span>
          </div>
        </div>
      </div>

      {/* Control Panel: Student Skills & Target Role */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Skill Selection */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                Select Your Current Skills ({selectedSkills.length})
              </h3>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">Presets:</span>
                {presets.map(p => (
                  <button
                    key={p.name}
                    onClick={() => setSelectedSkills(p.skills)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold transition-colors border border-slate-700/60"
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Selector Grid */}
            <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto scrollbar-thin p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
              {ALL_SKILLS.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Role Selector */}
          <div>
            <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Target Job Category
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {ROLE_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setTargetRole(cat)}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition-all ${
                    targetRole === cat
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:border-slate-600 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Readiness Score Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 flex flex-col justify-between items-center text-center">
          <div className="w-full">
            <h3 className="text-base font-bold text-white mb-1">Market Readiness Index</h3>
            <p className="text-xs text-slate-400">Match score for {targetRole}</p>

            {/* Circular Gauge / Large Number Display */}
            <div className="relative w-40 h-40 mx-auto my-6 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke="#1e293b"
                  strokeWidth="10"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="transparent"
                  stroke={gapResults.readinessScore > 70 ? '#10b981' : gapResults.readinessScore > 40 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * gapResults.readinessScore) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-extrabold text-white font-mono">{gapResults.readinessScore}%</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-0.5">Readiness</span>
              </div>
            </div>

            <div className={`p-3 rounded-xl border text-xs font-semibold ${
              gapResults.readinessScore >= 75
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : gapResults.readinessScore >= 50
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              {gapResults.readinessScore >= 75
                ? '🎉 High Job Fit! Ready for application rounds.'
                : gapResults.readinessScore >= 50
                ? '⚡ Moderate Fit. Close skill gaps to boost profile.'
                : '⚠️ Foundational stage. Significant skill gaps identified.'}
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-800 text-xs text-slate-400 flex justify-between">
            <span>Possessed: <strong>{gapResults.possessedSkills.length}</strong></span>
            <span>Missing: <strong>{gapResults.missingSkills.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Deep Gap Breakdown: Possessed vs Missing vs Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Possessed Skills Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Skills Already Possessed ({gapResults.possessedSkills.length})</h3>
          </div>
          <p className="text-xs text-slate-400">Relevant skills in your profile that directly match market job postings for {targetRole}:</p>

          <div className="flex flex-wrap gap-2">
            {gapResults.possessedSkills.length > 0 ? (
              gapResults.possessedSkills.map(s => (
                <span key={s} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500 italic">No possessed skills match this role's dominant requirements.</span>
            )}
          </div>
        </div>

        {/* Missing Skills Card */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white">Missing In-Demand Skills ({gapResults.missingSkills.length})</h3>
          </div>
          <p className="text-xs text-slate-400">Skills requested in this role's postings, ranked by frequency, that are absent from your profile:</p>

          <div className="flex flex-wrap gap-2">
            {gapResults.missingSkills.length > 0 ? (
              gapResults.missingSkills.map(m => (
                <span key={m.skill} className="px-3 py-1.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {m.skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-400 font-semibold">Zero gaps! You possess all primary demanded skills.</span>
            )}
          </div>
        </div>
      </div>

      {/* Priority Recommendations & Best Matching Alternative Roles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recommended Action Plan */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Prioritized Learning Recommendations (Ranked by Market Demand)
          </h3>
          <p className="text-xs text-slate-400">Acquiring these top 5 skills yields the highest percentage increase in your readiness score:</p>

          <div className="space-y-3">
            {gapResults.recommendedSkills.map((rec, idx) => (
              <div key={rec.skill} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                <div className="flex items-center space-x-3">
                  <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold font-mono text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-white">{rec.skill}</h4>
                    <span className="text-[10px] text-slate-400">Demanded in {rec.demandPercentage}% of {targetRole} jobs</span>
                  </div>
                </div>

                <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                  rec.priority === 'High'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {rec.priority} Priority
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Best Matching Roles across entire market */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-400" />
            Best Matching Alternative Roles Across Market
          </h3>
          <p className="text-xs text-slate-400">Based on your current skill set, your readiness across all market domains ranks as follows:</p>

          <div className="space-y-3">
            {gapResults.bestMatchingRoles.map((role) => (
              <div
                key={role.role}
                onClick={() => setTargetRole(role.role)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  targetRole === role.role
                    ? 'bg-purple-900/30 border-purple-400'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{role.role}</h4>
                  <span className="text-[10px] text-slate-400">{role.matchedSkillsCount} skills matched</span>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-mono font-bold text-purple-300">{role.score}% Fit</span>
                  <div className="w-20 bg-slate-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                      style={{ width: `${role.score}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
