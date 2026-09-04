import React, { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const { simulationActive, activeAlerts, startSimulation, stopSimulation } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  const handleSimToggle = async () => {
    if (simulationActive) await stopSimulation();
    else await startSimulation();
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-content">
        {/* Brand */}
        <Link to="/" className="navbar-brand" aria-label="HeritageGuard AI Home">
          <div className="navbar-logo" aria-hidden="true">🏛</div>
          <span className="navbar-brand-name">HeritageGuard AI</span>
        </Link>

        {/* Nav links — desktop */}
        <ul className="navbar-nav" style={{ display: window.innerWidth < 768 && !mobileOpen ? 'none' : 'flex' }}>
          <li><NavLink to="/">Home</NavLink></li>
          <li><NavLink to="/explore">Explore</NavLink></li>
          <li><NavLink to="/guide">AI Guide</NavLink></li>
          <li><NavLink to="/visitor-flow">Live Monitoring</NavLink></li>
          <li><NavLink to="/dashboard" className={isDashboard ? 'active' : ''}>Conservation</NavLink></li>
          <li><NavLink to="/dashboard/agents">AI Agents</NavLink></li>
          <li><NavLink to="/dashboard/reports">Reports</NavLink></li>
        </ul>

        {/* Actions */}
        <div className="navbar-actions">
          {activeAlerts > 0 && (
            <Link to="/dashboard/alerts" aria-label={`${activeAlerts} active alerts`}>
              <span className="badge badge-high" style={{ cursor: 'pointer' }}>
                ⚠ {activeAlerts} Alerts
              </span>
            </Link>
          )}

          {simulationActive && (
            <div className="sim-indicator" aria-live="polite">
              <div className="sim-dot" aria-hidden="true" />
              LIVE SIM
            </div>
          )}

          <button
            className={`btn btn-sm ${simulationActive ? 'btn-danger' : 'btn-teal'}`}
            onClick={handleSimToggle}
            aria-pressed={simulationActive}
          >
            {simulationActive ? '⏸ Pause Sim' : '▶ Start Sim'}
          </button>
        </div>
      </div>
    </nav>
  );
}
