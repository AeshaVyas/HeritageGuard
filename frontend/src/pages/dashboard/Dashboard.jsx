import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { agentsAPI, alertsAPI } from '../../services/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';
const HeritageMap = React.lazy(() => import('../../components/map/HeritageMap'));

const RISK_COLORS = { LOW: '#27AE60', MODERATE: '#E67E22', HIGH: '#C0392B', CRITICAL: '#8B0000' };

function StatCard({ icon, label, value, sub, color, riskBadge }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="stat-label">{label}</div>
        <span style={{ fontSize: 24 }} aria-hidden="true">{icon}</span>
      </div>
      {riskBadge
        ? <span className={`badge badge-${riskBadge.toLowerCase()}`} style={{ fontSize: 15, padding: '5px 12px', marginTop: 4 }}>{riskBadge}</span>
        : <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      }
      {sub && <div className="stat-change" style={{ color: 'var(--text-muted)', fontSize: 12 }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const { systemHealth, simulationActive, startSimulation, stopSimulation } = useApp();
  const [alertStats, setAlertStats] = useState(null);
  const [structuralHistory, setStructuralHistory] = useState([]);
  const [events, setEvents] = useState([]);

  const fetchData = useCallback(async () => {
    try {
      const [aRes, eRes] = await Promise.all([
        alertsAPI.getStats(),
        agentsAPI.getEvents(8),
      ]);
      if (aRes.success) setAlertStats(aRes.data);
      if (eRes.success) setEvents(eRes.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    // Static trend data for the chart
    setStructuralHistory([
        { date: 'Jan 8', ahmedabad: 74, modhera: 67 },
        { date: 'Jan 9', ahmedabad: 73, modhera: 65 },
        { date: 'Jan 10', ahmedabad: 72, modhera: 63 },
        { date: 'Jan 11', ahmedabad: 73, modhera: 62 },
        { date: 'Jan 12', ahmedabad: 72, modhera: 61 },
        { date: 'Jan 13', ahmedabad: 73, modhera: 62 },
        { date: 'Jan 14', ahmedabad: 72, modhera: 61 },
        { date: 'Jan 15', ahmedabad: 72, modhera: 60 },
    ]);
  }, [fetchData]);

  useEffect(() => {
    if (simulationActive) {
      const t = setInterval(fetchData, 6000);
      return () => clearInterval(t);
    }
  }, [simulationActive, fetchData]);

  const health = systemHealth || { overall: 70, ahmedabad: { healthScore: 72, riskLevel: 'MODERATE', visitors: 840, occupancy: 84 }, modhera: { healthScore: 63, riskLevel: 'HIGH', visitors: 620, occupancy: 88 } };

  const siteMapData = {
    'ahmedabad-walled-city': { healthScore: health.ahmedabad?.healthScore, riskLevel: health.ahmedabad?.riskLevel, visitors: health.ahmedabad?.visitors, occupancy: health.ahmedabad?.occupancy },
    'modhera-sun-temple': { healthScore: health.modhera?.healthScore, riskLevel: health.modhera?.riskLevel, visitors: health.modhera?.visitors, occupancy: health.modhera?.occupancy },
  };

  const pieData = alertStats ? [
    { name: 'Structural', value: alertStats.byCategory?.structural || 0, color: '#C0392B' },
    { name: 'Visitor', value: alertStats.byCategory?.visitor || 0, color: '#E67E22' },
    { name: 'Encroachment', value: alertStats.byCategory?.encroachment || 0, color: '#2980B9' },
    { name: 'Environmental', value: alertStats.byCategory?.environmental || 0, color: '#27AE60' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="animate-fadeIn">
      {/* Header */}
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">Conservation Dashboard</h1>
            <p className="page-subtitle">Live heritage health monitoring — Ahmedabad & Modhera</p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="demo-badge">⚡ SIMULATED DATA</div>
            <button
              className={`btn ${simulationActive ? 'btn-danger' : 'btn-teal'}`}
              onClick={simulationActive ? stopSimulation : startSimulation}
            >
              {simulationActive ? '⏸ Pause Simulation' : '▶ Start Simulation'}
            </button>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-4 mb-24">
        <StatCard icon="🌐" label="Overall Heritage Health" value={`${health.overall}/100`} color="var(--heritage-gold)" sub="Combined site health score" />
        <StatCard icon="🕌" label="Ahmedabad Health" value={`${health.ahmedabad?.healthScore || 72}/100`} riskBadge={health.ahmedabad?.riskLevel} />
        <StatCard icon="☀️" label="Modhera Health" value={`${health.modhera?.healthScore || 63}/100`} riskBadge={health.modhera?.riskLevel} />
        <StatCard icon="👥" label="Total Visitors" value={((health.ahmedabad?.visitors || 840) + (health.modhera?.visitors || 620)).toLocaleString()} sub="Across both sites (simulated)" />
        <StatCard icon="⚠️" label="Active Alerts" value={alertStats?.active || '—'} color={alertStats?.active > 3 ? 'var(--sev-high)' : 'var(--risk-low)'} sub={`${alertStats?.bySeverity?.CRITICAL || 0} critical`} />
        <StatCard icon="🔍" label="Encroachment Cases" value="2" sub="Under investigation" color="var(--risk-moderate)" />
        <StatCard icon="📡" label="Sensors Active" value="6" sub="All sites monitored" color="var(--risk-low)" />
        <StatCard icon="🤖" label="AI Agents" value="5" sub="All agents active" color="var(--heritage-teal)" />
      </div>

      {/* Charts row */}
      <div className="grid grid-2 mb-24">
        {/* Health trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">📈 Structural Health Trend (15 Days)</h2>
            <span className="demo-badge">SIM</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={structuralHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis domain={[50, 90]} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ahmedabad" name="Ahmedabad" stroke="#1B6B6B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="modhera" name="Modhera" stroke="#C9A84C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alert distribution pie */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">🔔 Alerts by Category</h2>
            <Link to="/dashboard/alerts" style={{ fontSize: 13, color: 'var(--heritage-teal)', fontWeight: 600 }}>View All →</Link>
          </div>
          <div className="card-body">
            {pieData.length > 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={pieData} cx={80} cy={80} innerRadius={45} outerRadius={80} dataKey="value">
                      {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ flex: 1 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <div style={{ width: 12, height: 12, borderRadius: 2, background: d.color }} />
                      <span style={{ fontSize: 13, flex: 1 }}>{d.name}</span>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{d.value}</span>
                    </div>
                  ))}
                  {alertStats && (
                    <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-muted)' }}>
                      Total: {alertStats.total} · Active: {alertStats.active}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-muted)' }}>No alert data</div>
            )}
          </div>
        </div>
      </div>

      {/* Map + Event log */}
      <div className="grid grid-2 mb-24">
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">🗺 Heritage Sites Map</h2>
            <Link to="/map" style={{ fontSize: 13, color: 'var(--heritage-teal)', fontWeight: 600 }}>Fullscreen →</Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <Suspense fallback={<div className="loading-spinner" style={{ height: 300 }}><div className="spinner" /></div>}>
              <HeritageMap siteData={siteMapData} height={320} />
            </Suspense>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">🤖 Agent Activity Log</h2>
            <Link to="/dashboard/agents" style={{ fontSize: 13, color: 'var(--heritage-teal)', fontWeight: 600 }}>View Agents →</Link>
          </div>
          <div className="card-body" style={{ maxHeight: 320, overflowY: 'auto' }}>
            {events.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
                No events yet. Start simulation to see agent activity.
              </div>
            ) : (
              events.map(ev => (
                <div key={ev.id} style={{ display: 'flex', gap: 10, paddingBottom: 10, marginBottom: 10, borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: 18 }}>
                    {ev.source === 'SIMULATION' ? '📡' : ev.source === 'ORCHESTRATOR' ? '🎯' : '🤖'}
                  </span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{ev.source}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ev.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                      {new Date(ev.timestamp).toLocaleTimeString('en-IN')}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-4">
        {[
          { to: '/dashboard/structural', icon: '🏗', label: 'Structural Health', desc: 'Sensor readings & analysis' },
          { to: '/dashboard/visitors', icon: '👥', label: 'Visitor Flow', desc: 'Crowd density & management' },
          { to: '/dashboard/encroachment', icon: '🔍', label: 'Encroachment', desc: 'Buffer zone monitoring' },
          { to: '/dashboard/reports', icon: '📋', label: 'Reports', desc: 'AI-generated conservation reports' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={{ textDecoration: 'none' }}>
            <div className="card card-hover" style={{ padding: 18, textAlign: 'center' }}>
              <div style={{ fontSize: 30, marginBottom: 8 }}>{item.icon}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
