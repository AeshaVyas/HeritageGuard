import React, { useEffect, useState, useCallback } from 'react';
import { structuralAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const PARAM_UNITS = { temperature: '°C', humidity: '%', vibration: 'mm/s', crackWidth: 'mm', moisture: '%', displacement: 'mm', deteriorationScore: '/100' };
const PARAM_LABELS = { temperature: 'Temperature', humidity: 'Humidity', vibration: 'Vibration', crackWidth: 'Crack Width', moisture: 'Moisture', displacement: 'Displacement', deteriorationScore: 'Deterioration' };

function SensorValue({ name, value, thresholds }) {
  if (!thresholds || !thresholds[name]) return null;
  const t = thresholds[name];
  const severity = value >= t.critical ? 'critical' : value >= t.high ? 'danger' : value >= t.moderate ? 'warning' : 'normal';
  return (
    <div className="sensor-reading">
      <div>
        <div className="sensor-name">{PARAM_LABELS[name] || name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Moderate: {t.moderate}{PARAM_UNITS[name]} · High: {t.high}{PARAM_UNITS[name]}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className={`sensor-value ${severity}`}>
          {typeof value === 'number' ? value.toFixed(2) : value}{PARAM_UNITS[name]}
        </div>
      </div>
    </div>
  );
}

export default function StructuralHealth() {
  const { simulationActive } = useApp();
  const [sensors, setSensors] = useState([]);
  const [summary, setSummary] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await structuralAPI.getAll();
      if (res.success) {
        setSensors(res.data);
        setSummary(res.summary || []);
        if (!selected && res.data.length > 0) setSelected(res.data[0]);
      }
    } catch {}
    setLoading(false);
  }, [selected]);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (simulationActive) {
      const t = setInterval(fetchData, 5500);
      return () => clearInterval(t);
    }
  }, [simulationActive, fetchData]);

  const handleAnalyze = async (sensorId) => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await structuralAPI.analyze(sensorId);
      if (res.success) setAnalysis(res.data);
    } catch (err) {
      setAnalysis({ error: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  const riskColors = { LOW: '#27AE60', MODERATE: '#E67E22', HIGH: '#C0392B', CRITICAL: '#8B0000' };

  // Build chart data from sensors
  const chartData = sensors.map(s => ({
    name: s.structure.split(' - ')[0].substring(0, 15),
    healthScore: s.healthScore,
    crackWidth: s.readings?.crackWidth,
    moisture: s.readings?.moisture,
    fill: riskColors[s.riskLevel] || '#888',
  }));

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">🏗 Structural Health Monitoring</h1>
            <p className="page-subtitle">Real-time simulated sensor data from heritage structures</p>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div className="demo-badge">⚡ SIMULATED SENSORS</div>
            {simulationActive && <div className="sim-indicator"><div className="sim-dot" />LIVE</div>}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-3 mb-24">
        {summary.map(site => (
          <div key={site.site} className="stat-card">
            <div className="stat-label">{site.site.includes('Ahmedabad') ? '🕌' : '☀️'} {site.site.split(' ')[0]}</div>
            <div className="stat-value" style={{ color: riskColors[site.riskLevel] }}>{site.avgHealthScore}/100</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className={`badge badge-${site.riskLevel.toLowerCase()}`}>{site.riskLevel}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{site.totalAnomalies} anomalies</span>
            </div>
          </div>
        ))}
        <div className="stat-card">
          <div className="stat-label">📡 Total Sensors</div>
          <div className="stat-value">{sensors.length}</div>
          <div style={{ fontSize: 12, color: 'var(--risk-low)' }}>All operational</div>
        </div>
      </div>

      {/* Health score bar chart */}
      <div className="card mb-24">
        <div className="card-header">
          <h2 className="section-title">📊 Health Scores by Structure</h2>
          <span className="demo-badge">⚡ SIMULATED</span>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DDD0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="healthScore" name="Health Score" radius={[4, 4, 0, 0]}
                fill="#1B6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sensor detail grid */}
      <div className="grid grid-2">
        {/* Sensor list */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">📡 Sensor Readings</h2>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {sensors.map(sensor => (
              <div
                key={sensor.id}
                onClick={() => setSelected(sensor)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: selected?.id === sensor.id ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{sensor.structure}</div>
                  <span className={`badge badge-${sensor.riskLevel.toLowerCase()}`}>{sensor.riskLevel}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6 }}>{sensor.site}</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Health: <strong style={{ color: riskColors[sensor.riskLevel] }}>{sensor.healthScore}/100</strong>
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    Crack: {sensor.readings?.crackWidth}mm
                  </span>
                  {sensor.anomalies?.length > 0 && (
                    <span style={{ fontSize: 12, color: 'var(--sev-high)' }}>⚠ {sensor.anomalies.length} anomaly</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected sensor detail */}
        {selected && (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="section-title" style={{ fontSize: 15 }}>{selected.structure}</h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{selected.site}</div>
              </div>
              <span className={`badge badge-${selected.riskLevel?.toLowerCase()}`}>{selected.riskLevel}</span>
            </div>
            <div className="card-body">
              <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 26, fontWeight: 700, color: riskColors[selected.riskLevel] }}>{selected.healthScore}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Health Score</div>
                </div>
                <div style={{ flex: 2 }}>
                  {selected.anomalies?.length > 0 && (
                    <div className="alert-banner warning" style={{ marginBottom: 8, fontSize: 12 }}>
                      ⚠ {selected.anomalies.length} anomaly detected
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Last updated: {new Date(selected.lastUpdated || Date.now()).toLocaleTimeString('en-IN')}</div>
                </div>
              </div>

              {Object.entries(selected.readings || {}).map(([key, val]) => (
                <SensorValue key={key} name={key} value={val} thresholds={selected.thresholds} />
              ))}

              <button
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: 16 }}
                onClick={() => handleAnalyze(selected.id)}
                disabled={analyzing}
              >
                {analyzing ? '⏳ Analyzing with AI...' : '🤖 Analyze with IBM Granite'}
              </button>

              {analysis && (
                <div style={{ marginTop: 16 }}>
                  {analysis.error ? (
                    <div className="alert-banner error">{analysis.error}</div>
                  ) : (
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, borderLeft: '4px solid var(--heritage-gold)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontWeight: 700, fontSize: 13 }}>AI Analysis</span>
                        {analysis.aiAnalysis?.demo && <span className="demo-badge" style={{ fontSize: 11 }}>Demo Mode</span>}
                      </div>
                      <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                        {analysis.aiAnalysis?.analysis}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
