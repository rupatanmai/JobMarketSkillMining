import rawJobPostings from './jobPostings.json';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  experienceLevel: string;
  salary: number;
  datePosted: string;
  description: string;
  skills: string[];
  roleCategory: string;
  education: string;
  remoteType: string;
  industry: string;
}

export const JOB_POSTINGS: JobPosting[] = rawJobPostings as JobPosting[];

export const ALL_SKILLS: string[] = Array.from(
  new Set(JOB_POSTINGS.flatMap(j => j.skills))
).sort();

// Only categories with at least 100 postings
const categoryCounts = JOB_POSTINGS.reduce<Record<string, number>>((acc, j) => {
  acc[j.roleCategory] = (acc[j.roleCategory] || 0) + 1;
  return acc;
}, {});

export const ROLE_CATEGORIES: string[] = Object.keys(categoryCounts)
  .filter(cat => categoryCounts[cat] >= 100)
  .sort();

export const EXPERIENCE_LEVELS: string[] = [
  'Entry-Level',
  'Mid-Level',
  'Senior-Level',
  'Lead / Executive'
];

// Values actually present in the dataset
export const REMOTE_TYPES: string[] = Array.from(
  new Set(JOB_POSTINGS.map(j => j.remoteType))
).sort();

export const INDUSTRIES: string[] = Array.from(
  new Set(JOB_POSTINGS.map(j => j.industry))
).sort();
