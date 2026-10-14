import { useState, useMemo } from 'react';
import {
  BrainCircuit,
  Sliders,
  Sparkles,
  BarChart2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { JOB_POSTINGS } from '../data/jobPostings';
import { classifyJobs } from '../utils/miningAlgorithms';
import type { ClassificationMetrics } from '../utils/miningAlgorithms';

export const ClassificationPage: React.FC = () => {
  const [selectedAlgo, setSelectedAlgo] = useState<'KNN' | 'DecisionTree' | 'NaiveBayes'>('KNN');

  // Run classification on dataset records
  const metrics: ClassificationMetrics = useMemo(() => {
    return classifyJobs(JOB_POSTINGS, selectedAlgo);
  }, [selectedAlgo]);

  const formatCategoryShort = (cat: string): string => {
    if (cat === 'Data Analytics') return 'Data An.';
    if (cat === 'Data Science & AI') return 'Data Sci.';
    return cat.replace(' Development', '');
  };

  const distributionComparison = useMemo(() => {
    return metrics.categories.map(cat => {
      const actualCount = metrics.confusionMatrix
        .filter(c => c.actual === cat)
        .reduce((sum, c) => sum + c.count, 0);
      const predictedCount = metrics.confusionMatrix
        .filter(c => c.predicted === cat)
        .reduce((sum, c) => sum + c.count, 0);
      return {
        category: formatCategoryShort(cat),
        Actual: actualCount,
        Predicted: predictedCount
      };
    });
  }, [metrics]);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <BrainCircuit className="w-6 h-6 text-cyan-400" />
              Role Category Classification Engine
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Evaluating multi-class machine learning models (KNN, Decision Tree, Naive Bayes) trained on skill vectors to predict job-role categories. Compare Accuracy, Precision, Recall, and Confusion Matrix.
            </p>
          </div>

          {/* Model Selector */}
          <div className="flex items-center space-x-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700">
            <Sliders className="w-4 h-4 text-cyan-400 ml-2" />
            <select
              value={selectedAlgo}
              onChange={(e) => setSelectedAlgo(e.target.value as 'KNN' | 'DecisionTree' | 'NaiveBayes')}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none pr-3 py-1 cursor-pointer"
            >
              <option value="KNN" className="bg-slate-900 text-white">K-Nearest Neighbors (k=5)</option>
              <option value="DecisionTree" className="bg-slate-900 text-white">Decision Tree Classifier</option>
              <option value="NaiveBayes" className="bg-slate-900 text-white">Naive Bayes</option>
            </select>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Accuracy</p>
            <h3 className="text-3xl font-extrabold text-cyan-400 mt-1 font-mono">
              {(metrics.accuracy * 100).toFixed(1)}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Test Set (20% Holdout)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold text-lg">
            Acc
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Macro Precision</p>
            <h3 className="text-3xl font-extrabold text-blue-400 mt-1 font-mono">
              {(metrics.precision * 100).toFixed(1)}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">TP / (TP + FP)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-lg">
            P
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Macro Recall</p>
            <h3 className="text-3xl font-extrabold text-purple-400 mt-1 font-mono">
              {(metrics.recall * 100).toFixed(1)}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">TP / (TP + FN)</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-lg">
            R
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Macro F1-Score</p>
            <h3 className="text-3xl font-extrabold text-emerald-400 mt-1 font-mono">
              {(metrics.f1Score * 100).toFixed(1)}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Mean of per-class F1</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-lg">
            F1
          </div>
        </div>
      </div>

      {/* Main Grid: Confusion Matrix & Actual vs Predicted Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Table */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-cyan-400" />
                Confusion Matrix ({selectedAlgo})
              </h3>
              <span className="text-[10px] text-slate-400 uppercase">Rows: Actual • Cols: Predicted</span>
            </div>

            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-center border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="p-2 text-left text-slate-500 font-semibold">Actual \ Pred</th>
                    {metrics.categories.map((cat) => (
                      <th key={cat} className="p-2 font-semibold text-slate-300 text-[10px] truncate max-w-[70px]">
                        {formatCategoryShort(cat)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {metrics.categories.map((actualCat) => (
                    <tr key={actualCat} className="border-t border-slate-800/60">
                      <td className="p-2 text-left font-bold text-slate-300 text-[11px] truncate max-w-[100px]">
                        {actualCat}
                      </td>
                      {metrics.categories.map((predCat) => {
                        const cell = metrics.confusionMatrix.find(c => c.actual === actualCat && c.predicted === predCat);
                        const cnt = cell ? cell.count : 0;
                        const isDiagonal = actualCat === predCat;

                        return (
                          <td
                            key={predCat}
                            className={`p-2 font-mono text-xs ${
                              isDiagonal
                                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                                : cnt > 0
                                ? 'bg-red-500/10 text-red-300'
                                : 'text-slate-600'
                            }`}
                          >
                            {cnt}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-4 italic">
            Diagonal cells indicate correct classification matches. Non-zero off-diagonal cells represent misclassifications.
          </p>
        </div>

        {/* Actual vs Predicted Bar Chart */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-blue-400" />
              Actual vs Predicted Role Counts
            </h3>
            <span className="text-xs text-slate-400">Class Comparison</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distributionComparison} margin={{ top: 10, right: 10, left: 0, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} tickLine={false} angle={-15} textAnchor="end" />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Actual" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Predicted" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Per-Class Metrics Table */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-purple-400" />
          Per-Class Detailed Evaluation Breakdown
        </h3>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Role Category</th>
                <th className="py-2.5 px-3 text-right">Precision</th>
                <th className="py-2.5 px-3 text-right">Recall</th>
                <th className="py-2.5 px-3 text-right">F1-Score</th>
                <th className="py-2.5 px-3 text-right">Test Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {metrics.perClassMetrics.map((item) => (
                <tr key={item.category} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    {item.category}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-cyan-400 font-bold">
                    {(item.precision * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-blue-400 font-bold">
                    {(item.recall * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-purple-400 font-bold">
                    {(item.f1 * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                    {item.support} samples
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
