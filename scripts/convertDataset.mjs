import fs from 'fs';
import path from 'path';

// Mulberry32 PRNG with fixed seed
function mulberry32(seed) {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Streaming CSV parser
async function parseCSVStream(filePath, onRow) {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
    let inQuotes = false;
    let currentField = '';
    let currentRow = [];
    let rowCount = 0;

    stream.on('data', (chunk) => {
      for (let i = 0; i < chunk.length; i++) {
        const char = chunk[i];
        if (inQuotes) {
          if (char === '"') {
            if (i + 1 < chunk.length && chunk[i + 1] === '"') {
              currentField += '"';
              i++;
            } else {
              inQuotes = false;
            }
          } else {
            currentField += char;
          }
        } else {
          if (char === '"') {
            inQuotes = true;
          } else if (char === ',') {
            currentRow.push(currentField);
            currentField = '';
          } else if (char === '\n' || char === '\r') {
            if (char === '\r' && i + 1 < chunk.length && chunk[i + 1] === '\n') {
              i++;
            }
            currentRow.push(currentField);
            currentField = '';
            if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
              rowCount++;
              onRow(currentRow, rowCount);
            }
            currentRow = [];
          } else {
            currentField += char;
          }
        }
      }
    });

    stream.on('end', () => {
      if (currentField !== '' || currentRow.length > 0) {
        currentRow.push(currentField);
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
          rowCount++;
          onRow(currentRow, rowCount);
        }
      }
      resolve(rowCount);
    });

    stream.on('error', err => reject(err));
    stream.on('close', () => resolve(rowCount));
  });
}

// Canonical skill mapping
const SKILL_CANONICAL = {
  'python': 'Python',
  'sql': 'SQL',
  'java': 'Java',
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'c++': 'C++',
  'c#': 'C#',
  '.net': '.NET',
  'asp.net': 'ASP.NET',
  'r': 'R',
  'go': 'Go',
  'golang': 'Go',
  'rust': 'Rust',
  'scala': 'Scala',
  'php': 'PHP',
  'ruby': 'Ruby',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'sass': 'SASS',
  'scss': 'SASS',
  'react': 'React',
  'react.js': 'React',
  'reactjs': 'React',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'vue': 'Vue.js',
  'vue.js': 'Vue.js',
  'vuejs': 'Vue.js',
  'node': 'Node.js',
  'node.js': 'Node.js',
  'nodejs': 'Node.js',
  'express': 'Express',
  'express.js': 'Express',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',
  'spring': 'Spring Boot',
  'spring boot': 'Spring Boot',
  'aws': 'AWS',
  'azure': 'Azure',
  'gcp': 'GCP',
  'google cloud': 'GCP',
  'google cloud platform': 'GCP',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'terraform': 'Terraform',
  'ansible': 'Ansible',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'jenkins': 'Jenkins',
  'git': 'Git',
  'github': 'Git',
  'gitlab': 'Git',
  'linux': 'Linux',
  'bash': 'Bash',
  'powershell': 'PowerShell',
  'spark': 'Spark',
  'apache spark': 'Spark',
  'pyspark': 'Spark',
  'hadoop': 'Hadoop',
  'apache hadoop': 'Hadoop',
  'kafka': 'Kafka',
  'apache kafka': 'Kafka',
  'airflow': 'Airflow',
  'apache airflow': 'Airflow',
  'snowflake': 'Snowflake',
  'bigquery': 'BigQuery',
  'databricks': 'Databricks',
  'tableau': 'Tableau',
  'power bi': 'Power BI',
  'powerbi': 'Power BI',
  'excel': 'Excel',
  'microsoft excel': 'Excel',
  'pandas': 'Pandas',
  'numpy': 'NumPy',
  'scikit-learn': 'Scikit-Learn',
  'sklearn': 'Scikit-Learn',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'deep learning': 'Deep Learning',
  'nlp': 'NLP',
  'natural language processing': 'NLP',
  'computer vision': 'Computer Vision',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mysql': 'MySQL',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'elasticsearch': 'Elasticsearch',
  'oracle': 'Oracle',
  'sql server': 'SQL Server',
  'ms sql': 'SQL Server',
  'microsoft sql server': 'SQL Server',
  'graphql': 'GraphQL',
  'rest': 'REST APIs',
  'rest api': 'REST APIs',
  'rest apis': 'REST APIs',
  'restful': 'REST APIs',
  'microservices': 'Microservices',
  'etl': 'ETL',
  'data analysis': 'Data Analysis',
  'data modeling': 'Data Modeling',
  'data warehousing': 'Data Warehousing',
  'data warehouse': 'Data Warehousing',
  'data visualization': 'Data Visualization',
  'business intelligence': 'Business Intelligence',
  'bi': 'Business Intelligence',
  'jira': 'Jira',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'nosql': 'NoSQL'
};

// Role Category matching rules:
// First matching rule wins. New order: Data Science & AI, Frontend Development, Data Analytics, Cloud & DevOps, Backend Development.
function matchRoleCategory(title) {
  const t = title.toLowerCase();
  if (/\b(data scientist|machine learning|ml|ai|nlp|research scientist)\b/.test(t)) {
    return 'Data Science & AI';
  }
  if (/\b(front[-\s]?end|frontend|front|react\w*|vue\w*|ui)\b/.test(t)) {
    return 'Frontend Development';
  }
  if (/\b(data analyst|business intelligence|bi|analytics|data engineer\w*)\b/.test(t)) {
    return 'Data Analytics';
  }
  if (/\b(devops|cloud|sre|site reliability|kubernetes|platform)\b/.test(t)) {
    return 'Cloud & DevOps';
  }
  if (/\b(backend|back[-\s]?end|java|python|node|golang|software engineer\w*|full stack)\b/.test(t)) {
    return 'Backend Development';
  }
  return null;
}

function formatDate(dateStr) {
  if (!dateStr) return '2023-12-20';
  const parts = dateStr.trim().split('-');
  if (parts.length === 3) {
    if (parts[0].length === 4) return dateStr; // YYYY-MM-DD
    return `${parts[2]}-${parts[1]}-${parts[0]}`; // DD-MM-YYYY -> YYYY-MM-DD
  }
  return dateStr;
}

function mapRemoteType(type) {
  if (!type) return 'Not specified';
  const t = type.toLowerCase();
  if (t.includes('remote')) return 'Remote';
  if (t.includes('hybrid')) return 'Hybrid';
  if (t.includes('onsite')) return 'Onsite';
  return 'Not specified';
}

function mapExperienceLevel(jobLevel, title) {
  const t = (title || '').toLowerCase();
  const lvl = (jobLevel || '').toLowerCase();

  if (/\b(lead|principal|staff|director|head|vp|manager|architect)\b/.test(t)) {
    return 'Lead / Executive';
  }
  if (/\b(senior|sr\b|sr\.)/.test(t)) {
    return 'Senior-Level';
  }
  if (lvl.includes('associate') || /\b(junior|jr\b|jr\.|entry|intern|graduate|trainee)\b/.test(t)) {
    return 'Entry-Level';
  }
  return 'Mid-Level';
}

async function convertDataset() {
  console.log('--- STARTING DATASET CONVERSION ---');

  const files = [
    { file: 'postings1.csv', dataset: 'Data Analyst Job Postings' },
    { file: 'postings2.csv', dataset: 'LinkedIn Software Engineering Jobs Dataset' },
    { file: 'postings3.csv', dataset: 'LinkedIn Data Engineer Job Postings' }
  ];

  const seenKeys = new Set();
  const rawCandidateRows = [];

  for (const { file, dataset } of files) {
    const filePath = path.resolve('data-raw', file);
    let titleIdx = -1, compIdx = -1, locIdx = -1, skillsIdx = -1, levelIdx = -1, typeIdx = -1, seenIdx = -1, sumIdx = -1;

    await parseCSVStream(filePath, (row, idx) => {
      if (idx === 1) {
        const norm = row.map(h => h.replace(/^\ufeff/, '').trim());
        titleIdx = norm.findIndex(h => h === 'job_title' || h === 'job title');
        compIdx = norm.findIndex(h => h === 'company');
        locIdx = norm.findIndex(h => h === 'job_location' || h === 'job location');
        skillsIdx = norm.findIndex(h => h === 'job_skills' || h === 'job skills');
        levelIdx = norm.findIndex(h => h === 'job_level' || h === 'job level');
        typeIdx = norm.findIndex(h => h === 'job_type' || h === 'job type');
        seenIdx = norm.findIndex(h => h === 'first_seen' || h === 'first seen');
        sumIdx = norm.findIndex(h => h === 'job_summary' || h === 'job summary');
        return;
      }

      const title = (row[titleIdx] || '').trim();
      const skillsStr = (row[skillsIdx] || '').trim();
      const company = (row[compIdx] || '').trim();
      const location = (row[locIdx] || '').trim();

      // Drop rows with empty title or empty job_skills
      if (!title || !skillsStr) return;

      // Deduplicate (same title + company + location)
      const key = `${title.toLowerCase()}|${company.toLowerCase()}|${location.toLowerCase()}`;
      if (seenKeys.has(key)) return;
      seenKeys.add(key);

      // Match roleCategory
      const roleCategory = matchRoleCategory(title);
      if (!roleCategory) return;

      rawCandidateRows.push({
        title,
        company,
        location,
        skillsStr,
        roleCategory,
        jobLevel: row[levelIdx] || '',
        jobType: row[typeIdx] || '',
        firstSeen: row[seenIdx] || '',
        jobSummary: row[sumIdx] || '',
        dataset
      });
    });
  }

  console.log(`Total deduplicated & role-matched rows: ${rawCandidateRows.length}`);

  // Calculate skill occurrences across data
  const skillOccurrences = new Map();
  for (const r of rawCandidateRows) {
    const split = r.skillsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const uniqueRowSkills = new Set();
    for (const raw of split) {
      const canon = SKILL_CANONICAL[raw];
      if (canon) uniqueRowSkills.add(canon);
    }
    for (const s of uniqueRowSkills) {
      skillOccurrences.set(s, (skillOccurrences.get(s) || 0) + 1);
    }
  }

  // Keep only skills that appear >= 15 times
  const qualifiedSkills = new Set();
  const sortedSkillCounts = Array.from(skillOccurrences.entries()).sort((a, b) => b[1] - a[1]);
  for (const [skill, count] of sortedSkillCounts) {
    if (count >= 15) {
      qualifiedSkills.add(skill);
    }
  }
  console.log(`Skills appearing >= 15 times: ${qualifiedSkills.size}`);

  // Filter rows: drop rows left with fewer than 2 skills
  const categorizedRows = {
    'Data Science & AI': [],
    'Frontend Development': [],
    'Cloud & DevOps': [],
    'Data Analytics': [],
    'Backend Development': []
  };

  for (const r of rawCandidateRows) {
    const split = r.skillsStr.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const rowSkills = Array.from(new Set(split.map(s => SKILL_CANONICAL[s]).filter(s => s && qualifiedSkills.has(s)))).sort();
    if (rowSkills.length >= 2) {
      categorizedRows[r.roleCategory].push({
        ...r,
        skills: rowSkills
      });
    }
  }

  console.log('Available qualified rows per category:');
  for (const [cat, rows] of Object.entries(categorizedRows)) {
    console.log(`  ${cat}: ${rows.length}`);
  }

  // Balanced sampling of exactly 3000 rows (no category > 40% = 1200 max)
  const rng = mulberry32(424242);

  // Shuffle within each category
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  const shuffledCats = {};
  for (const [cat, rows] of Object.entries(categorizedRows)) {
    shuffledCats[cat] = shuffle(rows);
  }

  // Select balanced quota
  // Smaller categories take all available rows:
  const dsRows = shuffledCats['Data Science & AI'];
  const feRows = shuffledCats['Frontend Development'];
  const devopsRows = shuffledCats['Cloud & DevOps'];

  const takenSmaller = dsRows.length + feRows.length + devopsRows.length;
  const remainingNeeded = 3000 - takenSmaller;

  // Split remaining evenly between Data Analytics and Backend Development
  const daQuota = Math.floor(remainingNeeded / 2); // 863
  const beQuota = remainingNeeded - daQuota; // 864

  const daRows = shuffledCats['Data Analytics'].slice(0, daQuota);
  const beRows = shuffledCats['Backend Development'].slice(0, beQuota);

  const selectedPool = [
    ...dsRows,
    ...feRows,
    ...devopsRows,
    ...daRows,
    ...beRows
  ];

  console.log(`Total selected rows: ${selectedPool.length}`);
  // Shuffle overall pool
  const finalShuffled = shuffle(selectedPool);

  // Map to JobPosting interface
  const jobPostings = finalShuffled.map((item, index) => {
    const id = `JOB-${1001 + index}`;
    const datePosted = formatDate(item.firstSeen);
    const remoteType = mapRemoteType(item.jobType);
    const experienceLevel = mapExperienceLevel(item.jobLevel, item.title);
    
    let description = '';
    if (item.jobSummary && item.jobSummary.trim().length > 0) {
      const codePoints = Array.from(item.jobSummary.trim());
      description = codePoints.slice(0, 300).join('').toWellFormed();
    } else {
      description = `${item.title} opportunity at ${item.company} in ${item.location}. Key technical skills required: ${item.skills.join(', ')}.`;
    }

    return {
      id,
      title: item.title.toWellFormed(),
      company: item.company.toWellFormed(),
      location: item.location.toWellFormed(),
      experienceLevel,
      salary: 0,
      datePosted,
      description,
      skills: item.skills,
      roleCategory: item.roleCategory,
      education: 'Not specified',
      remoteType,
      industry: 'Not specified'
    };
  });

  // Verify constraints
  const finalCategoryCounts = {};
  for (const j of jobPostings) {
    finalCategoryCounts[j.roleCategory] = (finalCategoryCounts[j.roleCategory] || 0) + 1;
  }

  console.log('\n--- FINAL DATASET METRICS ---');
  console.log(`Total records: ${jobPostings.length}`);
  console.log('Category distribution:');
  for (const [cat, count] of Object.entries(finalCategoryCounts)) {
    const pct = ((count / jobPostings.length) * 100).toFixed(1);
    console.log(`  ${cat}: ${count} (${pct}%)`);
  }

  const allFinalSkills = Array.from(new Set(jobPostings.flatMap(j => j.skills))).sort();
  console.log(`Total unique skills in final dataset: ${allFinalSkills.length}`);

  const allDates = jobPostings.map(j => j.datePosted).sort();
  console.log(`Date range: min = ${allDates[0]}, max = ${allDates[allDates.length - 1]}`);

  // Write src/data/jobPostings.json
  const outPath = path.resolve('src', 'data', 'jobPostings.json');
  fs.writeFileSync(outPath, JSON.stringify(jobPostings, null, 2), 'utf8');
  console.log(`Successfully wrote ${jobPostings.length} records to ${outPath}`);

  // Write public/data/job_postings.csv
  const csvHeader = 'Job ID,Job Title,Company,Location,Experience Level,Salary,Date Posted,Skills,Role Category,Education,Remote Type,Industry\n';
  const csvRows = jobPostings.map(j => {
    const esc = (val) => `"${String(val).replace(/"/g, '""')}"`;
    return [
      j.id,
      esc(j.title),
      esc(j.company),
      esc(j.location),
      j.experienceLevel,
      'N/A',
      j.datePosted,
      esc(j.skills.join('; ')),
      esc(j.roleCategory),
      esc(j.education),
      j.remoteType,
      esc(j.industry)
    ].join(',');
  }).join('\n');
  const csvPath = path.resolve('public', 'data', 'job_postings.csv');
  fs.writeFileSync(csvPath, csvHeader + csvRows, 'utf8');
  console.log(`Successfully wrote ${jobPostings.length} records to ${csvPath}`);
}

convertDataset().catch(console.error);
