import { useState, useMemo } from 'react';
import {
  Network,
  Sliders,
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import { JOB_POSTINGS } from '../data/jobPostings';
import { runApriori } from '../utils/miningAlgorithms';

export const AssociationMiningPage: React.FC = () => {
  const [minSupport, setMinSupport] = useState<number>(0.08); // 8%
  const [minConfidence, setMinConfidence] = useState<number>(0.35); // 35%
  const [searchRule, setSearchRule] = useState<string>('');

  // Run Apriori on live dataset with user selected parameters
  const associationRules = useMemo(() => {
    return runApriori(JOB_POSTINGS, minSupport, minConfidence);
  }, [minSupport, minConfidence]);

  const filteredRules = useMemo(() => {
    if (!searchRule) return associationRules;
    const q = searchRule.toLowerCase();
    return associationRules.filter(
      r => r.antecedents.some(a => a.toLowerCase().includes(q)) ||
           r.consequents.some(c => c.toLowerCase().includes(q))
    );
  }, [associationRules, searchRule]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Network className="w-6 h-6 text-blue-400" />
              Association Rule Mining (Apriori Engine)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Discover co-occurrence relationships and skill bundles (e.g. <em>Python + SQL ➔ Spark</em>) mined from {JOB_POSTINGS.length} job posting transactions. Adjust support and confidence parameters to recalculate rules dynamically.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl text-xs text-blue-300 font-mono">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Mined {associationRules.length} Valid Rules</span>
          </div>
        </div>
      </div>

      {/* Interactive Mining Controls */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Apriori Algorithm Parameters
          </h3>
          <span className="text-[11px] text-slate-400">Real-Time Computation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Min Support Slider */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">Minimum Support</label>
              <span className="font-mono text-cyan-400 font-bold">{(minSupport * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.04"
              max="0.30"
              step="0.01"
              value={minSupport}
              onChange={(e) => setMinSupport(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Minimum frequency itemset must appear in total postings (Min: 4%, Max: 30%).
            </p>
          </div>

          {/* Min Confidence Slider */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <label className="font-semibold text-slate-200">Minimum Confidence</label>
              <span className="font-mono text-blue-400 font-bold">{(minConfidence * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.80"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full accent-blue-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Minimum conditional probability of consequent given antecedent.
            </p>
          </div>

          {/* Search Rules */}
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 flex flex-col justify-between space-y-2">
            <label className="text-xs font-semibold text-slate-200">Filter Skill in Rules</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Python, AWS, SQL..."
                value={searchRule}
                onChange={(e) => setSearchRule(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <p className="text-[10px] text-slate-400">Showing {filteredRules.length} matching rules.</p>
          </div>
        </div>
      </div>

      {/* Metrics Explanation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="font-bold text-cyan-400 mb-1">Support S(A ➔ B)</h4>
          <p className="text-slate-400 leading-relaxed">
            Count(A ∩ B) / N — Percentage of all job postings that contain both itemsets A and B. Higher support means higher overall market prevalence.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="font-bold text-blue-400 mb-1">Confidence C(A ➔ B)</h4>
          <p className="text-slate-400 leading-relaxed">
            Support(A ∩ B) / Support(A) — Conditional probability that a job posting requiring skill A also requires skill B.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h4 className="font-bold text-purple-400 mb-1">Lift Factor L(A ➔ B)</h4>
          <p className="text-slate-400 leading-relaxed">
            Confidence(A ➔ B) / Support(B) — Ratio of observed co-occurrence vs independent expectation. Lift &gt; 1 indicates strong positive correlation.
          </p>
        </div>
      </div>

      {/* Mined Association Rules Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-400" />
            Mined Association Rules (Sorted by Lift)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {filteredRules.length} Rules Generated
          </span>
        </div>

        {filteredRules.length > 0 ? (
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                  <th className="py-3 px-3">Rule ID</th>
                  <th className="py-3 px-3">Antecedent Skill(s)</th>
                  <th className="py-3 px-3 text-center">➔</th>
                  <th className="py-3 px-3">Consequent Skill(s)</th>
                  <th className="py-3 px-3 text-right">Support</th>
                  <th className="py-3 px-3 text-right">Confidence</th>
                  <th className="py-3 px-3 text-right">Lift</th>
                  <th className="py-3 px-3 text-right">Job Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-medium">
                {filteredRules.map((rule) => (
                  <tr key={rule.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-500 font-bold">{rule.id}</td>

                    {/* Antecedents */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {rule.antecedents.map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center text-slate-500">
                      <ArrowRight className="w-4 h-4 mx-auto text-cyan-400" />
                    </td>

                    {/* Consequents */}
                    <td className="py-3 px-3">
                      <div className="flex flex-wrap gap-1">
                        {rule.consequents.map(skill => (
                          <span key={skill} className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-xs font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-300">
                      {(rule.support * 100).toFixed(1)}%
                    </td>

                    <td className="py-3 px-3 text-right font-mono">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                        {(rule.confidence * 100).toFixed(0)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold">
                      <span className={`px-2 py-0.5 rounded ${rule.lift >= 1.8 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {rule.lift.toFixed(2)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono text-slate-400">
                      {rule.count} jobs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-sm">
            No rules met the current support ({(minSupport * 100).toFixed(0)}%) and confidence ({(minConfidence * 100).toFixed(0)}%) thresholds. Try lowering the sliders above!
          </div>
        )}
      </div>
    </div>
  );
};
