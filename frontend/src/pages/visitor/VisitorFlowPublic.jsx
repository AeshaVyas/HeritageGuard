import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { visitorsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

function OccupancyGauge({ percent, label }) {
  const risk = percent >= 96 ? 'critical' : percent >= 81 ? 'high' : percent >= 61 ? 'moderate' : 'low';
  const colors = { critical: '#8B0000', high: '#C0392B', moderate: '#E67E22', low: '#27AE60' };
  const color = colors[risk];
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto 8px' }}>
        <svg width="120" height="120" viewBox="0 0 120 120" aria-label={`${label} occupancy ${percent}%`}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#E8DDD0" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="52"
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeDasharray={`${2 * Math.PI * 52}`}
            strokeDashoffset={`${2 * Math.PI * 52 * (1 - percent / 100)}`}
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
          <text x="60" y="55" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>{percent}%</text>
          <text x="60" y="72" textAnchor="middle" fontSize="11" fill="#8C7A68">occupied</text>
        </svg>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

export default function VisitorFlowPublic() {
  const { simulationActive } = useApp();
  const [visitorData, setVisitorData] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [vRes, hRes] = await Promise.all([
        visitorsAPI.getAll(),
        visitorsAPI.getHourly(),
      ]);
      if (vRes.success) setVisitorData(vRes.data);
      if (hRes.success) setHourly(hRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (simulationActive) {
      const t = setInterval(fetchData, 6000);
      return () => clearInterval(t);
    }
  }, [simulationActive, fetchData]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div style={{ padding: '48px 0' }}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">👥 Live Visitor Flow</h1>
          <p className="page-subtitle">Real-time visitor density monitoring across heritage sites (SIMULATED DATA)</p>
        </div>

        <div className="alert-banner demo mb-20">
          📊 <strong>Simulated Data:</strong> Visitor counts below are generated for demonstration purposes and do not represent real visitor figures.
        </div>

        {/* Site occupancy gauges */}
        <div className="grid grid-2 mb-24">
          {visitorData.map(site => {
            const risk = site.riskLevel || 'MODERATE';
            const riskColors = { CRITICAL: '#8B0000', HIGH: '#C0392B', MODERATE: '#E67E22', LOW: '#27AE60' };
            return (
              <div key={site.siteId} className="card">
                <div className="card-header">
                  <h2 className="section-title">{site.siteName}</h2>
                  <span className={`badge badge-${risk.toLowerCase()}`}>{risk}</span>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
                    <OccupancyGauge percent={site.occupancyPercent} label="Overall" />
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 8 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Current Visitors</span>
                        <span style={{ fontWeight: 700, fontSize: 18 }}>{site.currentVisitors}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 16 }}>
                        <span style={{ color: 'var(--text-muted)' }}>Capacity</span>
                        <span style={{ fontWeight: 600 }}>{site.capacity}</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className={`progress-fill ${risk.toLowerCase()}`}
                          style={{ width: `${Math.min(site.occupancyPercent, 100)}%` }}
                          role="progressbar"
                          aria-valuenow={site.occupancyPercent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                        <span>0%</span><span>50%</span><span>100%</span>
                      </div>
                      <div style={{ marginTop: 12, fontSize: 13, color: 'var(--text-muted)' }}>
                        Entry: +{site.entryRate}/hr · Exit: -{site.exitRate}/hr
                      </div>
                    </div>
                  </div>

                  {/* Area breakdown */}
                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: 'var(--text-secondary)' }}>Area Breakdown</div>
                    {(site.areas || []).map(area => {
                      const aRisk = area.occupancy >= 90 ? 'critical' : area.occupancy >= 80 ? 'high' : area.occupancy >= 60 ? 'moderate' : 'low';
                      return (
                        <div key={area.name} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                          <span style={{ fontSize: 13, minWidth: 140, color: 'var(--text-secondary)' }}>{area.name}</span>
                          <div className="progress-bar" style={{ flex: 1 }}>
                            <div className={`progress-fill ${aRisk}`} style={{ width: `${Math.min(area.occupancy, 100)}%` }} />
                          </div>
                          <span style={{ fontSize: 12, minWidth: 40, textAlign: 'right', color: 'var(--text-muted)' }}>{area.occupancy}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Hourly chart */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">📈 Hourly Visitor Pattern (Typical Day)</h2>
            <span className="demo-badge">⚡ SIMULATED</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={hourly} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="ahmedabad" name="Ahmedabad Walled City" fill="#1B6B6B" radius={[4,4,0,0]} />
                <Bar dataKey="modhera" name="Modhera Sun Temple" fill="#C9A84C" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/guide" className="btn btn-primary">📖 Get AI Visitor Tips</Link>
          <Link to="/dashboard/visitors" className="btn btn-dark">📊 Full Dashboard</Link>
        </div>
      </div>
    </div>
  );
}
