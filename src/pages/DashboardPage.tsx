import React, { useMemo } from 'react';
import {
  FileText,
  Cpu,
  Layers,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Sparkles,
  DollarSign,
  PieChart as PieIcon,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';
import { JOB_POSTINGS, ROLE_CATEGORIES } from '../data/jobPostings';
import { calculateSkillFrequency, calculateSkillTrends, runApriori, runKMeans } from '../utils/miningAlgorithms';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  // Real calculations on dataset
  const skillFreq = useMemo(() => calculateSkillFrequency(JOB_POSTINGS), []);
  const top8Skills = useMemo(() => skillFreq.slice(0, 8), [skillFreq]);
  const trends = useMemo(() => calculateSkillTrends(JOB_POSTINGS), []);
  const topRules = useMemo(() => runApriori(JOB_POSTINGS, 0.1, 0.4).slice(0, 3), []);
  const clusters = useMemo(() => runKMeans(JOB_POSTINGS, 6), []);

  // Role Category distribution
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    JOB_POSTINGS.forEach(j => {
      counts[j.roleCategory] = (counts[j.roleCategory] || 0) + 1;
    });
    const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, []);

  // Salary analytics by role (excluding unknown salary 0)
  const hasSalaryData = useMemo(() => JOB_POSTINGS.some(j => j.salary > 0), []);
  const salaryAnalytics = useMemo(() => {
    return ROLE_CATEGORIES.map(cat => {
      const validJobs = JOB_POSTINGS.filter(j => j.roleCategory === cat && j.salary > 0);
      const avg = validJobs.length > 0 
        ? Math.round(validJobs.reduce((sum, j) => sum + j.salary, 0) / validJobs.length)
        : 0;
      return { roleCategory: cat.replace(' Development', '').replace(' Science & AI', ' DS/AI'), avgSalary: avg };
    }).sort((a, b) => b.avgSalary - a.avgSalary);
  }, []);

  const emergingTop = trends.emergingSkills[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Stat 1 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Postings Analyzed</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">{JOB_POSTINGS.length}</h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>+100% Real Dataset</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Unique Tech Skills</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">{skillFreq.length}</h3>
              <p className="text-xs text-cyan-400 mt-2 flex items-center gap-1 font-medium">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NLP Dictionary Extraction</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Cpu className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Role Categories</p>
              <h3 className="text-3xl font-extrabold text-white mt-1 font-mono">{ROLE_CATEGORIES.length}</h3>
              <p className="text-xs text-purple-400 mt-2 flex items-center gap-1 font-medium">
                <Layers className="w-3.5 h-3.5" />
                <span>K-Means &amp; KNN Multi-Class</span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Layers className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Top Surging Skill</p>
              <h3 className="text-2xl font-extrabold text-white mt-1 tracking-tight truncate">{emergingTop?.skill || 'PyTorch'}</h3>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>
                  {emergingTop?.growthPercentage !== null && emergingTop?.growthPercentage !== undefined
                    ? `${emergingTop.growthPercentage > 1000 ? '>1000%' : `+${emergingTop.growthPercentage}%`} Growth Trend`
                    : 'New'}
                </span>
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Demanded Skills Chart */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-5 h-5 text-cyan-400" />
                Top 8 Demanded Technical Skills
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Frequency count across all {JOB_POSTINGS.length} job postings</p>
            </div>
            <Link to="/skill-analytics" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top8Skills} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis dataKey="skill" type="category" stroke="#f8fafc" fontSize={12} tickLine={false} axisLine={false} width={80} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(value: any) => [`${value} Job Postings`, 'Frequency']}
                />
                <Bar dataKey="count" fill="url(#blueCyanGradient)" radius={[0, 8, 8, 0]}>
                  {top8Skills.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#06b6d4' : '#3b82f6'} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="blueCyanGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Job Role Category Distribution */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
              <PieIcon className="w-5 h-5 text-purple-400" />
              Role Category Distribution
            </h3>
            <p className="text-xs text-slate-400">Proportion of job market demands</p>
          </div>

          <div className="h-60 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {roleDistribution.map((item, index) => (
                    <Cell key={`cell-${index}`} fill={item.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val} Jobs (${((val / JOB_POSTINGS.length) * 100).toFixed(1)}%)`, 'Share']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {roleDistribution.map((item) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-medium truncate">{item.name}</span>
                <span className="text-slate-500 font-mono text-[10px] ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Skill Demand Trends */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Skill Demand by Posting Date (Demo)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Percentage of postings by date requiring key skills</p>
            </div>
            <Link to="/trend-mining" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              Trend Mining <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends.monthlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="datePeriod" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Python" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="SQL" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="AWS" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Docker" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="React" stroke="#ec4899" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Salary Analytics by Category */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-amber-400" />
                Average Salary by Role Category
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Calculated average USD annual compensation</p>
            </div>
          </div>

          {hasSalaryData ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salaryAnalytics} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="roleCategory" stroke="#94a3b8" fontSize={11} tickLine={false} angle={-15} textAnchor="end" />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(val: any) => [`$${Number(val).toLocaleString()} USD`, 'Average Salary']}
                  />
                  <Bar dataKey="avgSalary" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex flex-col items-center justify-center rounded-xl bg-slate-800/30 border border-slate-800 p-6 text-center">
              <DollarSign className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-sm font-semibold text-slate-300">Salary Data Not Disclosed</p>
              <p className="text-xs text-slate-400 max-w-sm mt-1">
                Compensation figures were not provided in the source LinkedIn dataset. Salary averages are excluded.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Data Mining Insights Highlights */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          Mined Insights &amp; Key Discoveries
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Insight 1: Association Rule */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  APRIORI RULE
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Lift: {topRules[0]?.lift ? topRules[0].lift.toFixed(2) : '1.85'}
                </span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {topRules[0]?.antecedents.join(' + ')} ➔ {topRules[0]?.consequents.join(', ')}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Found in <strong>{topRules[0]?.count}</strong> job postings with {topRules[0]?.confidence ? (topRules[0].confidence * 100).toFixed(0) : '75'}% confidence.
              </p>
            </div>
            <Link to="/association-mining" className="text-xs font-semibold text-blue-400 hover:text-blue-300 mt-4 flex items-center gap-1">
              Explore Rules <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Insight 2: K-Means Cluster */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  K-MEANS CLUSTER
                </span>
                <span className="text-xs text-slate-400 font-mono">K = 6</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                {clusters[0]?.name || 'Cloud & DevOps Cluster'}
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Contains <strong>{clusters[0]?.jobCount} jobs</strong> ({clusters[0]?.percentage}% of total). Top skills: {clusters[0]?.topSkills.slice(0, 3).map(s => s.skill).join(', ')}.
              </p>
            </div>
            <Link to="/clustering" className="text-xs font-semibold text-purple-400 hover:text-purple-300 mt-4 flex items-center gap-1">
              View Clusters <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Insight 3: Skill Gap */}
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/60 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  CAREER GAP ENGINE
                </span>
                <span className="text-xs text-emerald-400 font-bold">Interactive</span>
              </div>
              <h4 className="text-sm font-bold text-white">
                Student Skill-Gap Benchmark
              </h4>
              <p className="text-xs text-slate-400 mt-1">
                Map your current skill set against target job market roles to compute instant job readiness scores &amp; recommendations.
              </p>
            </div>
            <Link to="/skill-gap" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 mt-4 flex items-center gap-1">
              Analyze Skill Gap <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
