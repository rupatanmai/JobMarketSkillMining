import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Search,
  Download,
  MapPin,
  Building2,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';
import {
  JOB_POSTINGS,
  ROLE_CATEGORIES,
  EXPERIENCE_LEVELS,
  REMOTE_TYPES,
  INDUSTRIES
} from '../data/jobPostings';
import type { JobPosting } from '../data/jobPostings';
import { filterJobs, exportCSV } from '../utils/miningAlgorithms';

export const JobExplorerPage: React.FC = () => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleCategory, setRoleCategory] = useState<string>('All');
  const [experienceLevel, setExperienceLevel] = useState<string>('All');
  const [remoteType, setRemoteType] = useState<string>('All');
  const [industry, setIndustry] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'dateDesc' | 'dateAsc' | 'salaryDesc' | 'salaryAsc' | 'title'>('dateDesc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);

  const pageSize = 10;
  const hasIndustryData = useMemo(() => INDUSTRIES.some(ind => ind !== 'Not specified'), []);
  const hasSalaryData = useMemo(() => JOB_POSTINGS.some(j => j.salary > 0), []);

  // Filter jobs
  const filteredList = useMemo(() => {
    return filterJobs(JOB_POSTINGS, {
      searchQuery,
      roleCategory,
      experienceLevel,
      remoteType,
      industry,
      sortBy
    });
  }, [searchQuery, roleCategory, experienceLevel, remoteType, industry, sortBy]);

  // Handlers that reset page to 1
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRoleChange = (value: string) => {
    setRoleCategory(value);
    setCurrentPage(1);
  };

  const handleExperienceChange = (value: string) => {
    setExperienceLevel(value);
    setCurrentPage(1);
  };

  const handleRemoteChange = (value: string) => {
    setRemoteType(value);
    setCurrentPage(1);
  };

  const handleIndustryChange = (value: string) => {
    setIndustry(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: 'dateDesc' | 'dateAsc' | 'salaryDesc' | 'salaryAsc' | 'title') => {
    setSortBy(value);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedJobs = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, safeCurrentPage]);

  const handleExport = () => {
    exportCSV(filteredList, `filtered_job_postings_${filteredList.length}_records.csv`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-cyan-400" />
              Job Postings Explorer &amp; Mining Dataset Viewer
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Search, filter, sort, and inspect {JOB_POSTINGS.length} raw job posting records used in the data mining algorithms. Download custom subsets as CSV.
            </p>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV ({filteredList.length})</span>
          </button>
        </div>
      </div>

      {/* Search & Multi-Field Filter Bar */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800 bg-slate-900/60 space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search job title, company, skills (e.g., Senior React, Python, AWS)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-3 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${hasIndustryData ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3 text-xs`}>
          {/* Role Category Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Role Category</label>
            <select
              value={roleCategory}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Categories</option>
              {ROLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          {/* Experience Level Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Experience Level</label>
            <select
              value={experienceLevel}
              onChange={(e) => handleExperienceChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Levels</option>
              {EXPERIENCE_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
            </select>
          </div>

          {/* Remote Type Filter */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Remote Type</label>
            <select
              value={remoteType}
              onChange={(e) => handleRemoteChange(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="All">All Workplace Types</option>
              {REMOTE_TYPES.map(rem => <option key={rem} value={rem}>{rem}</option>)}
            </select>
          </div>

          {/* Industry Filter (rendered only when data is available) */}
          {hasIndustryData && (
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Industry</label>
              <select
                value={industry}
                onChange={(e) => handleIndustryChange(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="All">All Industries</option>
                {INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
              </select>
            </div>
          )}

          {/* Sort By */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Sort Order</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value as any)}
              className="w-full bg-slate-800/80 border border-slate-700 text-white px-3 py-1.5 rounded-xl focus:outline-none focus:border-cyan-500 cursor-pointer font-semibold"
            >
              <option value="dateDesc">Newest First</option>
              <option value="dateAsc">Oldest First</option>
              {hasSalaryData && <option value="salaryDesc">Salary: High to Low</option>}
              {hasSalaryData && <option value="salaryAsc">Salary: Low to High</option>}
              <option value="title">Job Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-2">
        <span>Showing <strong>{paginatedJobs.length}</strong> of <strong>{filteredList.length}</strong> matching postings</span>
        <span>Page {safeCurrentPage} of {totalPages}</span>
      </div>

      {/* Job Cards List */}
      <div className="space-y-4">
        {paginatedJobs.length > 0 ? (
          paginatedJobs.map((job) => (
            <div
              key={job.id}
              onClick={() => setSelectedJob(job)}
              className="glass-card rounded-2xl p-5 border border-slate-800 bg-slate-900/60 hover:bg-slate-800/50 transition-all cursor-pointer group flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700">
                    {job.id}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {job.roleCategory}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    {job.experienceLevel}
                  </span>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {job.remoteType}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  {job.title}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 font-semibold text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salary > 0 ? `$${job.salary.toLocaleString()} / year` : 'Salary: N/A'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {job.datePosted}
                  </span>
                </div>

                {/* Skill Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/80 text-[11px]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                <button className="w-full md:w-auto px-4 py-2 bg-slate-800 group-hover:bg-cyan-600 text-slate-200 group-hover:text-white rounded-xl text-xs font-semibold transition-colors">
                  View Posting
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 text-slate-500 text-sm glass-card rounded-2xl">
            No job postings match your filter criteria. Try adjusting your query or resetting filters.
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <button
            disabled={safeCurrentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <span className="text-xs font-mono text-slate-400">
            Page {safeCurrentPage} of {totalPages}
          </span>

          <button
            disabled={safeCurrentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="flex items-center space-x-1 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-semibold text-white transition-colors"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scrollbar-thin p-6 space-y-6 relative animate-scaleUp">
            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/80"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {selectedJob.id}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                  {selectedJob.roleCategory}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white">{selectedJob.title}</h2>
              <p className="text-sm font-semibold text-cyan-400 mt-0.5">{selectedJob.company}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Location</span>
                <strong className="text-slate-200">{selectedJob.location}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Salary</span>
                <strong className="text-emerald-400 font-mono">
                  {selectedJob.salary > 0 ? `$${selectedJob.salary.toLocaleString()} USD` : 'N/A'}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Experience</span>
                <strong className="text-slate-200">{selectedJob.experienceLevel}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Workplace</span>
                <strong className="text-slate-200">{selectedJob.remoteType}</strong>
              </div>
              {selectedJob.education !== 'Not specified' && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Education</span>
                  <strong className="text-slate-200">{selectedJob.education}</strong>
                </div>
              )}
              {selectedJob.industry !== 'Not specified' && (
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Industry</span>
                  <strong className="text-slate-200">{selectedJob.industry}</strong>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Technical Required Skills:</h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedJob.skills.map(s => (
                  <span key={s} className="px-3 py-1 rounded-lg bg-blue-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Job Description:</h4>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/40 p-4 rounded-xl border border-slate-800 font-sans">
                {selectedJob.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
