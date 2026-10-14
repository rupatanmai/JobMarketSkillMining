import React, { useState } from 'react';
import {
  Database,
  Layers,
  Sparkles,
  Code,
  FileSpreadsheet
} from 'lucide-react';


export const DataWarehousePage: React.FC = () => {
  const [activeTable, setActiveTable] = useState<string>('FACT_JOB_POSTING');

  const starSchemaTables = [
    {
      name: 'FACT_JOB_POSTING',
      type: 'Fact Table',
      color: '#3b82f6',
      columns: [
        { name: 'job_id', type: 'VARCHAR(20)', key: 'PK' },
        { name: 'time_id', type: 'INT', key: 'FK -> DIM_TIME' },
        { name: 'location_id', type: 'INT', key: 'FK -> DIM_LOCATION' },
        { name: 'company_id', type: 'INT', key: 'FK -> DIM_COMPANY' },
        { name: 'role_id', type: 'INT', key: 'FK -> DIM_ROLE' },
        { name: 'skill_bridge_id', type: 'INT', key: 'FK -> DIM_SKILL' },
        { name: 'exp_id', type: 'INT', key: 'FK -> DIM_EXPERIENCE' },
        { name: 'salary_usd', type: 'NUMERIC(10,2)', key: 'Measure' },
        { name: 'posting_count', type: 'INT', key: 'Measure (Sum=1)' }
      ]
    },
    {
      name: 'DIM_TIME',
      type: 'Dimension',
      color: '#06b6d4',
      columns: [
        { name: 'time_id', type: 'INT', key: 'PK' },
        { name: 'full_date', type: 'DATE', key: 'Attribute' },
        { name: 'year', type: 'INT', key: 'Attribute' },
        { name: 'quarter', type: 'VARCHAR(2)', key: 'Attribute' },
        { name: 'month', type: 'INT', key: 'Attribute' },
        { name: 'month_name', type: 'VARCHAR(15)', key: 'Attribute font' }
      ]
    },
    {
      name: 'DIM_LOCATION',
      type: 'Dimension',
      color: '#8b5cf6',
      columns: [
        { name: 'location_id', type: 'INT', key: 'PK' },
        { name: 'city', type: 'VARCHAR(50)', key: 'Attribute' },
        { name: 'state_country', type: 'VARCHAR(50)', key: 'Attribute' },
        { name: 'region', type: 'VARCHAR(30)', key: 'Attribute' }
      ]
    },
    {
      name: 'DIM_COMPANY',
      type: 'Dimension',
      color: '#ec4899',
      columns: [
        { name: 'company_id', type: 'INT', key: 'PK' },
        { name: 'company_name', type: 'VARCHAR(100)', key: 'Attribute' },
        { name: 'industry', type: 'VARCHAR(50)', key: 'Attribute' }
      ]
    },
    {
      name: 'DIM_ROLE',
      type: 'Dimension',
      color: '#10b981',
      columns: [
        { name: 'role_id', type: 'INT', key: 'PK' },
        { name: 'role_category', type: 'VARCHAR(50)', key: 'Attribute' },
        { name: 'job_title', type: 'VARCHAR(100)', key: 'Attribute' }
      ]
    },
    {
      name: 'DIM_SKILL',
      type: 'Dimension',
      color: '#f59e0b',
      columns: [
        { name: 'skill_id', type: 'INT', key: 'PK' },
        { name: 'skill_name', type: 'VARCHAR(50)', key: 'Attribute' },
        { name: 'skill_domain', type: 'VARCHAR(50)', key: 'Attribute' }
      ]
    },
    {
      name: 'DIM_EXPERIENCE',
      type: 'Dimension',
      color: '#6366f1',
      columns: [
        { name: 'exp_id', type: 'INT', key: 'PK' },
        { name: 'level_name', type: 'VARCHAR(30)', key: 'Attribute' },
        { name: 'min_years', type: 'INT', key: 'Attribute' }
      ]
    }
  ];

  const currentTableObj = starSchemaTables.find(t => t.name === activeTable) || starSchemaTables[0];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-blue-400" />
              Data Warehouse Architecture & Star Schema (DMDW)
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Dimensional modeling framework connecting central fact measures to analytical dimensions. Explaining ETL pipelines and OLAP cube operations.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl text-xs text-blue-300 font-mono">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>1 Fact • 6 Dimensions</span>
          </div>
        </div>
      </div>

      {/* Interactive Star Schema Diagram */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              Interactive Star Schema Diagram
            </h3>
            <p className="text-xs text-slate-400">Click any table node below to inspect schema columns & keys</p>
          </div>
        </div>

        {/* Visual Star Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center justify-center p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
          {/* Left Dimensions */}
          <div className="space-y-4">
            {['DIM_TIME', 'DIM_LOCATION', 'DIM_COMPANY'].map(tName => {
              const tbl = starSchemaTables.find(t => t.name === tName)!;
              return (
                <button
                  key={tName}
                  onClick={() => setActiveTable(tName)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    activeTable === tName
                      ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{tbl.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded text-white" style={{ backgroundColor: tbl.color }}>
                      {tbl.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{tbl.columns.length} Columns</p>
                </button>
              );
            })}
          </div>

          {/* Central FACT Table */}
          <div className="flex justify-center my-4 md:my-0">
            <button
              onClick={() => setActiveTable('FACT_JOB_POSTING')}
              className={`w-full max-w-xs p-6 rounded-2xl border text-center transition-all ${
                activeTable === 'FACT_JOB_POSTING'
                  ? 'bg-blue-900/40 border-blue-400 shadow-xl shadow-blue-500/30 scale-105'
                  : 'bg-slate-900 border-blue-500/50 hover:border-blue-400'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center mx-auto mb-2 text-blue-300">
                <Database className="w-6 h-6" />
              </div>
              <h4 className="font-extrabold text-base text-white">FACT_JOB_POSTING</h4>
              <p className="text-xs text-blue-300 font-mono mt-1">Central Fact Table</p>
              <p className="text-[11px] text-slate-400 mt-2">Measures: salary_usd, posting_count</p>
            </button>
          </div>

          {/* Right Dimensions */}
          <div className="space-y-4">
            {['DIM_ROLE', 'DIM_SKILL', 'DIM_EXPERIENCE'].map(tName => {
              const tbl = starSchemaTables.find(t => t.name === tName)!;
              return (
                <button
                  key={tName}
                  onClick={() => setActiveTable(tName)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    activeTable === tName
                      ? 'bg-slate-800 border-cyan-400 shadow-lg shadow-cyan-500/20 scale-105'
                      : 'bg-slate-900/80 border-slate-700/80 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{tbl.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded text-white" style={{ backgroundColor: tbl.color }}>
                      {tbl.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{tbl.columns.length} Columns</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Schema Table Inspector Details */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="w-3 h-8 rounded-full" style={{ backgroundColor: currentTableObj.color }} />
            <div>
              <h3 className="text-lg font-bold text-white">{currentTableObj.name}</h3>
              <p className="text-xs text-slate-400">{currentTableObj.type} Definition</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase font-semibold">
                <th className="py-2.5 px-3">Column Name</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Constraint / Key Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {currentTableObj.columns.map((col) => (
                <tr key={col.name} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-bold text-cyan-300">{col.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{col.type}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      col.key.includes('PK')
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : col.key.includes('FK')
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {col.key}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ETL & OLAP Academic Concepts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ETL Pipeline Explanation */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
            ETL (Extract, Transform, Load) Pipeline
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <strong className="text-cyan-400 block mb-1">1. Extraction:</strong>
              Scraping / parsing raw job posting HTML/JSON text feeds into tabular JSON format.
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <strong className="text-blue-400 block mb-1">2. Transformation:</strong>
              Text normalization, stop-word removal, skill dictionary mapping, salary harmonization, missing value imputation.
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <strong className="text-purple-400 block mb-1">3. Loading:</strong>
              Populating dimensional tables and linking surrogate keys to central `FACT_JOB_POSTING`.
            </div>
          </div>
        </div>

        {/* OLAP Operations Explanation */}
        <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-purple-400" />
            OLAP Cube Operations
          </h3>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <strong className="text-emerald-400 block mb-1">Slice & Dice:</strong>
              Filter data cube by specific dimensions (e.g., `Location = 'Remote'` AND `Skill = 'Python'`).
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <strong className="text-amber-400 block mb-1">Roll-Up & Drill-Down:</strong>
              Aggregate from monthly trends up to yearly trends or drill down into specific city sub-regions.
            </div>
            <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <strong className="text-rose-400 block mb-1">Pivot:</strong>
              Rotate matrix axes to compare skills vs role categories in cross-tabulated reports.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
