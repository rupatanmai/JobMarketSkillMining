import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Seeded PRNG (mulberry32) for deterministic dataset generation
function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = mulberry32(1337);

function randomFloat(min = 0, max = 1) {
  return min + rng() * (max - min);
}

function randomInt(min, max) {
  return Math.floor(randomFloat(min, max + 1));
}

function randomChoice(arr) {
  return arr[Math.floor(rng() * arr.length)];
}

const ROLE_PRESETS = [
  {
    roleCategory: "Data Science & AI",
    titles: [
      { title: "Senior Data Scientist", mandatory: ["Python", "Machine Learning", "SQL", "Pandas"] },
      { title: "Machine Learning Engineer", mandatory: ["Python", "Machine Learning", "PyTorch"] },
      { title: "AI Research Scientist", mandatory: ["Python", "PyTorch", "Deep Learning", "Machine Learning"] },
      { title: "Lead ML Engineer", mandatory: ["Python", "Machine Learning", "MLOps", "Docker"] },
      { title: "Computer Vision Specialist", mandatory: ["Python", "PyTorch", "Deep Learning", "NumPy"] },
      { title: "NLP Engineer", mandatory: ["Python", "NLP", "PyTorch", "Machine Learning"] },
      { title: "Applied Data Scientist", mandatory: ["Python", "Scikit-Learn", "SQL", "Pandas"] },
      { title: "LLM Applications Engineer", mandatory: ["Python", "NLP", "PyTorch", "Docker"] },
      { title: "AI Infrastructure Engineer", mandatory: ["Python", "Docker", "Kubernetes", "PyTorch", "AWS"] }
    ],
    skillPool: [
      "Python", "Machine Learning", "SQL", "Pandas", "NumPy", "Scikit-Learn",
      "PyTorch", "TensorFlow", "Deep Learning", "NLP", "Docker", "Git",
      "AWS", "Spark", "Kubernetes", "Data Mining", "MLOps"
    ],
    salaryOffset: 12000,
    industries: ["Technology", "Healthcare", "Finance & Banking", "Automotive / AI"]
  },
  {
    roleCategory: "Data Analytics",
    titles: [
      { title: "Data Analyst", mandatory: ["SQL", "Excel", "Tableau"] },
      { title: "Senior Business Intelligence Analyst", mandatory: ["SQL", "Power BI", "Data Visualization", "ETL"] },
      { title: "Analytics Engineer", mandatory: ["SQL", "Snowflake", "ETL", "Python"] },
      { title: "Reporting & Insights Analyst", mandatory: ["SQL", "Excel", "Power BI", "Jira"] },
      { title: "Product Analyst", mandatory: ["SQL", "Python", "Tableau", "Statistics"] },
      { title: "Financial Data Analyst", mandatory: ["SQL", "Excel", "Python", "Statistics"] },
      { title: "Quantitative Data Analyst", mandatory: ["Python", "SQL", "Pandas", "Statistics", "R"] }
    ],
    skillPool: [
      "SQL", "Power BI", "Tableau", "Excel", "Python", "Pandas",
      "Data Visualization", "ETL", "Statistics", "R", "Snowflake",
      "BigQuery", "Git", "Jira"
    ],
    salaryOffset: 0,
    industries: ["Finance & Banking", "E-Commerce", "Healthcare", "Technology", "Telecommunications"]
  },
  {
    roleCategory: "Frontend Development",
    titles: [
      { title: "Frontend Developer", mandatory: ["JavaScript", "HTML/CSS", "React"] },
      { title: "Senior React Developer", mandatory: ["React", "JavaScript", "TypeScript", "Tailwind CSS"] },
      { title: "UI/UX Engineer", mandatory: ["Figma", "HTML/CSS", "JavaScript", "React"] },
      { title: "Full Stack Frontend Developer", mandatory: ["React", "TypeScript", "Node.js", "REST APIs"] },
      { title: "Lead Web Engineer", mandatory: ["JavaScript", "TypeScript", "React", "GraphQL"] },
      { title: "TypeScript Developer", mandatory: ["TypeScript", "JavaScript", "React", "Node.js"] },
      { title: "Next.js Frontend Specialist", mandatory: ["Next.js", "React", "TypeScript", "Tailwind CSS"] }
    ],
    skillPool: [
      "JavaScript", "TypeScript", "React", "HTML/CSS", "Tailwind CSS",
      "Next.js", "Redux", "Node.js", "REST APIs", "Git", "Webpack",
      "Jest", "Figma", "GraphQL"
    ],
    salaryOffset: 4000,
    industries: ["Technology", "E-Commerce", "Media & Gaming", "Finance & Banking"]
  },
  {
    roleCategory: "Backend Development",
    titles: [
      { title: "Backend Engineer", mandatory: ["SQL", "PostgreSQL", "REST APIs", "Microservices"] },
      { title: "Senior Java Developer", mandatory: ["Java", "Spring Boot", "SQL", "Microservices"] },
      { title: "Node.js Services Engineer", mandatory: ["Node.js", "JavaScript", "TypeScript", "REST APIs"] },
      { title: "Distributed Systems Engineer", mandatory: ["Go", "Docker", "Kafka", "Microservices"] },
      { title: "API Infrastructure Developer", mandatory: ["Node.js", "REST APIs", "Docker", "Redis"] },
      { title: "Lead Software Engineer", mandatory: ["Java", "Spring Boot", "Microservices", "Docker", "AWS"] },
      { title: "Python Backend Developer", mandatory: ["Python", "SQL", "PostgreSQL", "REST APIs"] },
      { title: "Go Backend Engineer", mandatory: ["Go", "Docker", "PostgreSQL", "REST APIs"] }
    ],
    skillPool: [
      "Java", "Spring Boot", "SQL", "PostgreSQL", "Node.js", "Microservices",
      "Docker", "REST APIs", "Redis", "Kafka", "Go", "Python",
      "MongoDB", "AWS", "Git", "gRPC"
    ],
    salaryOffset: 8000,
    industries: ["Technology", "Finance & Banking", "E-Commerce", "Telecommunications"]
  },
  {
    roleCategory: "Cloud & DevOps",
    titles: [
      { title: "DevOps Engineer", mandatory: ["AWS", "Docker", "Kubernetes", "CI/CD", "Linux"] },
      { title: "Cloud Infrastructure Architect", mandatory: ["AWS", "Terraform", "Kubernetes", "Linux"] },
      { title: "Site Reliability Engineer (SRE)", mandatory: ["Linux", "Docker", "Kubernetes", "Python", "Prometheus"] },
      { title: "Kubernetes Administrator", mandatory: ["Kubernetes", "Docker", "Linux", "CI/CD"] },
      { title: "AWS Cloud Engineer", mandatory: ["AWS", "Docker", "Terraform", "Linux"] },
      { title: "Platform Engineer", mandatory: ["Kubernetes", "Terraform", "Docker", "Go"] },
      { title: "Cloud Security Engineer", mandatory: ["AWS", "Linux", "Docker", "Cybersecurity", "Terraform"] }
    ],
    skillPool: [
      "AWS", "Docker", "Kubernetes", "Terraform", "Linux", "CI/CD",
      "Python", "Azure", "Bash", "GitOps", "Ansible", "Prometheus",
      "Grafana", "Git", "GCP", "Cybersecurity"
    ],
    salaryOffset: 14000,
    industries: ["Technology", "Finance & Banking", "Cybersecurity", "E-Commerce"]
  },
  {
    roleCategory: "Cybersecurity",
    titles: [
      { title: "Cybersecurity Analyst", mandatory: ["Cybersecurity", "Network Security", "Linux", "SIEM"] },
      { title: "Information Security Engineer", mandatory: ["Cybersecurity", "Firewalls", "CISSP", "Linux"] },
      { title: "Penetration Tester", mandatory: ["Penetration Testing", "Cybersecurity", "Linux", "Network Security"] },
      { title: "Security Operations Center (SOC) Analyst", mandatory: ["Cybersecurity", "SIEM", "Network Security", "Wireshark"] },
      { title: "Cloud Security Architect", mandatory: ["Cybersecurity", "AWS", "Docker", "Network Security"] },
      { title: "Identity & Access Engineer", mandatory: ["Cybersecurity", "Identity Management", "Linux"] }
    ],
    skillPool: [
      "Cybersecurity", "Linux", "Network Security", "Python", "SIEM",
      "Penetration Testing", "AWS", "Cryptography", "CISSP", "Firewalls",
      "Wireshark", "Identity Management", "Docker"
    ],
    salaryOffset: 10000,
    industries: ["Cybersecurity", "Finance & Banking", "Technology", "Healthcare"]
  }
];

const COMPANIES = [
  "TechCorp AI", "DataMind Solutions", "CloudScale Networks", "FinTech Dynamics",
  "InnovateX Labs", "CyberShield Inc.", "Global Nexus Systems", "Apex Analytics",
  "Pulse Health Technologies", "OmniStream Media", "Starlight Systems", "Quantum Leap AI",
  "Vanguard Tech", "BlueWave Digital", "Hyperion Analytics", "AeroSoft Systems",
  "Zenith Financial", "Velocity DevOps", "CoreLogic Software", "Enterprise Vision"
];

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA",
  "Boston, MA", "Chicago, IL", "Remote - US", "London, UK",
  "Toronto, ON", "Bengaluru, India", "Berlin, Germany", "Denver, CO"
];

const EXP_LEVELS = ["Entry-Level", "Mid-Level", "Senior-Level", "Lead / Executive"];
const REMOTE_TYPES = ["Remote", "Hybrid", "On-site"];

// Realistic Base Salaries by experience level: Entry < Mid < Senior < Lead
const SALARY_BY_LEVEL = {
  "Entry-Level": { baseMin: 68000, baseMax: 88000 },
  "Mid-Level": { baseMin: 102000, baseMax: 138000 },
  "Senior-Level": { baseMin: 152000, baseMax: 198000 },
  "Lead / Executive": { baseMin: 212000, baseMax: 265000 }
};

function getRealisticEducation(expLevel, roleCategory) {
  const r = rng();
  if (roleCategory === "Data Science & AI") {
    if (expLevel === "Lead / Executive") return r < 0.45 ? "PhD" : "Master's Degree";
    if (expLevel === "Senior-Level") return r < 0.25 ? "PhD" : r < 0.75 ? "Master's Degree" : "Bachelor's Degree";
    if (expLevel === "Mid-Level") return r < 0.5 ? "Master's Degree" : "Bachelor's Degree";
    return r < 0.25 ? "Master's Degree" : "Bachelor's Degree";
  }

  if (expLevel === "Lead / Executive") {
    return r < 0.4 ? "Master's Degree" : "Bachelor's Degree";
  }
  if (expLevel === "Senior-Level") {
    return r < 0.25 ? "Master's Degree" : "Bachelor's Degree";
  }
  if (expLevel === "Mid-Level") {
    return r < 0.85 ? "Bachelor's Degree" : "Associate / Diploma";
  }
  // Entry-Level
  return r < 0.75 ? "Bachelor's Degree" : r < 0.9 ? "Associate / Diploma" : "Any / Self-taught";
}

function getRandomDate() {
  // Spanning from Oct 1, 2025 to Mar 31, 2026
  const start = new Date(2025, 9, 1).getTime();
  const end = new Date(2026, 2, 31).getTime();
  const t = start + rng() * (end - start);
  const d = new Date(t);
  return d.toISOString().split('T')[0];
}

const RESPONSIBILITY_TEMPLATES = [
  "Spearhead the architecture and end-to-end implementation of enterprise solutions.",
  "Design, construct, and optimize mission-critical software pipelines and automated services.",
  "Drive technical decisions, peer code reviews, and cross-functional team alignment.",
  "Collaborate with product and infrastructure squads to deliver resilient, scalable features.",
  "Ensure strict adherence to security protocols, continuous integration, and performance SLAs.",
  "Lead technical initiatives, mentor junior developers, and elevate code quality standards."
];

function generatePostings(count = 520) {
  const postings = [];

  for (let i = 1; i <= count; i++) {
    const preset = ROLE_PRESETS[(i - 1) % ROLE_PRESETS.length];
    const id = `JOB-${1000 + i}`;
    const titleObj = randomChoice(preset.titles);
    const title = titleObj.title;
    const company = randomChoice(COMPANIES);
    const location = randomChoice(LOCATIONS);
    const expLevel = randomChoice(EXP_LEVELS);

    // Guaranteed realistic salary hierarchy: Entry < Mid < Senior < Lead
    const levelBounds = SALARY_BY_LEVEL[expLevel];
    const baseSal = randomInt(levelBounds.baseMin, levelBounds.baseMax);
    const noise = randomInt(-2000, 2000);
    const finalSalary = Math.round((baseSal + preset.salaryOffset + noise) / 1000) * 1000;

    const datePosted = getRandomDate();
    const month = parseInt(datePosted.split('-')[1], 10); // 10, 11, 12, 1, 2, 3
    const isLatePeriod = month >= 1 && month <= 3; // Jan, Feb, Mar 2026

    const industry = randomChoice(preset.industries);
    const education = getRealisticEducation(expLevel, preset.roleCategory);
    const remoteType = randomChoice(REMOTE_TYPES);

    // Build skill set: MUST include title mandatory skills
    const selectedSkills = new Set([...titleObj.mandatory]);

    // Trend induction:
    // Growing skills: PyTorch, Kubernetes, TypeScript (boosted in late period)
    // Declining skills: Excel, Bash (boosted in early period)
    if (isLatePeriod) {
      if (preset.roleCategory === "Data Science & AI" && rng() < 0.65) selectedSkills.add("PyTorch");
      if ((preset.roleCategory === "Cloud & DevOps" || preset.roleCategory === "Backend Development") && rng() < 0.6) selectedSkills.add("Kubernetes");
      if (preset.roleCategory === "Frontend Development" && rng() < 0.7) selectedSkills.add("TypeScript");
    } else {
      if (preset.roleCategory === "Data Analytics" && rng() < 0.7) selectedSkills.add("Excel");
      if (preset.roleCategory === "Cloud & DevOps" && rng() < 0.5) selectedSkills.add("Bash");
    }

    // Co-occurrence patterns
    if (selectedSkills.has("Python") && rng() < 0.6) selectedSkills.add("SQL");
    if (selectedSkills.has("Python") && selectedSkills.has("SQL") && rng() < 0.55) selectedSkills.add("Pandas");
    if (selectedSkills.has("Java") && rng() < 0.8) selectedSkills.add("Spring Boot");
    if (selectedSkills.has("React") && rng() < 0.7) selectedSkills.add("JavaScript");
    if (selectedSkills.has("AWS") && rng() < 0.7) selectedSkills.add("Docker");
    if (selectedSkills.has("AWS") && selectedSkills.has("Docker") && rng() < 0.6) selectedSkills.add("Kubernetes");

    // Add extra skills from preset pool until 4-7 total skills
    const targetSkillCount = randomInt(4, 7);
    const pool = preset.skillPool;
    let safety = 0;
    while (selectedSkills.size < targetSkillCount && safety < 50) {
      safety++;
      selectedSkills.add(randomChoice(pool));
    }

    const skillsArr = Array.from(selectedSkills);

    const resp1 = randomChoice(RESPONSIBILITY_TEMPLATES);
    const resp2 = randomChoice(RESPONSIBILITY_TEMPLATES);
    const keySkillsStr = skillsArr.slice(0, 4).join(", ");

    const description = `${company} is actively seeking a qualified ${title} to join our high-impact team in ${location}. In this ${expLevel.toLowerCase()} capacity, you will contribute directly to modern enterprise solutions and scalable distributed applications.

Primary Responsibilities:
- ${resp1}
- ${resp2}
- Apply modern best practices utilizing ${keySkillsStr}.
- Collaborate actively within a ${remoteType.toLowerCase()} setting to maintain high reliability and performance standards.

Required Qualifications & Competencies:
- Demonstrable hands-on experience in: ${skillsArr.join(", ")}.
- Minimum ${education} in Computer Science, Software Engineering, Data Science, or an equivalent technical field.
- Track record of delivering quality code and technical excellence.`;

    postings.push({
      id,
      title,
      company,
      location,
      experienceLevel: expLevel,
      salary: finalSalary,
      datePosted,
      description,
      skills: skillsArr,
      roleCategory: preset.roleCategory,
      education,
      remoteType,
      industry
    });
  }

  return postings;
}

const data = generatePostings(520);

// Write TypeScript file
const tsContent = `/**
 * DEMO / SYNTHETIC DATASET NOTICE:
 * This dataset contains 520 synthetic job-posting records designed specifically
 * for academic Data Mining and Data Warehousing (DMDW) demonstration.
 * All records, salaries, and company postings are analytical mock data.
 */

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  experienceLevel: 'Entry-Level' | 'Mid-Level' | 'Senior-Level' | 'Lead / Executive' | string;
  salary: number;
  datePosted: string;
  description: string;
  skills: string[];
  roleCategory: 'Data Science & AI' | 'Data Analytics' | 'Frontend Development' | 'Backend Development' | 'Cloud & DevOps' | 'Cybersecurity' | string;
  education: string;
  remoteType: 'Remote' | 'Hybrid' | 'On-site' | string;
  industry: string;
}

export const ROLE_CATEGORIES = [
  "Data Science & AI",
  "Data Analytics",
  "Frontend Development",
  "Backend Development",
  "Cloud & DevOps",
  "Cybersecurity"
];

export const EXPERIENCE_LEVELS = [
  "Entry-Level",
  "Mid-Level",
  "Senior-Level",
  "Lead / Executive"
];

export const REMOTE_TYPES = ["Remote", "Hybrid", "On-site"];

export const INDUSTRIES = [
  "Technology",
  "Finance & Banking",
  "Healthcare",
  "E-Commerce",
  "Cybersecurity",
  "Telecommunications",
  "Automotive / AI",
  "Media & Gaming"
];

export const JOB_POSTINGS: JobPosting[] = ${JSON.stringify(data, null, 2)};

// Derived automatically from all unique skills across all 520 job postings
export const ALL_SKILLS: string[] = Array.from(
  new Set(JOB_POSTINGS.flatMap((j) => j.skills))
).sort();
`;

const srcDataDir = path.join(__dirname, '../src/data');
const publicDataDir = path.join(__dirname, '../public/data');
if (!fs.existsSync(srcDataDir)) fs.mkdirSync(srcDataDir, { recursive: true });
if (!fs.existsSync(publicDataDir)) fs.mkdirSync(publicDataDir, { recursive: true });

fs.writeFileSync(path.join(srcDataDir, 'jobPostings.ts'), tsContent);

// Write CSV file
const csvHeader = 'Job ID,Job Title,Company,Location,Experience Level,Salary,Date Posted,Job Description,Skills,Role Category,Education,Remote Type,Industry\n';
const csvRows = data.map(job => {
  const escapeCsv = (str) => `"${String(str).replace(/"/g, '""')}"`;
  return [
    job.id,
    escapeCsv(job.title),
    escapeCsv(job.company),
    escapeCsv(job.location),
    job.experienceLevel,
    job.salary,
    job.datePosted,
    escapeCsv(job.description.replace(/\n/g, ' ')),
    escapeCsv(job.skills.join('; ')),
    escapeCsv(job.roleCategory),
    escapeCsv(job.education),
    job.remoteType,
    escapeCsv(job.industry)
  ].join(',');
});

fs.writeFileSync(path.join(publicDataDir, 'job_postings.csv'), csvHeader + csvRows.join('\n'));

console.log(`Successfully generated ${data.length} job postings with dynamic ALL_SKILLS export.`);
