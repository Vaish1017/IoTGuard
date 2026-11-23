// ==========================================================================
// IoTGuard — Main App Component
// Minimal Dark Glassmorphism Layout with Fixed 180px Sidebar & Full Right Panel
// All routes connected to real project views
// ==========================================================================

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useOverview, useSimulation } from './api';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './views/Dashboard';
import { Sensors } from './views/Sensors';
import { Alerts } from './views/Alerts';
import { Devices } from './views/Devices';
import { Analytics } from './views/Analytics';
import { Settings } from './views/Settings';
import { Overview } from './views/Overview';
import { Experiments } from './views/Experiments';
import { Classes } from './views/Classes';
import { Simulation } from './views/Simulation';
import { Inference } from './views/Inference';
import { Monitor } from './views/Monitor';
import './styles.css';

// Atmospheric dark glass background ambient glows
function BackgroundEffects() {
  return (
    <div className="bg-canvas-layer" aria-hidden="true">
      <div className="ambient-nebula nebula-1" />
      <div className="ambient-nebula nebula-2" />
      <div className="ambient-nebula nebula-3" />
      <div className="cyber-grid-overlay" />
    </div>
  );
}

// Layout wrapper: Fixed 180px sidebar + calc(100vw - 180px) right panel
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { data: overviewData } = useOverview();
  const { data: simulationData } = useSimulation();

  const currentView = location.pathname.slice(1) || 'dashboard';

  useEffect(() => {
    const savedTheme = localStorage.getItem('iotguard-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const securityStatus = overviewData && simulationData ? {
    activeSensors: simulationData.client_count,
    totalSensors: simulationData.client_count,
    threatsBlocked: 0,
  } : null;

  return (
    <div className="app-shell">
      <BackgroundEffects />

      {/* Left Sidebar: Fixed 180px width */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        securityStatus={securityStatus}
      />

      {/* Right Panel: calc(100vw - 180px) full width */}
      <div className="right-panel">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="main-content scroll-rigid" role="main">
          <AnimatePresence mode="wait">
            <Outlet key={currentView} />
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="sensors" element={<Sensors />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="devices" element={<Devices />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
          <Route path="overview" element={<Overview />} />
          <Route path="experiments" element={<Experiments />} />
          <Route path="classes" element={<Classes />} />
          <Route path="simulation" element={<Simulation />} />
          <Route path="inference" element={<Inference />} />
          <Route path="monitor" element={<Monitor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
