# 💼 JobIntel AI – Job Market Skill Demand Mining & Career Intelligence System

> **Data Mining & Data Warehousing (DMDW) Academic Capstone Project**  
> An interactive, functional web application for mining technical skill demand, discovering association rules, clustering job roles, evaluating classification models, and benchmarking student career skill gaps across **3,000 real job postings**.

---

## 📌 Project Objective

The primary objective of **JobIntel AI** is to solve the misalignment between academic computer science curricula and dynamic industry skill requirements. By leveraging data mining algorithms and data warehousing principles, this system transforms raw, unstructured job market data into actionable career intelligence.

Key capabilities include:
1. **Automated NLP Skill Extraction**: Extracting technical tokens from job descriptions.
2. **Apriori Association Mining**: Discovering co-occurring skill bundles (e.g., $Python + SQL \Rightarrow Spark$).
3. **K-Means Vector Clustering**: Grouping job postings into spatial clusters based on skill vectors.
4. **Machine Learning Classification**: Predicting job-role categories with KNN, Decision Trees, and Naive Bayes models.
5. **Temporal Trend Mining**: Tracking emerging, steady, and declining technical skills over time.
6. **Student Skill-Gap Intelligence**: Computing personalized job-readiness scores and prioritized learning pathways.

---

## 📁 Data Sources

- **Data**: Three LinkedIn job-posting datasets by asaniczka on Kaggle (*Data Analyst Job Postings*, *LinkedIn Software Engineering Jobs Dataset*, *LinkedIn Data Engineer Job Postings*), collected in December 2023, sampled to 3000 postings.
- **Role Categories**: Role categories are derived from title keywords, and the sample is balanced with a 40% cap per category, so category shares are not real market shares.
- **Attributes**: Salary, education and industry are not in the source and are shown as N/A.
- **Trend Mining**: Trend Mining uses only 8 days of data, so it is a demo.
- **Licence**: See each dataset's Kaggle page.

---

## 📊 Dataset Specifications

The application uses real LinkedIn job postings stored in both TypeScript domain format (`src/data/jobPostings.ts`), serialized JSON (`src/data/jobPostings.json`), and raw CSV export format (`public/data/job_postings.csv`).

### Schema Fields
| Field Name | Type | Description |
| :--- | :--- | :--- |
| `Job ID` | String | Unique identifier (e.g., `JOB-1001`) |
| `Job Title` | String | Position title (e.g., `Senior Data Scientist`, `Backend Software Engineer`) |
| `Company` | String | Employer company name |
| `Location` | String | Geographic location (city/state/country) |
| `Experience Level` | String | `Entry-Level`, `Mid-Level`, `Senior-Level`, `Lead / Executive` |
| `Salary` | Number | Shown as `N/A` (not disclosed in source dataset) |
| `Date Posted` | String | Publication date (ISO format `YYYY-MM-DD`, Dec 2023) |
| `Job Description` | Text | Summary of responsibilities and technical context |
| `Skills` | String[] | Canonical technical skills extracted from job requirements |
| `Role Category` | String | 5 Categories: Data Science & AI, Data Analytics, Frontend Development, Backend Development, Cloud & DevOps |
| `Education` | String | Shown as `Not specified` (not disclosed in source dataset) |
| `Remote Type` | String | `Remote`, `Hybrid`, `Onsite`, `Not specified` |
| `Industry` | String | Shown as `Not specified` (not disclosed in source dataset) |

---

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 + TypeScript + Vite
- **Styling & UI**: Tailwind CSS v4 + Custom Glassmorphism System
- **Data Visualization**: Recharts (Bar Charts, Line Charts, Pie Charts, Scatter Maps)
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **Data Engine**: Custom Pure-TypeScript Mining Algorithms (Apriori, K-Means, KNN, Skill Extractor)

---

## 🔄 Core Data Mining Workflow

```
Job Posting Dataset (3,000 Records)
           ↓
Data Cleaning & Preprocessing (Standardization & Regex Normalization)
           ↓
Text Mining / NLP (Dictionary-based Skill Extraction)
           ↓
Feature Extraction & Vectorization (One-Hot Binary Skill Matrix)
           ↓
Data Mining Engine
├── 1. Association Rule Mining (Apriori: Support, Confidence, Lift)
├── 2. K-Means Clustering (Vector Space Spatial Partitioning)
├── 3. Classification Engine (KNN, Decision Tree, Naive Bayes)
└── 4. Trend Mining (Temporal Growth Trajectory Mining)
           ↓
Patterns & Analytical Discoveries
           ↓
Student Skill-Gap Analysis & Readiness Scoring
           ↓
Interactive SaaS SaaS Dashboard & Visualizations
```

---

## 🧠 Data Mining Algorithms & Implementation Details

### 1. NLP & Text Skill Extraction
Using regex word-boundary pattern matching against a curated 38-skill technical dictionary (`Python`, `Java`, `SQL`, `React`, `AWS`, `Docker`, `Kubernetes`, `PyTorch`, `Pandas`, etc.), extracting frequencies from raw job descriptions.

### 2. Apriori Association Rule Mining
Generates frequent itemsets and association rules using:
- **Support**:
  $$\text{Support}(A \Rightarrow B) = \frac{\text{Count}(A \cup B)}{N}$$
- **Confidence**:
  $$\text{Confidence}(A \Rightarrow B) = \frac{\text{Support}(A \cup B)}{\text{Support}(A)}$$
- **Lift Factor**:
  $$\text{Lift}(A \Rightarrow B) = \frac{\text{Confidence}(A \Rightarrow B)}{\text{Support}(B)}$$

### 3. K-Means Clustering
Vectorizes job skill sets into an $N \times M$ binary feature space. Runs K-Means++ centroid initialization and iterative Euclidean distance minimization for $K = 3$ to $8$ clusters.

### 4. Role Classification Engine
Tests supervised classifiers on an 80/20 train/test split:
- **K-Nearest Neighbors (KNN)** ($k=5$, Jaccard Similarity metric)
- **Decision Tree Classifier** (Rule-based signature skill evaluation)
- **Multinomial Naive Bayes / Logistic Regression** (Likelihood skill probability)
Computes **Accuracy**, **Precision**, **Recall**, **F1-Score**, and a **$5 \times 5$ Confusion Matrix**.

### 5. Trend Mining
Tracks monthly demand trajectories across posting dates and computes percentage growth rates:
$$\text{Growth \%} = \frac{\text{Recent Rate} - \text{Early Rate}}{\text{Early Rate}} \times 100$$
Categorizes skills into **Surging** ($>+15\%$), **Steady**, and **Declining** ($<-15\%$).

### 6. Student Skill-Gap Analysis
Given student skill set $S_{\text{user}}$ and target job role $R_{\text{target}}$, computes:
- Weighted Job Readiness Score ($0-100\%$)
- Missing skills prioritized as `Critical`, `Recommended`, or `Optional`
- Alternative matching career role rankings across all domains

---

## 🏛️ Data Warehouse Architecture (DMDW)

### Star Schema Design
The system implements a classic Data Warehousing **Star Schema**:

```
                  ┌──────────────────┐
                  │    DIM_TIME      │
                  └────────┬─────────┘
                           │
  ┌──────────────────┐     │     ┌──────────────────┐
  │   DIM_LOCATION   │─────┼─────│   DIM_COMPANY    │
  └──────────────────┘     │     └──────────────────┘
                           │
                ┌──────────┴──────────┐
                │  FACT_JOB_POSTING   │
                └──────────┬──────────┘
                           │
  ┌──────────────────┐     │     ┌──────────────────┐
  │     DIM_ROLE     │─────┼─────│    DIM_SKILL     │
  └──────────────────┘     │     └──────────────────┘
                           │
                  ┌────────┴─────────┐
                  │  DIM_EXPERIENCE  │
                  └──────────────────┘
```

### ETL & OLAP Operations
- **Extract, Transform, Load (ETL)**: Normalizes raw job text feeds into structured dimension keys and fact measures (`salary_usd`, `posting_count`).
- **OLAP Cube Operations**:
  - **Slice & Dice**: Filter postings by dimensions (e.g., `Location = 'Remote'` AND `Skill = 'Python'`).
  - **Roll-Up / Drill-Down**: Aggregate monthly trends up to yearly trends or drill into city regions.
  - **Pivot**: Cross-tabulate technical skills against job role categories.

---

## 🚀 Installation & Running Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Step-by-Step Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/user/JobIntel-AI.git
   cd JobIntel-AI
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Convert / Sample Raw Dataset** (Optional - pre-generated in repo):
   ```bash
   node scripts/convertDataset.mjs
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:5173`.

5. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🔮 Future Scope

1. **Live Web Scraping Integration**: Connecting real-time APIs (LinkedIn, Indeed, Glassdoor) for live job streaming.
2. **LLM Semantic Parsing**: Incorporating OpenAI/Gemini APIs for deep semantic skill extraction beyond exact keyword dictionaries.
3. **Automated Resume PDF Upload**: Allowing students to drag-and-drop their resume PDF to parse skills automatically.

---

## ⚠️ Academic Disclaimer

> **DISCLAIMER:**  
> "This is an academic prototype analyzing real LinkedIn job-posting data. Mining results and career recommendations are analytical estimates and should not be considered guaranteed employment advice."

---

## 📜 License & Academic Attribution
Created for **Data Mining & Data Warehousing (DMDW)** Academic Coursework. Developed using React, TypeScript, Vite, Tailwind CSS, Recharts, and Lucide React.
