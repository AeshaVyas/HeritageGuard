import React, { useEffect, useState, useCallback } from 'react';
import { visitorsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';

function OccupancyGauge({ percent, riskLevel }) {
  const colors = { CRITICAL: '#8B0000', HIGH: '#C0392B', MODERATE: '#E67E22', LOW: '#27AE60' };
  const color = colors[riskLevel] || '#888';
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" aria-label={`${percent}% occupancy`}>
      <circle cx="65" cy="65" r={r} fill="none" stroke="#E8DDD0" strokeWidth="10" />
      <circle cx="65" cy="65" r={r} fill="none" stroke={color} strokeWidth="10"
        strokeDasharray={circ} strokeDashoffset={circ * (1 - percent / 100)}
        strokeLinecap="round" transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
      <text x="65" y="60" textAnchor="middle" fontSize="24" fontWeight="700" fill={color}>{percent}%</text>
      <text x="65" y="78" textAnchor="middle" fontSize="11" fill="#8C7A68">{riskLevel}</text>
    </svg>
  );
}

export default function VisitorFlow() {
  const { simulationActive } = useApp();
  const [sites, setSites] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [weekly, setWeekly] = useState([]);
  const [analysis, setAnalysis] = useState({});
  const [analyzing, setAnalyzing] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [sRes, hRes, wRes] = await Promise.all([
        visitorsAPI.getAll(),
        visitorsAPI.getHourly(),
        visitorsAPI.getWeekly(),
      ]);
      if (sRes.success) setSites(sRes.data);
      if (hRes.success) setHourly(hRes.data);
      if (wRes.success) setWeekly(wRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (simulationActive) {
      const t = setInterval(fetchData, 5000);
      return () => clearInterval(t);
    }
  }, [simulationActive, fetchData]);

  const handleAnalyze = async (siteId) => {
    setAnalyzing(siteId);
    try {
      const res = await visitorsAPI.analyze(siteId);
      if (res.success) setAnalysis(prev => ({ ...prev, [siteId]: res.data }));
    } catch (err) {
      setAnalysis(prev => ({ ...prev, [siteId]: { error: err.message } }));
    } finally {
      setAnalyzing('');
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const riskColors = { CRITICAL: '#8B0000', HIGH: '#C0392B', MODERATE: '#E67E22', LOW: '#27AE60' };

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">👥 Visitor Flow Monitoring</h1>
            <p className="page-subtitle">Real-time visitor density and crowd management — SIMULATED DATA</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="demo-badge">⚡ SIMULATED</div>
            {simulationActive && <div className="sim-indicator"><div className="sim-dot" />LIVE</div>}
          </div>
        </div>
      </div>

      {/* Live site cards */}
      <div className="grid grid-2 mb-24">
        {sites.map(site => {
          const siteAnalysis = analysis[site.siteId];
          return (
            <div key={site.siteId} className="card">
              <div className="card-header">
                <h2 className="section-title">{site.siteName}</h2>
                <span className={`badge badge-${site.riskLevel.toLowerCase()}`}>{site.riskLevel}</span>
              </div>
              <div className="card-body">
                <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                  <OccupancyGauge percent={Math.round(site.occupancyPercent)} riskLevel={site.riskLevel} />
                  <div>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Current / Capacity</div>
                      <div style={{ fontSize: 22, fontWeight: 700 }}>
                        {site.currentVisitors} <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>/ {site.capacity}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Entry Rate</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--risk-low)' }}>+{site.entryRate}/hr</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Exit Rate</div>
                        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--sev-high)' }}>-{site.exitRate}/hr</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Area breakdown */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Zone Breakdown</div>
                  {(site.areas || []).map(area => {
                    const aRisk = area.occupancy >= 90 ? 'critical' : area.occupancy >= 80 ? 'high' : area.occupancy >= 60 ? 'moderate' : 'low';
                    return (
                      <div key={area.name} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 3 }}>
                          <span>{area.name}</span>
                          <span style={{ fontWeight: 600, color: riskColors[aRisk.toUpperCase()] || '#888' }}>
                            {area.current}/{area.capacity} ({area.occupancy}%)
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div className={`progress-fill ${aRisk}`} style={{ width: `${Math.min(area.occupancy, 100)}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  className="btn btn-teal"
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleAnalyze(site.siteId)}
                  disabled={analyzing === site.siteId}
                >
                  {analyzing === site.siteId ? '⏳ Analyzing...' : '🤖 Get AI Recommendations'}
                </button>

                {siteAnalysis && (
                  <div style={{ marginTop: 12, background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, borderLeft: '4px solid var(--heritage-teal)' }}>
                    {siteAnalysis.error ? (
                      <div style={{ color: 'var(--sev-high)', fontSize: 13 }}>{siteAnalysis.error}</div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}>AI Recommendations</span>
                          {siteAnalysis.aiRecommendations?.demo && <span className="demo-badge" style={{ fontSize: 11 }}>Demo</span>}
                        </div>
                        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                          {siteAnalysis.aiRecommendations?.recommendations}
                        </pre>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-2 mb-24">
        <div className="card">
          <div className="card-header"><h2 className="section-title">📈 Hourly Pattern</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={hourly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
                <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ahmedabad" name="Ahmedabad" stroke="#1B6B6B" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="modhera" name="Modhera" stroke="#C9A84C" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h2 className="section-title">📅 Weekly Trend</h2></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ahmedabad" name="Ahmedabad" fill="#1B6B6B" radius={[3,3,0,0]} />
                <Bar dataKey="modhera" name="Modhera" fill="#C9A84C" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
