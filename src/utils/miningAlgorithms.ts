import type { JobPosting } from '../data/jobPostings';
import { ALL_SKILLS, ROLE_CATEGORIES } from '../data/jobPostings';

// Seeded PRNG (mulberry32) for reproducible algorithms
export function mulberry32(seed: number): () => number {
  let a = seed;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ==========================================
// 1. SKILL EXTRACTION & FREQUENCY
// ==========================================

export interface SkillFrequency {
  skill: string;
  count: number;
  percentage: number;
  category?: string;
}

export function calculateSkillFrequency(jobs: JobPosting[]): SkillFrequency[] {
  if (jobs.length === 0) return [];
  const counts: Record<string, number> = {};

  jobs.forEach(job => {
    job.skills.forEach(skill => {
      counts[skill] = (counts[skill] || 0) + 1;
    });
  });

  return Object.entries(counts)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: Number(((count / jobs.length) * 100).toFixed(1))
    }))
    .sort((a, b) => b.count - a.count);
}

// Skill alias map for canonicalization
const ALIAS_MAP: Record<string, string> = {
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'k8s': 'Kubernetes',
  'js': 'JavaScript',
  'ts': 'TypeScript',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'sklearn': 'Scikit-Learn'
};

// Short skills that require strict case-sensitive matching
const SHORT_SKILLS = new Set(['Go', 'R', 'Git', 'SQL', 'Express', 'Excel']);

export function extractSkillsFromText(text: string): {
  extracted: string[];
  frequencies: { skill: string; occurrences: number }[];
} {
  if (!text) return { extracted: [], frequencies: [] };

  const countsMap = new Map<string, number>();

  // Helper to escape regex special characters
  const escapeRegex = (s: string) => s.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');

  // Helper to check and count occurrences with custom boundary: (?<![A-Za-z0-9+#.])token(?![A-Za-z0-9+#.])
  const matchToken = (token: string, canonical: string, isCaseSensitive: boolean) => {
    try {
      const escaped = escapeRegex(token);
      const pattern = `(?<![A-Za-z0-9+#.])${escaped}(?![A-Za-z0-9+#.])`;
      const regex = new RegExp(pattern, isCaseSensitive ? 'g' : 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        countsMap.set(canonical, (countsMap.get(canonical) || 0) + matches.length);
      }
    } catch {
      // Fallback for environments lacking lookbehind
      const escaped = escapeRegex(token);
      const regex = new RegExp(`\\b${escaped}\\b`, isCaseSensitive ? 'g' : 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        countsMap.set(canonical, (countsMap.get(canonical) || 0) + matches.length);
      }
    }
  };

  // 1. Check all canonical skills from ALL_SKILLS
  ALL_SKILLS.forEach(skill => {
    const isShort = SHORT_SKILLS.has(skill);
    matchToken(skill, skill, isShort);
  });

  // 2. Check aliases
  Object.entries(ALIAS_MAP).forEach(([alias, canonical]) => {
    matchToken(alias, canonical, false);
  });

  const frequencies = Array.from(countsMap.entries())
    .map(([skill, occurrences]) => ({ skill, occurrences }))
    .sort((a, b) => b.occurrences - a.occurrences);

  return {
    extracted: frequencies.map(f => f.skill),
    frequencies
  };
}

// ==========================================
// 2. TRUE LEVEL-WISE APRIORI ALGORITHM
// ==========================================

export interface AssociationRule {
  id: string;
  antecedents: string[];
  consequents: string[];
  support: number; // e.g. 0.15 (15%)
  confidence: number; // e.g. 0.75 (75%)
  lift: number; // e.g. 1.85
  count: number;
}

export function runApriori(
  jobs: JobPosting[],
  minSupport: number = 0.08,
  minConfidence: number = 0.35
): AssociationRule[] {
  const N = jobs.length;
  if (N === 0) return [];

  const minCount = Math.ceil(minSupport * N);
  const transactions = jobs.map(j => new Set(j.skills));

  // Helper to serialize itemset array
  const itemsetKey = (items: string[]) => [...items].sort().join('|||');

  // Support count cache for itemsets
  const itemsetCounts = new Map<string, number>();

  // 1. Level 1: Frequent 1-itemsets
  const singleCounts = new Map<string, number>();
  transactions.forEach(t => {
    t.forEach(item => {
      singleCounts.set(item, (singleCounts.get(item) || 0) + 1);
    });
  });

  let currentFrequent: string[][] = [];
  singleCounts.forEach((count, item) => {
    if (count >= minCount) {
      currentFrequent.push([item]);
      itemsetCounts.set(itemsetKey([item]), count);
    }
  });

  // Sort single items alphabetically
  currentFrequent.sort((a, b) => a[0].localeCompare(b[0]));

  const allFrequentItemsets: string[][] = [];

  // Level-wise loop up to size 4
  for (let k = 2; k <= 4 && currentFrequent.length > 0; k++) {
    const prevFrequent = currentFrequent;
    const candidates: string[][] = [];
    const prevSet = new Set(prevFrequent.map(it => itemsetKey(it)));

    // Join step: L_{k-1} Join L_{k-1}
    for (let i = 0; i < prevFrequent.length; i++) {
      for (let j = i + 1; j < prevFrequent.length; j++) {
        const itemsetA = prevFrequent[i];
        const itemsetB = prevFrequent[j];

        // Check if first k-2 items match
        let canJoin = true;
        for (let m = 0; m < k - 2; m++) {
          if (itemsetA[m] !== itemsetB[m]) {
            canJoin = false;
            break;
          }
        }

        if (canJoin) {
          const candidate = [...itemsetA, itemsetB[k - 2]].sort();

          // Prune step: all (k-1) subsets must be frequent
          let allSubsetsFrequent = true;
          for (let s = 0; s < candidate.length; s++) {
            const subset = candidate.filter((_, idx) => idx !== s);
            if (!prevSet.has(itemsetKey(subset))) {
              allSubsetsFrequent = false;
              break;
            }
          }

          if (allSubsetsFrequent) {
            candidates.push(candidate);
          }
        }
      }
    }

    if (candidates.length === 0) break;

    // Count support for candidates
    currentFrequent = [];
    for (const cand of candidates) {
      let count = 0;
      for (const t of transactions) {
        let hasAll = true;
        for (const item of cand) {
          if (!t.has(item)) {
            hasAll = false;
            break;
          }
        }
        if (hasAll) count++;
      }

      if (count >= minCount) {
        currentFrequent.push(cand);
        itemsetCounts.set(itemsetKey(cand), count);
        allFrequentItemsets.push(cand);
      }
    }
  }

  // Generate association rules for all frequent itemsets of size >= 2
  const rules: AssociationRule[] = [];
  let ruleIdCounter = 1;

  for (const itemset of allFrequentItemsets) {
    const itemsetCount = itemsetCounts.get(itemsetKey(itemset)) || 0;
    const itemsetSupport = itemsetCount / N;

    // Generate all non-empty proper subsets
    const totalSubsets = (1 << itemset.length) - 1;

    for (let mask = 1; mask < totalSubsets; mask++) {
      const antecedent: string[] = [];
      const consequent: string[] = [];

      for (let bit = 0; bit < itemset.length; bit++) {
        if ((mask & (1 << bit)) !== 0) {
          antecedent.push(itemset[bit]);
        } else {
          consequent.push(itemset[bit]);
        }
      }

      const antecedentCount = itemsetCounts.get(itemsetKey(antecedent)) || 0;
      const consequentCount = itemsetCounts.get(itemsetKey(consequent)) || 0;

      if (antecedentCount > 0 && consequentCount > 0) {
        const confidence = itemsetCount / antecedentCount;
        const consequentSupport = consequentCount / N;
        const lift = consequentSupport > 0 ? confidence / consequentSupport : 0;

        if (confidence >= minConfidence) {
          rules.push({
            id: `RULE-${ruleIdCounter++}`,
            antecedents: antecedent,
            consequents: consequent,
            support: Number(itemsetSupport.toFixed(3)),
            confidence: Number(confidence.toFixed(3)),
            lift: Number(lift.toFixed(2)),
            count: itemsetCount
          });
        }
      }
    }
  }

  return rules.sort((a, b) => b.lift - a.lift);
}

// ==========================================
// 3. K-MEANS CLUSTERING (Deterministic Seeded Restarts)
// ==========================================

export interface ClusterResult {
  clusterId: number;
  name: string;
  color: string;
  jobCount: number;
  percentage: number;
  avgSalary: number;
  topSkills: { skill: string; frequency: number }[];
  jobs: JobPosting[];
  centroid: number[];
  inertia?: number;
}

export function runKMeans(
  jobs: JobPosting[],
  k: number = 6,
  seed: number = 42
): ClusterResult[] {
  if (jobs.length === 0) return [];

  const featureSkills = ALL_SKILLS;
  const numFeatures = featureSkills.length;

  // Binary skill feature vectors
  const vectors: number[][] = jobs.map(job => {
    const skillSet = new Set(job.skills);
    return featureSkills.map(skill => (skillSet.has(skill) ? 1 : 0));
  });

  const numRestarts = 10;
  let bestInertia = Infinity;
  let bestAssignments: number[] = new Array(jobs.length).fill(0);
  let bestCentroids: number[][] = [];

  for (let restart = 0; restart < numRestarts; restart++) {
    const restartRng = mulberry32(seed + restart * 7919);

    // K-Means++ Initialization
    const centroids: number[][] = [];
    const firstIdx = Math.floor(restartRng() * jobs.length);
    centroids.push([...vectors[firstIdx]]);

    while (centroids.length < k) {
      const distances = vectors.map(v => {
        let minDist = Infinity;
        for (const c of centroids) {
          let dist = 0;
          for (let f = 0; f < numFeatures; f++) {
            const diff = v[f] - c[f];
            dist += diff * diff;
          }
          if (dist < minDist) minDist = dist;
        }
        return minDist;
      });

      const sumDist = distances.reduce((a, b) => a + b, 0);
      let r = restartRng() * sumDist;
      let selectedIdx = 0;
      for (let i = 0; i < distances.length; i++) {
        r -= distances[i];
        if (r <= 0) {
          selectedIdx = i;
          break;
        }
      }
      centroids.push([...vectors[selectedIdx]]);
    }

    // Iterative optimization with maxIter = 50
    let assignments = new Array(jobs.length).fill(0);
    const maxIter = 50;

    for (let iter = 0; iter < maxIter; iter++) {
      let changed = false;

      // 1. Assign points to nearest centroid
      for (let i = 0; i < vectors.length; i++) {
        const v = vectors[i];
        let minDist = Infinity;
        let closestCluster = 0;

        for (let cIdx = 0; cIdx < k; cIdx++) {
          const c = centroids[cIdx];
          let dist = 0;
          for (let f = 0; f < numFeatures; f++) {
            const diff = v[f] - c[f];
            dist += diff * diff;
          }
          if (dist < minDist) {
            minDist = dist;
            closestCluster = cIdx;
          }
        }

        if (assignments[i] !== closestCluster) {
          assignments[i] = closestCluster;
          changed = true;
        }
      }

      // 2. Reseed empty clusters to the farthest point
      const clusterCounts = new Array(k).fill(0);
      assignments.forEach(c => clusterCounts[c]++);

      for (let cIdx = 0; cIdx < k; cIdx++) {
        if (clusterCounts[cIdx] === 0) {
          // Find point farthest from its assigned centroid
          let maxD = -1;
          let farthestPointIdx = 0;
          for (let i = 0; i < vectors.length; i++) {
            const assignedC = centroids[assignments[i]];
            let d = 0;
            for (let f = 0; f < numFeatures; f++) {
              const diff = vectors[i][f] - assignedC[f];
              d += diff * diff;
            }
            if (d > maxD) {
              maxD = d;
              farthestPointIdx = i;
            }
          }
          assignments[farthestPointIdx] = cIdx;
          centroids[cIdx] = [...vectors[farthestPointIdx]];
          clusterCounts[cIdx] = 1;
        }
      }

      // 3. Update centroids
      for (let cIdx = 0; cIdx < k; cIdx++) {
        const clusterPoints = vectors.filter((_, idx) => assignments[idx] === cIdx);
        if (clusterPoints.length > 0) {
          for (let f = 0; f < numFeatures; f++) {
            let sum = 0;
            for (let p = 0; p < clusterPoints.length; p++) {
              sum += clusterPoints[p][f];
            }
            centroids[cIdx][f] = sum / clusterPoints.length;
          }
        }
      }

      if (!changed) break;
    }

    // Compute total inertia (sum of squared distances)
    let totalInertia = 0;
    for (let i = 0; i < vectors.length; i++) {
      const c = centroids[assignments[i]];
      let dist = 0;
      for (let f = 0; f < numFeatures; f++) {
        const diff = vectors[i][f] - c[f];
        dist += diff * diff;
      }
      totalInertia += dist;
    }

    if (totalInertia < bestInertia) {
      bestInertia = totalInertia;
      bestAssignments = [...assignments];
      bestCentroids = centroids.map(c => [...c]);
    }
  }

  const colors = [
    '#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b',
    '#10b981', '#6366f1', '#14b8a6', '#f43f5e'
  ];

  const clusterResults: ClusterResult[] = [];

  for (let cIdx = 0; cIdx < k; cIdx++) {
    const clusterJobs = jobs.filter((_, idx) => bestAssignments[idx] === cIdx);
    const jobCount = clusterJobs.length;
    const percentage = Number(((jobCount / jobs.length) * 100).toFixed(1));
    const validSalaryJobs = clusterJobs.filter(j => j.salary > 0);
    const avgSalary = validSalaryJobs.length > 0
      ? Math.round(validSalaryJobs.reduce((acc, j) => acc + j.salary, 0) / validSalaryJobs.length)
      : 0;

    // Dominant skills
    const skillCounts: Record<string, number> = {};
    clusterJobs.forEach(j => {
      j.skills.forEach(s => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    const topSkills = Object.entries(skillCounts)
      .map(([skill, frequency]) => ({ skill, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 6);

    // Dominant role category
    const roleCounts: Record<string, number> = {};
    clusterJobs.forEach(j => {
      roleCounts[j.roleCategory] = (roleCounts[j.roleCategory] || 0) + 1;
    });

    let dominantRole = 'General Engineering';
    let maxRoleCount = 0;
    Object.entries(roleCounts).forEach(([role, cnt]) => {
      if (cnt > maxRoleCount) {
        maxRoleCount = cnt;
        dominantRole = role;
      }
    });

    // Compute cluster inertia
    let clusterInertia = 0;
    const c = bestCentroids[cIdx];
    for (let i = 0; i < jobs.length; i++) {
      if (bestAssignments[i] === cIdx) {
        for (let f = 0; f < numFeatures; f++) {
          const diff = vectors[i][f] - c[f];
          clusterInertia += diff * diff;
        }
      }
    }

    const clusterName = jobCount > 0
      ? `${dominantRole} (${topSkills[0]?.skill || 'Core Tech'})`
      : `Cluster ${cIdx + 1}`;

    clusterResults.push({
      clusterId: cIdx + 1,
      name: clusterName,
      color: colors[cIdx % colors.length],
      jobCount,
      percentage,
      avgSalary,
      topSkills,
      jobs: clusterJobs,
      centroid: bestCentroids[cIdx],
      inertia: Number(clusterInertia.toFixed(2))
    });
  }

  return clusterResults.sort((a, b) => b.jobCount - a.jobCount);
}

// ==========================================
// 4. CLASSIFICATION ENGINE (KNN, TRAINED DECISION TREE, NAIVE BAYES)
// ==========================================

export interface ConfusionMatrixCell {
  actual: string;
  predicted: string;
  count: number;
}

export interface ClassificationMetrics {
  algorithmName: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: ConfusionMatrixCell[];
  categories: string[];
  perClassMetrics: {
    category: string;
    precision: number;
    recall: number;
    f1: number;
    support: number;
  }[];
}

// Decision Tree Node Interface
interface DecisionTreeNode {
  isLeaf: boolean;
  label: string;
  splitSkill?: string;
  left?: DecisionTreeNode;
  right?: DecisionTreeNode;
}

// Compute Gini impurity for a set of jobs
function computeGini(jobs: JobPosting[]): number {
  if (jobs.length === 0) return 0;
  const counts: Record<string, number> = {};
  jobs.forEach(j => {
    counts[j.roleCategory] = (counts[j.roleCategory] || 0) + 1;
  });

  let sumSq = 0;
  const total = jobs.length;
  Object.values(counts).forEach(c => {
    const p = c / total;
    sumSq += p * p;
  });
  return 1 - sumSq;
}

// Find majority class in a job collection
function getMajorityClass(jobs: JobPosting[], fallback: string): string {
  if (jobs.length === 0) return fallback;
  const counts: Record<string, number> = {};
  jobs.forEach(j => {
    counts[j.roleCategory] = (counts[j.roleCategory] || 0) + 1;
  });

  let maxCount = -1;
  let majority = fallback;
  Object.entries(counts).forEach(([cat, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      majority = cat;
    }
  });
  return majority;
}

// Train a genuine Decision Tree with Gini impurity, max depth 6, min samples 5
function trainDecisionTree(
  trainJobs: JobPosting[],
  depth: number = 0,
  maxDepth: number = 6,
  minSamples: number = 5,
  globalFallback: string
): DecisionTreeNode {
  const majority = getMajorityClass(trainJobs, globalFallback);

  if (trainJobs.length < minSamples || depth >= maxDepth) {
    return { isLeaf: true, label: majority };
  }

  const currentGini = computeGini(trainJobs);
  if (currentGini === 0) {
    return { isLeaf: true, label: majority };
  }

  let bestGain = 0;
  let bestSkill = '';
  let bestLeft: JobPosting[] = [];
  let bestRight: JobPosting[] = [];

  for (const skill of ALL_SKILLS) {
    const left: JobPosting[] = [];
    const right: JobPosting[] = [];

    for (const job of trainJobs) {
      if (job.skills.includes(skill)) {
        left.push(job);
      } else {
        right.push(job);
      }
    }

    if (left.length === 0 || right.length === 0) continue;

    const weightedGini =
      (left.length / trainJobs.length) * computeGini(left) +
      (right.length / trainJobs.length) * computeGini(right);

    const gain = currentGini - weightedGini;
    if (gain > bestGain) {
      bestGain = gain;
      bestSkill = skill;
      bestLeft = left;
      bestRight = right;
    }
  }

  if (bestGain <= 0.0001 || !bestSkill) {
    return { isLeaf: true, label: majority };
  }

  return {
    isLeaf: false,
    label: majority,
    splitSkill: bestSkill,
    left: trainDecisionTree(bestLeft, depth + 1, maxDepth, minSamples, majority),
    right: trainDecisionTree(bestRight, depth + 1, maxDepth, minSamples, majority)
  };
}

// Predict role category using trained decision tree
function predictDecisionTree(node: DecisionTreeNode, job: JobPosting, fallback: string): string {
  if (node.isLeaf) return node.label;
  if (!node.splitSkill) return node.label || fallback;

  if (job.skills.includes(node.splitSkill)) {
    return node.left ? predictDecisionTree(node.left, job, fallback) : node.label;
  } else {
    return node.right ? predictDecisionTree(node.right, job, fallback) : node.label;
  }
}

export function classifyJobs(
  jobs: JobPosting[],
  algorithm: 'KNN' | 'DecisionTree' | 'NaiveBayes' = 'KNN'
): ClassificationMetrics {
  const categories = ROLE_CATEGORIES;

  if (jobs.length === 0) {
    return {
      algorithmName: algorithm === 'KNN' ? 'K-Nearest Neighbors (k=5)' : algorithm === 'DecisionTree' ? 'Decision Tree Classifier' : 'Multinomial Naive Bayes',
      accuracy: 0,
      precision: 0,
      recall: 0,
      f1Score: 0,
      confusionMatrix: [],
      categories,
      perClassMetrics: []
    };
  }

  // Deterministic 80% train / 20% test split
  const trainJobs: JobPosting[] = [];
  const testJobs: JobPosting[] = [];

  jobs.forEach((job, idx) => {
    if (idx % 5 === 0) {
      testJobs.push(job);
    } else {
      trainJobs.push(job);
    }
  });

  const matrixMap: Record<string, Record<string, number>> = {};
  categories.forEach(act => {
    matrixMap[act] = {};
    categories.forEach(pred => {
      matrixMap[act][pred] = 0;
    });
  });

  const globalFallback = getMajorityClass(trainJobs, categories[0]);

  // Train Decision Tree if selected
  let treeRoot: DecisionTreeNode | null = null;
  if (algorithm === 'DecisionTree') {
    treeRoot = trainDecisionTree(trainJobs, 0, 6, 5, globalFallback);
  }

  // Precompute Naive Bayes parameters if selected
  const classPriors: Record<string, number> = {};
  const skillLikelihoods: Record<string, Record<string, number>> = {};
  const skillNotLikelihoods: Record<string, Record<string, number>> = {};

  if (algorithm === 'NaiveBayes') {
    const totalTrain = trainJobs.length;
    for (const cat of categories) {
      const catJobs = trainJobs.filter(j => j.roleCategory === cat);
      const catCount = catJobs.length;
      classPriors[cat] = Math.log((catCount + 1) / (totalTrain + categories.length));
      skillLikelihoods[cat] = {};
      skillNotLikelihoods[cat] = {};

      for (const skill of ALL_SKILLS) {
        let skillCount = 0;
        for (const job of catJobs) {
          if (job.skills.includes(skill)) skillCount++;
        }
        // Laplace smoothed probabilities
        const pSkill = (skillCount + 1) / (catCount + 2);
        skillLikelihoods[cat][skill] = Math.log(pSkill);
        skillNotLikelihoods[cat][skill] = Math.log(1 - pSkill);
      }
    }
  }

  let correctCount = 0;

  testJobs.forEach(testJob => {
    let predictedCategory = globalFallback;

    if (algorithm === 'KNN') {
      // KNN using Jaccard Similarity on skill sets (k = 5)
      const scoredTrain = trainJobs.map(trainJob => {
        const s1 = new Set(testJob.skills);
        const s2 = new Set(trainJob.skills);
        let intersection = 0;
        s1.forEach(s => {
          if (s2.has(s)) intersection++;
        });
        const union = new Set([...testJob.skills, ...trainJob.skills]).size;
        const jaccard = union > 0 ? intersection / union : 0;
        return { role: trainJob.roleCategory, sim: jaccard };
      });

      scoredTrain.sort((a, b) => b.sim - a.sim);
      const topK = scoredTrain.slice(0, 5);

      const votes: Record<string, number> = {};
      topK.forEach(v => {
        votes[v.role] = (votes[v.role] || 0) + 1;
      });

      let maxVotes = -1;
      Object.entries(votes).forEach(([cat, cnt]) => {
        if (cnt > maxVotes) {
          maxVotes = cnt;
          predictedCategory = cat;
        }
      });
    } else if (algorithm === 'DecisionTree') {
      if (treeRoot) {
        predictedCategory = predictDecisionTree(treeRoot, testJob, globalFallback);
      }
    } else if (algorithm === 'NaiveBayes') {
      // Multinomial Naive Bayes using log-probabilities
      const testSkillSet = new Set(testJob.skills);
      let bestLogPosterior = -Infinity;

      for (const cat of categories) {
        let logPosterior = classPriors[cat] || 0;
        for (const skill of ALL_SKILLS) {
          if (testSkillSet.has(skill)) {
            logPosterior += skillLikelihoods[cat]?.[skill] ?? Math.log(1 / 100);
          } else {
            logPosterior += skillNotLikelihoods[cat]?.[skill] ?? Math.log(99 / 100);
          }
        }

        if (logPosterior > bestLogPosterior) {
          bestLogPosterior = logPosterior;
          predictedCategory = cat;
        }
      }
    }

    if (matrixMap[testJob.roleCategory] && matrixMap[testJob.roleCategory][predictedCategory] !== undefined) {
      matrixMap[testJob.roleCategory][predictedCategory]++;
    }

    if (testJob.roleCategory === predictedCategory) {
      correctCount++;
    }
  });

  const totalTest = testJobs.length;
  const accuracy = totalTest > 0 ? Number((correctCount / totalTest).toFixed(3)) : 0;

  const perClassMetrics = categories.map(cat => {
    const tp = matrixMap[cat]?.[cat] || 0;
    const fn = categories.reduce((sum, p) => (p !== cat ? sum + (matrixMap[cat]?.[p] || 0) : sum), 0);
    const fp = categories.reduce((sum, a) => (a !== cat ? sum + (matrixMap[a]?.[cat] || 0) : sum), 0);
    const support = tp + fn;

    const precision = tp + fp > 0 ? Number((tp / (tp + fp)).toFixed(3)) : 0;
    const recall = tp + fn > 0 ? Number((tp / (tp + fn)).toFixed(3)) : 0;
    const f1 = precision + recall > 0 ? Number(((2 * precision * recall) / (precision + recall)).toFixed(3)) : 0;

    return { category: cat, precision, recall, f1, support };
  });

  const avgPrecision = Number((perClassMetrics.reduce((sum, m) => sum + m.precision, 0) / categories.length).toFixed(3));
  const avgRecall = Number((perClassMetrics.reduce((sum, m) => sum + m.recall, 0) / categories.length).toFixed(3));
  const avgF1 = Number((perClassMetrics.reduce((sum, m) => sum + m.f1, 0) / categories.length).toFixed(3));

  const confusionMatrix: ConfusionMatrixCell[] = [];
  categories.forEach(actual => {
    categories.forEach(predicted => {
      confusionMatrix.push({
        actual,
        predicted,
        count: matrixMap[actual]?.[predicted] || 0
      });
    });
  });

  return {
    algorithmName:
      algorithm === 'KNN'
        ? 'K-Nearest Neighbors (k=5)'
        : algorithm === 'DecisionTree'
        ? 'Decision Tree Classifier'
        : 'Multinomial Naive Bayes',
    accuracy,
    precision: avgPrecision,
    recall: avgRecall,
    f1Score: avgF1,
    confusionMatrix,
    categories,
    perClassMetrics
  };
}

// ==========================================
// 5. TREND MINING (With Safe Growth and 'New' Status)
// ==========================================

export interface SkillTrendPoint {
  datePeriod: string;
  [skill: string]: number | string;
}

export interface EmergingSkillInfo {
  skill: string;
  initialCount: number;
  recentCount: number;
  growthPercentage: number | null;
  status: 'Surging' | 'Steady' | 'Declining' | 'New';
  totalDemand: number;
}

export function calculateSkillTrends(jobs: JobPosting[]): {
  monthlyData: SkillTrendPoint[];
  emergingSkills: EmergingSkillInfo[];
  topSkillsList: string[];
} {
  if (jobs.length === 0) return { monthlyData: [], emergingSkills: [], topSkillsList: [] };

  const distinctMonths = new Set(jobs.map(j => j.datePosted.substring(0, 7)));
  const useDayGrouping = distinctMonths.size < 3;

  const periodGroups: Record<string, JobPosting[]> = {};
  jobs.forEach(job => {
    const period = useDayGrouping ? job.datePosted : job.datePosted.substring(0, 7);
    if (!periodGroups[period]) periodGroups[period] = [];
    periodGroups[period].push(job);
  });

  const sortedPeriods = Object.keys(periodGroups).sort();
  const overallSkillFreq = calculateSkillFrequency(jobs);
  const top10Skills = overallSkillFreq.slice(0, 10).map(s => s.skill);

  const monthlyData: SkillTrendPoint[] = sortedPeriods.map(period => {
    const periodJobs = periodGroups[period];
    const point: SkillTrendPoint = { datePeriod: period };

    top10Skills.forEach(skill => {
      const count = periodJobs.filter(j => j.skills.includes(skill)).length;
      point[skill] = Number(((count / periodJobs.length) * 100).toFixed(1));
    });

    return point;
  });

  // Split early vs recent by the median date instead of by month index:
  // the first half of the sorted distinct dates is "early", the second half is "recent".
  // With at least 2 distinct dates, neither half may be empty.
  const mid = sortedPeriods.length >= 2
    ? Math.max(1, Math.min(sortedPeriods.length - 1, Math.floor(sortedPeriods.length / 2)))
    : sortedPeriods.length;
  const earlyPeriods = sortedPeriods.slice(0, mid);
  const recentPeriods = sortedPeriods.slice(mid);

  const earlyJobs = earlyPeriods.flatMap(p => periodGroups[p] || []);
  const recentJobs = recentPeriods.flatMap(p => periodGroups[p] || []);

  const emergingSkills: EmergingSkillInfo[] = overallSkillFreq.map(s => {
    const earlyCount = earlyJobs.filter(j => j.skills.includes(s.skill)).length;
    const recentCount = recentJobs.filter(j => j.skills.includes(s.skill)).length;

    const earlyRate = earlyJobs.length > 0 ? earlyCount / earlyJobs.length : 0;
    const recentRate = recentJobs.length > 0 ? recentCount / recentJobs.length : 0;

    let growth: number | null = null;
    let status: 'Surging' | 'Steady' | 'Declining' | 'New' = 'Steady';

    if (earlyRate === 0) {
      if (recentCount > 0) {
        status = 'New';
        growth = null;
      } else {
        status = 'Steady';
        growth = 0;
      }
    } else {
      growth = Number((((recentRate - earlyRate) / earlyRate) * 100).toFixed(1));
      if (s.count >= 5) {
        if (growth >= 15) status = 'Surging';
        else if (growth <= -15) status = 'Declining';
        else status = 'Steady';
      } else {
        status = 'Steady';
      }
    }

    return {
      skill: s.skill,
      initialCount: earlyCount,
      recentCount,
      growthPercentage: growth,
      status,
      totalDemand: s.count
    };
  }).sort((a, b) => {
    if (a.growthPercentage === null && b.growthPercentage === null) return b.totalDemand - a.totalDemand;
    if (a.growthPercentage === null) return -1;
    if (b.growthPercentage === null) return 1;
    return b.growthPercentage - a.growthPercentage;
  });

  return {
    monthlyData,
    emergingSkills,
    topSkillsList: top10Skills
  };
}

// ==========================================
// 6. STUDENT SKILL-GAP ANALYSIS
// ==========================================

export interface SkillGapAnalysisResult {
  targetRole: string;
  userSkills: string[];
  possessedSkills: string[];
  missingSkills: { skill: string; demandPercentage: number; priority: 'Critical' | 'Recommended' | 'Optional' }[];
  recommendedSkills: { skill: string; demandPercentage: number; priority: 'High' | 'Medium' | 'Optional' }[];
  readinessScore: number;
  roleDemandCount: number;
  matchingRoles: { role: string; matchPercentage: number; score: number; matchedSkillsCount: number }[];
  bestMatchingRoles: { role: string; matchPercentage: number; score: number; matchedSkillsCount: number }[];
}

export function calculateSkillGap(
  jobs: JobPosting[],
  userSkills: string[],
  targetRole: string
): SkillGapAnalysisResult {
  const userSkillSet = new Set(userSkills.map(s => s.trim().toLowerCase()));

  const targetJobs = jobs.filter(
    j => j.roleCategory === targetRole || j.title.toLowerCase().includes(targetRole.toLowerCase())
  );
  const totalTargetJobs = targetJobs.length > 0 ? targetJobs : jobs;

  const targetSkillFreq = calculateSkillFrequency(totalTargetJobs);
  const possessed: string[] = [];
  const missing: { skill: string; demandPercentage: number; priority: 'Critical' | 'Recommended' | 'Optional' }[] = [];

  let weightedPossessed = 0;
  let weightedTotal = 0;

  targetSkillFreq.forEach(item => {
    const isPossessed = userSkillSet.has(item.skill.toLowerCase());
    const weight = item.percentage;
    weightedTotal += weight;

    if (isPossessed) {
      possessed.push(item.skill);
      weightedPossessed += weight;
    } else {
      let priority: 'Critical' | 'Recommended' | 'Optional' = 'Optional';
      if (item.percentage >= 45) priority = 'Critical';
      else if (item.percentage >= 20) priority = 'Recommended';

      missing.push({
        skill: item.skill,
        demandPercentage: item.percentage,
        priority
      });
    }
  });

  const readinessScore = weightedTotal > 0
    ? Math.min(100, Math.round((weightedPossessed / weightedTotal) * 100))
    : 0;

  const matchingRoles = ROLE_CATEGORIES.map(role => {
    const rJobs = jobs.filter(j => j.roleCategory === role);
    const rFreq = calculateSkillFrequency(rJobs);
    let rPossessed = 0;
    let rTotal = 0;
    let matchedSkillsCount = 0;

    rFreq.slice(0, 10).forEach(item => {
      rTotal += item.percentage;
      if (userSkillSet.has(item.skill.toLowerCase())) {
        rPossessed += item.percentage;
        matchedSkillsCount++;
      }
    });

    const matchPercentage = rTotal > 0 ? Math.min(100, Math.round((rPossessed / rTotal) * 100)) : 0;
    return { role, matchPercentage, score: matchPercentage, matchedSkillsCount };
  }).sort((a, b) => b.matchPercentage - a.matchPercentage);

  const sortedMissing = missing.sort((a, b) => b.demandPercentage - a.demandPercentage);
  const recommendedSkills = sortedMissing.slice(0, 5).map(m => ({
    skill: m.skill,
    demandPercentage: m.demandPercentage,
    priority: (m.priority === 'Critical' ? 'High' : m.priority === 'Recommended' ? 'Medium' : 'Optional') as 'High' | 'Medium' | 'Optional'
  }));

  return {
    targetRole,
    userSkills,
    possessedSkills: possessed,
    missingSkills: sortedMissing,
    recommendedSkills,
    readinessScore,
    roleDemandCount: totalTargetJobs.length,
    matchingRoles,
    bestMatchingRoles: matchingRoles
  };
}

// ==========================================
// 7. FILTERING & CSV EXPORT
// ==========================================

export interface FilterOptions {
  searchQuery?: string;
  roleCategory?: string;
  experienceLevel?: string;
  remoteType?: string;
  industry?: string;
  minSalary?: number;
  maxSalary?: number;
  skillFilter?: string;
  sortBy?: 'dateDesc' | 'dateAsc' | 'salaryDesc' | 'salaryAsc' | 'title';
}

export function filterJobs(jobs: JobPosting[], filters: FilterOptions): JobPosting[] {
  return jobs.filter(job => {
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchSkills = job.skills.some(s => s.toLowerCase().includes(q));
      const matchLoc = job.location.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchSkills && !matchLoc) return false;
    }

    if (filters.roleCategory && filters.roleCategory !== 'All') {
      if (job.roleCategory !== filters.roleCategory) return false;
    }

    if (filters.experienceLevel && filters.experienceLevel !== 'All') {
      if (job.experienceLevel !== filters.experienceLevel) return false;
    }

    if (filters.remoteType && filters.remoteType !== 'All') {
      if (job.remoteType !== filters.remoteType) return false;
    }

    if (filters.industry && filters.industry !== 'All') {
      if (job.industry !== filters.industry) return false;
    }

    if (filters.skillFilter && filters.skillFilter !== 'All') {
      if (!job.skills.includes(filters.skillFilter)) return false;
    }

    if (filters.minSalary && (job.salary === 0 || job.salary < filters.minSalary)) return false;
    if (filters.maxSalary && (job.salary === 0 || job.salary > filters.maxSalary)) return false;

    return true;
  }).sort((a, b) => {
    switch (filters.sortBy) {
      case 'dateAsc':
        return a.datePosted.localeCompare(b.datePosted);
      case 'salaryDesc':
        return b.salary - a.salary;
      case 'salaryAsc':
        return a.salary - b.salary;
      case 'title':
        return a.title.localeCompare(b.title);
      case 'dateDesc':
      default:
        return b.datePosted.localeCompare(a.datePosted);
    }
  });
}

export function exportCSV(jobs: JobPosting[], filename: string = 'job_intel_data.csv'): void {
  if (!jobs || jobs.length === 0) return;

  const header = [
    'Job ID', 'Job Title', 'Company', 'Location', 'Experience Level',
    'Salary', 'Date Posted', 'Skills', 'Role Category', 'Education', 'Remote Type', 'Industry'
  ];
  const rows = jobs.map(j => [
    j.id,
    `"${j.title.replace(/"/g, '""')}"`,
    `"${j.company.replace(/"/g, '""')}"`,
    `"${j.location.replace(/"/g, '""')}"`,
    j.experienceLevel,
    j.salary === 0 ? 'N/A' : j.salary,
    j.datePosted,
    `"${j.skills.join('; ')}"`,
    `"${j.roleCategory}"`,
    `"${j.education}"`,
    j.remoteType,
    `"${j.industry}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [header.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
