import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const navItems = [
  { section: 'Overview', items: [
    { to: '/dashboard', icon: '📊', label: 'Overview', end: true },
    { to: '/dashboard/analytics', icon: '📈', label: 'Analytics' },
  ]},
  { section: 'Monitoring', items: [
    { to: '/dashboard/structural', icon: '🏗', label: 'Structural Health' },
    { to: '/dashboard/visitors', icon: '👥', label: 'Visitor Flow' },
    { to: '/dashboard/encroachment', icon: '🔍', label: 'Encroachment' },
  ]},
  { section: 'Management', items: [
    { to: '/dashboard/alerts', icon: '⚠️', label: 'AI Alerts' },
    { to: '/dashboard/reports', icon: '📋', label: 'Conservation Reports' },
    { to: '/dashboard/agents', icon: '🤖', label: 'AI Agents' },
  ]},
  { section: 'System', items: [
    { to: '/dashboard/settings', icon: '⚙️', label: 'Settings' },
  ]},
];

export default function Sidebar() {
  const { activeAlerts, simulationActive } = useApp();

  return (
    <aside className="sidebar" aria-label="Dashboard navigation">
      {/* Site summary */}
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(245,241,236,0.08)' }}>
        <div style={{ fontSize: 12, color: 'rgba(245,241,236,0.4)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Heritage Sites
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ fontSize: 13, color: 'rgba(245,241,236,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>🕌 Ahmedabad</span>
            <span className="badge badge-moderate" style={{ fontSize: 11 }}>MODERATE</span>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(245,241,236,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>☀️ Modhera</span>
            <span className="badge badge-high" style={{ fontSize: 11 }}>HIGH</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(section => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.items.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
                aria-label={item.label}
              >
                <span className="sidebar-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                {item.label === 'AI Alerts' && activeAlerts > 0 && (
                  <span className="badge badge-high" style={{ marginLeft: 'auto', fontSize: 11 }}>{activeAlerts}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Simulation status */}
      <div style={{ padding: '12px 16px', marginTop: 'auto', borderTop: '1px solid rgba(245,241,236,0.08)', position: 'absolute', bottom: 0, width: '100%', background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ fontSize: 12, color: simulationActive ? '#6EE79B' : 'rgba(245,241,236,0.35)', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: simulationActive ? '#6EE79B' : '#555', display: 'inline-block' }} aria-hidden="true" />
          {simulationActive ? 'Simulation Active' : 'Simulation Paused'}
        </div>
      </div>
    </aside>
  );
}
