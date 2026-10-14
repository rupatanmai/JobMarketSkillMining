import React, { useState } from 'react';
import {
  GitMerge,
  Database,
  Filter,
  FileCode,
  Layers,
  Cpu,
  BrainCircuit,
  Target,
  BarChart3,
  CheckCircle2
} from 'lucide-react';
import { JOB_POSTINGS, ALL_SKILLS } from '../data/jobPostings';

export const MiningWorkflowPage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<number>(1);

  const workflowStages = [
    {
      id: 1,
      name: 'Job Posting Dataset',
      icon: Database,
      color: '#3b82f6',
      summary: `Raw ingestion of ${JOB_POSTINGS.length} job posting records containing titles, descriptions, skills, and salaries.`,
      inputs: ['Raw Job HTML / Text', 'Company Metadata', 'Location Data'],
      processing: 'Parsing CSV records into TypeScript domain objects',
      outputs: [`JOB_POSTINGS: JobPosting[] (${JOB_POSTINGS.length} records)`]
    },
    {
      id: 2,
      name: 'Data Cleaning & Preprocessing',
      icon: Filter,
      color: '#06b6d4',
      summary: 'Handling missing values, standardizing skill labels, and deduplicating records.',
      inputs: ['Unstructured text strings', 'Varied currency salary strings'],
      processing: 'Regex string normalization, salary multiplier calculation, skill canonicalization',
      outputs: ['Cleaned Dataset', 'Standardized Skill Tokens']
    },
    {
      id: 3,
      name: 'Text Mining & NLP',
      icon: FileCode,
      color: '#8b5cf6',
      summary: 'Dictionary-based token matching and skill occurrence extraction from job descriptions.',
      inputs: ['Job Descriptions', `Technical Skill Dictionary (${ALL_SKILLS.length} skills)`],
      processing: 'Word boundary regex matching, term frequency counting',
      outputs: ['Skill Frequencies', 'Per-Job Skill Arrays']
    },
    {
      id: 4,
      name: 'Feature Extraction & Vectorization',
      icon: Layers,
      color: '#ec4899',
      summary: 'Converting qualitative skill sets into high-dimensional binary feature vectors.',
      inputs: ['Extracted Skill Arrays', 'Master Skill Vocabulary'],
      processing: 'One-hot encoding into N x M binary matrix where V(i,j) in {0, 1}',
      outputs: ['Skill Binary Feature Matrix']
    },
    {
      id: 5,
      name: 'Data Mining Algorithms',
      icon: Cpu,
      color: '#f59e0b',
      summary: 'Executing Apriori rule mining, K-Means clustering, and classification evaluation.',
      inputs: ['Binary Feature Matrix', 'Algorithm Hyperparameters'],
      processing: 'Apriori frequent itemsets, K-Means++ centroids, KNN majority voting',
      outputs: ['Association Rules', 'Cluster Assignments', 'Classification Metrics']
    },
    {
      id: 6,
      name: 'Pattern & Insight Mining',
      icon: BrainCircuit,
      color: '#10b981',
      summary: 'Deriving actionable market insights, skill bundles, and temporal demand trajectories.',
      inputs: ['Mined Rules & Clusters', 'Posting Dates'],
      processing: 'Support/Confidence/Lift filtering, historical growth rate calculation',
      outputs: ['Surging Skills', 'Skill Association Networks', 'Salary Benchmarks']
    },
    {
      id: 7,
      name: 'Student Skill-Gap Analysis',
      icon: Target,
      color: '#6366f1',
      summary: 'Benchmarking user skill vectors against target market demands.',
      inputs: ['User Skill Selection', 'Target Role Demand Metrics'],
      processing: 'Weighted skill overlap calculation, priority scoring',
      outputs: ['Readiness Score %', 'Missing Critical Skills', 'Role Match Ranks']
    },
    {
      id: 8,
      name: 'Visualization & SaaS Dashboard',
      icon: BarChart3,
      color: '#06b6d4',
      summary: 'Interactive rendering of mining models, responsive controls, and charts.',
      inputs: ['All Analytical Outputs', 'User UI Interactivity'],
      processing: 'React UI render, Recharts SVG graph generation, instant filtering',
      outputs: ['JobIntel AI SaaS Platform']
    }
  ];

  const currentStageObj = workflowStages.find(s => s.id === selectedStage) || workflowStages[0];
  const IconComponent = currentStageObj.icon;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <GitMerge className="w-6 h-6 text-cyan-400" />
              Core Data Mining Pipeline Architecture
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              End-to-end data transformation workflow: from raw job text ingestion to feature vectorization, Apriori/K-Means algorithms, and career decision intelligence.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-cyan-500/10 border border-cyan-500/20 px-3 py-2 rounded-xl text-xs text-cyan-300 font-mono">
            <span>8 Pipeline Stages</span>
          </div>
        </div>
      </div>

      {/* Interactive Horizontal Pipeline Visualizer */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <h3 className="text-base font-bold text-white mb-4">Pipeline Flow Diagram</h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {workflowStages.map((stage) => {
            const Icon = stage.icon;
            const isSelected = selectedStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage.id)}
                className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-between space-y-2 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: stage.color }}
                >
                  <Icon className="w-4 h-4" />
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] font-mono text-slate-400 block font-bold">Stage {stage.id}</span>
                  <p className="text-[11px] font-bold text-white line-clamp-2">{stage.name}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Card */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-6">
        <div className="flex items-center space-x-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg"
            style={{ backgroundColor: currentStageObj.color }}
          >
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-slate-400 font-bold">STAGE {currentStageObj.id} OF 8</span>
            </div>
            <h3 className="text-xl font-bold text-white">{currentStageObj.name}</h3>
          </div>
        </div>

        <p className="text-sm text-slate-300 bg-slate-950/40 p-4 rounded-xl border border-slate-800 leading-relaxed">
          {currentStageObj.summary}
        </p>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-cyan-400 mb-2 uppercase tracking-wider text-[11px]">Input Artifacts</h4>
            <ul className="space-y-1.5 text-slate-300">
              {currentStageObj.inputs.map(i => (
                <li key={i} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-purple-400 mb-2 uppercase tracking-wider text-[11px]">Processing Logic</h4>
            <p className="text-slate-300 leading-relaxed">{currentStageObj.processing}</p>
          </div>

          <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60">
            <h4 className="font-bold text-emerald-400 mb-2 uppercase tracking-wider text-[11px]">Output Deliverables</h4>
            <ul className="space-y-1.5 text-slate-300">
              {currentStageObj.outputs.map(o => (
                <li key={o} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
