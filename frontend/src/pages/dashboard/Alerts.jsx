import React, { useEffect, useState, useCallback } from 'react';
import { alertsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const SEV_ICON = { CRITICAL: '🔴', HIGH: '🟠', MODERATE: '🟡', LOW: '🟢' };
const CAT_ICON = { structural: '🏗', visitor: '👥', encroachment: '🔍', conservation: '📋', environmental: '🌦' };
const FILTERS = ['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'];
const CATS = ['ALL', 'structural', 'visitor', 'encroachment', 'conservation', 'environmental'];

export default function Alerts() {
  const { simulationActive } = useApp();
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [catFilter, setCatFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');

  const fetchAlerts = useCallback(async () => {
    try {
      const [aRes, sRes] = await Promise.all([alertsAPI.getAll(), alertsAPI.getStats()]);
      if (aRes.success) setAlerts(aRes.data);
      if (sRes.success) setStats(sRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);
  useEffect(() => {
    if (simulationActive) {
      const t = setInterval(fetchAlerts, 8000);
      return () => clearInterval(t);
    }
  }, [simulationActive, fetchAlerts]);

  const handleStatusUpdate = async (id, status) => {
    setUpdating(id);
    try {
      const res = await alertsAPI.updateStatus(id, status);
      if (res.success) {
        setAlerts(prev => prev.map(a => a.id === id ? res.data : a));
        fetchAlerts(); // refresh stats
      }
    } catch {}
    setUpdating('');
  };

  const filtered = alerts.filter(a => {
    const sevMatch = filter === 'ALL' || a.severity === filter;
    const catMatch = catFilter === 'ALL' || a.category === catFilter;
    return sevMatch && catMatch;
  });

  const pieData = stats ? [
    { name: 'Structural', value: stats.byCategory?.structural || 0, color: '#C0392B' },
    { name: 'Visitor', value: stats.byCategory?.visitor || 0, color: '#E67E22' },
    { name: 'Encroachment', value: stats.byCategory?.encroachment || 0, color: '#2980B9' },
    { name: 'Conservation', value: stats.byCategory?.conservation || 0, color: '#8E44AD' },
  ].filter(d => d.value > 0) : [];

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">⚠️ AI Alerts</h1>
        <p className="page-subtitle">Centralized alert management from all monitoring agents</p>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-4 mb-24">
          {[
            { label: 'Total Alerts', value: stats.total, color: 'var(--text-primary)' },
            { label: 'Critical', value: stats.bySeverity?.CRITICAL || 0, color: '#8B0000' },
            { label: 'High', value: stats.bySeverity?.HIGH || 0, color: '#C0392B' },
            { label: 'Active', value: stats.active, color: 'var(--heritage-gold)' },
          ].map(item => (
            <div key={item.label} className="stat-card">
              <div className="stat-label">{item.label}</div>
              <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-2 mb-24" style={{ alignItems: 'start' }}>
        {/* Filters + list */}
        <div style={{ gridColumn: '1 / -1' }}>
          <div className="card">
            <div className="card-header" style={{ flexWrap: 'wrap', gap: 12 }}>
              <h2 className="section-title">Active Alerts ({filtered.length})</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {FILTERS.map(f => (
                  <button key={f} onClick={() => setFilter(f)}
                    className={`tag ${filter === f ? 'selected' : ''}`} style={{ fontSize: 12 }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ padding: '8px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 4 }}>Category:</span>
              {CATS.map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`tag ${catFilter === c ? 'selected' : ''}`} style={{ fontSize: 11 }}>
                  {CAT_ICON[c] || ''} {c}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: 560, overflowY: 'auto' }}>
              {filtered.length === 0 ? (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No alerts matching current filters
                </div>
              ) : (
                filtered.map(alert => (
                  <div key={alert.id} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    borderLeft: `4px solid ${alert.severity === 'CRITICAL' ? '#8B0000' : alert.severity === 'HIGH' ? '#C0392B' : alert.severity === 'MODERATE' ? '#E67E22' : '#27AE60'}`,
                    opacity: alert.status === 'RESOLVED' ? 0.65 : 1,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 6 }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 18 }}>{SEV_ICON[alert.severity]}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{alert.title || alert.description}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                            {CAT_ICON[alert.category]} {alert.category} · 📍 {alert.site} · 🤖 {alert.agent}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className={`badge badge-${alert.severity.toLowerCase()}`}>{alert.severity}</span>
                        <span className={`badge badge-${alert.status.toLowerCase()}`}>{alert.status}</span>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                          {new Date(alert.time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{alert.description}</p>

                    {alert.aiRecommendation && (
                      <div style={{ padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10, borderLeft: '3px solid var(--heritage-gold)' }}>
                        💡 {alert.aiRecommendation}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 8 }}>
                      {alert.status === 'NEW' && (
                        <button className="btn btn-sm btn-secondary" disabled={updating === alert.id}
                          onClick={() => handleStatusUpdate(alert.id, 'INVESTIGATING')}>
                          🔎 Investigate
                        </button>
                      )}
                      {alert.status !== 'RESOLVED' && (
                        <button className="btn btn-sm btn-teal" disabled={updating === alert.id}
                          onClick={() => handleStatusUpdate(alert.id, 'RESOLVED')}>
                          ✓ Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Distribution chart */}
      {pieData.length > 0 && (
        <div className="card">
          <div className="card-header"><h2 className="section-title">📊 Alert Distribution</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
