import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import ChatWidget from './components/ui/ChatWidget';

// Visitor pages
const Home = lazy(() => import('./pages/visitor/Home'));
const Explore = lazy(() => import('./pages/visitor/Explore'));
const AhmedabadDetail = lazy(() => import('./pages/visitor/AhmedabadDetail'));
const ModheraDetail = lazy(() => import('./pages/visitor/ModheraDetail'));
const HeritageGuide = lazy(() => import('./pages/visitor/HeritageGuide'));
const VisitorFlowPublic = lazy(() => import('./pages/visitor/VisitorFlowPublic'));
const SiteMapPage = lazy(() => import('./pages/visitor/SiteMapPage'));
const PublicAlerts = lazy(() => import('./pages/visitor/PublicAlerts'));

// Dashboard pages
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const StructuralHealth = lazy(() => import('./pages/dashboard/StructuralHealth'));
const VisitorFlow = lazy(() => import('./pages/dashboard/VisitorFlow'));
const Encroachment = lazy(() => import('./pages/dashboard/Encroachment'));
const Alerts = lazy(() => import('./pages/dashboard/Alerts'));
const ConservationReports = lazy(() => import('./pages/dashboard/ConservationReports'));
const AgentActivity = lazy(() => import('./pages/dashboard/AgentActivity'));
const Analytics = lazy(() => import('./pages/dashboard/Analytics'));
const Settings = lazy(() => import('./pages/dashboard/Settings'));

function PageLoader() {
  return (
    <div className="loading-spinner" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
      <span>Loading HeritageGuard AI...</span>
    </div>
  );
}

// Layout wrapper for public visitor pages
function PublicLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}

// Layout wrapper for dashboard pages
function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-content">
          {children}
        </main>
      </div>
      <ChatWidget />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public Visitor Routes */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/explore" element={<PublicLayout><Explore /></PublicLayout>} />
            <Route path="/explore/ahmedabad" element={<PublicLayout><AhmedabadDetail /></PublicLayout>} />
            <Route path="/explore/modhera" element={<PublicLayout><ModheraDetail /></PublicLayout>} />
            <Route path="/guide" element={<PublicLayout><HeritageGuide /></PublicLayout>} />
            <Route path="/visitor-flow" element={<PublicLayout><VisitorFlowPublic /></PublicLayout>} />
            <Route path="/map" element={<PublicLayout><SiteMapPage /></PublicLayout>} />
            <Route path="/alerts-public" element={<PublicLayout><PublicAlerts /></PublicLayout>} />

            {/* Dashboard Routes */}
            <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
            <Route path="/dashboard/structural" element={<DashboardLayout><StructuralHealth /></DashboardLayout>} />
            <Route path="/dashboard/visitors" element={<DashboardLayout><VisitorFlow /></DashboardLayout>} />
            <Route path="/dashboard/encroachment" element={<DashboardLayout><Encroachment /></DashboardLayout>} />
            <Route path="/dashboard/alerts" element={<DashboardLayout><Alerts /></DashboardLayout>} />
            <Route path="/dashboard/reports" element={<DashboardLayout><ConservationReports /></DashboardLayout>} />
            <Route path="/dashboard/agents" element={<DashboardLayout><AgentActivity /></DashboardLayout>} />
            <Route path="/dashboard/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
            <Route path="/dashboard/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AppProvider>
    </BrowserRouter>
  );
}
