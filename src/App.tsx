import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { DemoBanner } from './components/DemoBanner';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { JOB_POSTINGS } from './data/jobPostings';

// Lazy-loaded pages with React.lazy
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const SkillAnalyticsPage = lazy(() => import('./pages/SkillAnalyticsPage').then(m => ({ default: m.SkillAnalyticsPage })));
const AssociationMiningPage = lazy(() => import('./pages/AssociationMiningPage').then(m => ({ default: m.AssociationMiningPage })));
const ClusteringPage = lazy(() => import('./pages/ClusteringPage').then(m => ({ default: m.ClusteringPage })));
const ClassificationPage = lazy(() => import('./pages/ClassificationPage').then(m => ({ default: m.ClassificationPage })));
const TrendMiningPage = lazy(() => import('./pages/TrendMiningPage').then(m => ({ default: m.TrendMiningPage })));
const SkillGapPage = lazy(() => import('./pages/SkillGapPage').then(m => ({ default: m.SkillGapPage })));
const JobExplorerPage = lazy(() => import('./pages/JobExplorerPage').then(m => ({ default: m.JobExplorerPage })));
const DataWarehousePage = lazy(() => import('./pages/DataWarehousePage').then(m => ({ default: m.DataWarehousePage })));
const MiningWorkflowPage = lazy(() => import('./pages/MiningWorkflowPage').then(m => ({ default: m.MiningWorkflowPage })));

interface RouteConfig {
  path: string;
  title: string;
  subtitle: string;
  component: React.ComponentType;
}

const ROUTES: RouteConfig[] = [
  {
    path: '/',
    title: 'Job Market Skill Mining Dashboard',
    subtitle: `Overview of mined insights from ${JOB_POSTINGS.length} technical job postings`,
    component: DashboardPage
  },
  {
    path: '/skill-analytics',
    title: 'Skill Analytics & Frequency',
    subtitle: 'Technical skill occurrence leaderboard & NLP extraction engine',
    component: SkillAnalyticsPage
  },
  {
    path: '/association-mining',
    title: 'Association Rule Mining',
    subtitle: 'Apriori algorithm with Support, Confidence & Lift controls',
    component: AssociationMiningPage
  },
  {
    path: '/clustering',
    title: 'K-Means Vector Clustering',
    subtitle: 'Job posting vector spatial partitioning (K = 3 to 8)',
    component: ClusteringPage
  },
  {
    path: '/classification',
    title: 'Classification Model Evaluation',
    subtitle: 'Multi-class role category prediction, Confusion Matrix & F1 scores',
    component: ClassificationPage
  },
  {
    path: '/trend-mining',
    title: 'Time-Series Skill Trend Mining',
    subtitle: 'Skill demand by collection date (Dec 2023)',
    component: TrendMiningPage
  },
  {
    path: '/skill-gap',
    title: 'Student Skill-Gap Analyzer',
    subtitle: 'Competency benchmarking & personalized career readiness scoring',
    component: SkillGapPage
  },
  {
    path: '/job-explorer',
    title: 'Job Posting Dataset Explorer',
    subtitle: 'Search, multi-field filter, pagination, and CSV data export',
    component: JobExplorerPage
  },
  {
    path: '/data-warehouse',
    title: 'Data Warehouse Architecture',
    subtitle: 'Star Schema model, Fact & Dimension tables, ETL & OLAP concepts',
    component: DataWarehousePage
  },
  {
    path: '/mining-workflow',
    title: 'Data Mining Workflow Pipeline',
    subtitle: 'Complete 8-stage data transformation & decision intelligence system',
    component: MiningWorkflowPage
  }
];

const LoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
    <p className="text-sm font-semibold text-slate-400">Loading JobIntel AI Module...</p>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="glass-card rounded-2xl p-8 border border-slate-800 bg-slate-900/60 text-center max-w-lg mx-auto my-16 space-y-4 animate-fadeIn">
    <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
      <AlertCircle className="w-8 h-8" />
    </div>
    <h2 className="text-2xl font-extrabold text-white">404 - Page Not Found</h2>
    <p className="text-xs text-slate-400 leading-relaxed">
      The analytical view or data mining page you requested does not exist or has been relocated.
    </p>
    <Link
      to="/"
      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md"
    >
      <ArrowLeft className="w-4 h-4" />
      <span>Return to Dashboard</span>
    </Link>
  </div>
);

const AppContent: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('jobintel_theme');
      if (stored !== null) {
        return stored === 'dark';
      }
    } catch {
      // LocalStorage access fallback
    }
    return true;
  });

  useEffect(() => {
    try {
      localStorage.setItem('jobintel_theme', isDark ? 'dark' : 'light');
    } catch {
      // LocalStorage access fallback
    }

    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Look up route metadata from ROUTES config
  const currentRoute = ROUTES.find(r => r.path === location.pathname);
  const headerInfo = currentRoute || {
    title: '404 - Page Not Found',
    subtitle: 'The requested analytical module could not be found'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <DemoBanner />

      <div className="flex flex-1">
        {/* Responsive Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isDark={isDark}
          onToggleTheme={toggleTheme}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
          <Header
            onOpenSidebar={() => setSidebarOpen(true)}
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
          />

          <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {ROUTES.map(r => {
                  const Component = r.component;
                  return <Route key={r.path} path={r.path} element={<Component />} />;
                })}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </main>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
