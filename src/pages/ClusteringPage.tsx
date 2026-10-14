import { useState, useMemo } from 'react';
import {
  Boxes,
  Sliders,
  RefreshCw,
  DollarSign,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid
} from 'recharts';
import { JOB_POSTINGS, ALL_SKILLS } from '../data/jobPostings';
import { runKMeans } from '../utils/miningAlgorithms';

export const ClusteringPage: React.FC = () => {
  const [kClusters, setKClusters] = useState<number>(6);
  const [seed, setSeed] = useState<number>(42);
  const [expandedCluster, setExpandedCluster] = useState<number | null>(1);

  // Recalculate K-Means whenever k or seed changes (deterministic with seeded PRNG)
  const clusters = useMemo(() => {
    return runKMeans(JOB_POSTINGS, kClusters, seed);
  }, [kClusters, seed]);

  // Scatter plot 2D projection simulation using PCA/t-SNE layout from top 2 feature dimensions
  const scatterData = useMemo(() => {
    const points: Array<{
      id: string;
      title: string;
      company: string;
      clusterId: number;
      clusterName: string;
      color: string;
      salary: number;
      x: number;
      y: number;
    }> = [];

    clusters.forEach((cluster) => {
      cluster.jobs.forEach((job, idx) => {
        let x = 0;
        let y = 0;
        job.skills.forEach((skill) => {
          const sIdx = ALL_SKILLS.indexOf(skill);
          if (sIdx !== -1) {
            x += Math.cos(sIdx * 0.5) * 12;
            y += Math.sin(sIdx * 0.5) * 12;
          }
        });

        // Add subtle scatter noise
        const jitterX = Math.sin(idx * 7) * 4;
        const jitterY = Math.cos(idx * 11) * 4;

        points.push({
          id: job.id,
          title: job.title,
          company: job.company,
          clusterId: cluster.clusterId,
          clusterName: cluster.name,
          color: cluster.color,
          salary: job.salary,
          x: Math.round((x + jitterX) * 10) / 10,
          y: Math.round((y + jitterY) * 10) / 10
        });
      });
    });
    return points;
  }, [clusters]);

  const handleReRun = () => {
    setSeed(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Boxes className="w-6 h-6 text-purple-400" />
              K-Means Job Profile Clustering
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Partitioning {JOB_POSTINGS.length} job postings into K distinct skill-vector clusters using iterative Euclidean distance matrix. Uncover implicit specialization profiles in the software industry.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-slate-300 font-semibold">K Clusters:</span>
              <select
                value={kClusters}
                onChange={(e) => setKClusters(parseInt(e.target.value))}
                className="bg-slate-900 text-xs font-mono font-bold text-white px-2 py-1 rounded cursor-pointer focus:outline-none"
              >
                {[3, 4, 5, 6, 7, 8].map(n => (
                  <option key={n} value={n}>K = {n}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReRun}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-transform active:scale-95 shadow-md shadow-purple-500/20"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Run</span>
            </button>
          </div>
        </div>
      </div>

      {/* Cluster Scatter Visualization */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              2D Feature Space Cluster Map
            </h3>
            <p className="text-xs text-slate-400">Projected vector positions based on technical skill combinations</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {clusters.map((c) => (
              <span key={c.clusterId} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/80 border border-slate-700 text-[11px] text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
            ))}
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" dataKey="x" name="Skill Component 1" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis type="number" dataKey="y" name="Skill Component 2" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                cursor={{ strokeDasharray: '3 3' }}
                formatter={(val: any, name: any, item: any) => {
                  if (name === 'x' || name === 'y') return [val, name];
                  const sal = item.payload.salary > 0 ? ` - $${item.payload.salary.toLocaleString()}` : '';
                  return [`${item.payload.title} (${item.payload.company})${sal}`, item.payload.clusterName];
                }}
              />
              <Scatter data={scatterData} fill="#8884d8">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.8} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clusters.map((cluster) => {
          const isExpanded = expandedCluster === cluster.clusterId;

          return (
            <div
              key={cluster.clusterId}
              className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex flex-col justify-between transition-all"
            >
              <div>
                {/* Cluster Header */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="px-2.5 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1.5 shadow-sm"
                    style={{ backgroundColor: cluster.color }}
                  >
                    Cluster #{cluster.clusterId}
                  </span>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-mono block">
                      {cluster.jobCount} Jobs ({cluster.percentage}%)
                    </span>
                    {cluster.inertia !== undefined && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Inertia: {cluster.inertia}
                      </span>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-2">{cluster.name}</h3>

                <div className="flex items-center space-x-2 mb-4 bg-slate-800/50 px-3 py-1.5 rounded-xl border border-slate-700/60 w-fit text-xs">
                  <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-slate-300">Avg Salary:</span>
                  <strong className="text-amber-400 font-mono">
                    {cluster.avgSalary > 0 ? `$${cluster.avgSalary.toLocaleString()} USD` : 'N/A'}
                  </strong>
                </div>

                {/* Top Dominant Skills */}
                <div className="space-y-1.5 mb-4">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Top Dominant Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cluster.topSkills.map((s) => (
                      <span
                        key={s.skill}
                        className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs font-medium"
                      >
                        {s.skill} <span className="text-cyan-400 font-mono text-[10px]">({s.frequency})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Expand Job List */}
              <button
                onClick={() => setExpandedCluster(isExpanded ? null : cluster.clusterId)}
                className="w-full mt-2 py-2 px-3 bg-slate-800/60 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-between transition-colors border border-slate-700/50"
              >
                <span>{isExpanded ? 'Hide Sample Jobs' : 'View Sample Jobs'}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {isExpanded && (
                <div className="mt-3 space-y-2 border-t border-slate-800 pt-3 max-h-48 overflow-y-auto scrollbar-thin">
                  {cluster.jobs.slice(0, 5).map(job => (
                    <div key={job.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{job.title}</span>
                        <span className="text-slate-400 font-mono text-[10px]">{job.id}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{job.company} • {job.location}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
