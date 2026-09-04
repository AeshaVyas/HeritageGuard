import React, { useEffect, useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { structuralAPI, visitorsAPI, alertsAPI } from '../../services/api'; // eslint-disable-line
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

export default function Analytics() {
  const { simulationActive, systemHealth } = useApp();
  const [structuralData, setStructuralData] = useState([]);
  const [visitorData, setVisitorData] = useState([]);
  const [alertStats, setAlertStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [sRes, vRes, aRes] = await Promise.all([
        structuralAPI.getAll(),
        visitorsAPI.getAll(),
        alertsAPI.getStats(),
      ]);
      if (sRes.success) setStructuralData(sRes.data);
      if (vRes.success) setVisitorData(vRes.data);
      if (aRes.success) setAlertStats(aRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (simulationActive) {
      const t = setInterval(fetchAll, 8000);
      return () => clearInterval(t);
    }
  }, [simulationActive, fetchAll]);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  // Build comparison data for radar chart
  const radarData = [
    { metric: 'Health Score', ahmedabad: systemHealth?.ahmedabad?.healthScore || 72, modhera: systemHealth?.modhera?.healthScore || 63 },
    { metric: 'Visitor Occ.', ahmedabad: 100 - (systemHealth?.ahmedabad?.occupancy || 84), modhera: 100 - (systemHealth?.modhera?.occupancy || 88) },
    { metric: 'Struct. Safety', ahmedabad: 68, modhera: 55 },
    { metric: 'Conservation', ahmedabad: 74, modhera: 62 },
    { metric: 'Monitoring', ahmedabad: 90, modhera: 88 },
  ];

  // Build sensor health data for bar chart
  const sensorBarData = structuralData.map(s => ({
    name: s.structure?.split(' - ')[0]?.substring(0, 16) || s.id,
    healthScore: s.healthScore,
    crackWidth: Math.round(s.readings?.crackWidth * 10) / 10,
    moisture: s.readings?.moisture,
  }));

  // Trend data (static for analytics demo)
  const trendData = [
    { week: 'W1', ahmedabad: 78, modhera: 71, alerts: 2 },
    { week: 'W2', ahmedabad: 76, modhera: 69, alerts: 3 },
    { week: 'W3', ahmedabad: 74, modhera: 66, alerts: 4 },
    { week: 'W4', ahmedabad: 73, modhera: 64, alerts: 5 },
    { week: 'W5', ahmedabad: 72, modhera: 63, alerts: 4 },
    { week: 'W6', ahmedabad: 72, modhera: 62, alerts: 5 },
  ];

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">📈 Analytics</h1>
        <p className="page-subtitle">Heritage health trends, risk analysis, and comparative site performance</p>
      </div>

      <div className="alert-banner demo mb-20">
        📊 Analytics data is based on simulated sensor and visitor readings for demonstration purposes.
      </div>

      {/* Summary metrics */}
      <div className="grid grid-4 mb-24">
        {[
          { label: 'Overall Heritage Health', value: `${systemHealth?.overall || 70}/100`, color: 'var(--heritage-gold)' },
          { label: 'Avg Occupancy', value: `${Math.round(((systemHealth?.ahmedabad?.occupancy || 84) + (systemHealth?.modhera?.occupancy || 88)) / 2)}%`, color: 'var(--sev-high)' },
          { label: 'Active Alerts', value: alertStats?.active || '—', color: alertStats?.active > 3 ? 'var(--sev-high)' : 'var(--risk-low)' },
          { label: 'Sensors Monitored', value: structuralData.length, color: 'var(--heritage-teal)' },
        ].map(item => (
          <div key={item.label} className="stat-card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-2 mb-24">
        {/* 6-week health trend */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">📉 6-Week Health Trend</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis domain={[50, 90]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="ahmedabad" name="Ahmedabad" stroke="#1B6B6B" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="modhera" name="Modhera" stroke="#C9A84C" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar comparison */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">🎯 Site Comparison Radar</h2>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E8DDD0" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar name="Ahmedabad" dataKey="ahmedabad" stroke="#1B6B6B" fill="#1B6B6B" fillOpacity={0.3} />
                <Radar name="Modhera" dataKey="modhera" stroke="#C9A84C" fill="#C9A84C" fillOpacity={0.3} />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Sensor health bars */}
      <div className="card mb-24">
        <div className="card-header">
          <h2 className="section-title">🏗 Structural Health by Structure</h2>
          <span className="demo-badge">⚡ SIMULATED</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={sensorBarData} margin={{ bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" />
              <YAxis yAxisId="left" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 10]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="healthScore" name="Health Score" fill="#1B6B6B" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="crackWidth" name="Crack Width (mm)" fill="#C9A84C" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Visitor occupancy */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">👥 Visitor Occupancy by Zone</h2>
          <span className="demo-badge">⚡ SIMULATED</span>
        </div>
        <div className="card-body">
          <div className="grid grid-2" style={{ gap: 24 }}>
            {visitorData.map(site => (
              <div key={site.siteId}>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>{site.siteName}</div>
                {(site.areas || []).map(area => (
                  <div key={area.name} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                      <span>{area.name}</span>
                      <span style={{ fontWeight: 600, color: area.occupancy >= 90 ? 'var(--sev-high)' : area.occupancy >= 80 ? 'var(--risk-moderate)' : 'var(--risk-low)' }}>
                        {area.occupancy}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${area.occupancy >= 90 ? 'critical' : area.occupancy >= 80 ? 'high' : area.occupancy >= 60 ? 'moderate' : 'low'}`}
                        style={{ width: `${Math.min(area.occupancy, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
