import React, { useEffect, useState } from 'react';
import { conservationAPI } from '../../services/api';

export default function ConservationReports() {
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState('');
  const [type, setType] = useState('ALL');

  useEffect(() => {
    conservationAPI.getReports().then(res => {
      if (res.success) {
        setReports(res.data);
        if (res.data.length > 0) setSelected(res.data[0]);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleGenerate = async (reportType) => {
    setGenerating(reportType);
    try {
      const res = await conservationAPI.generate(reportType);
      if (res.success) {
        setReports(prev => [res.report, ...prev]);
        setSelected(res.report);
      }
    } catch (err) {
      console.error('Report generation failed:', err.message);
    } finally {
      setGenerating('');
    }
  };

  const filtered = type === 'ALL' ? reports : reports.filter(r => r.type === type);

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">📋 Conservation Reports</h1>
            <p className="page-subtitle">AI-generated conservation summaries and priority action plans</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-primary" onClick={() => handleGenerate('DAILY')} disabled={!!generating}>
              {generating === 'DAILY' ? '⏳' : '📝'} Daily Report
            </button>
            <button className="btn btn-teal" onClick={() => handleGenerate('WEEKLY')} disabled={!!generating}>
              {generating === 'WEEKLY' ? '⏳' : '📊'} Weekly Report
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start', gap: 24 }}>
        {/* Reports list */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Reports ({filtered.length})</h2>
            <div style={{ display: 'flex', gap: 6 }}>
              {['ALL', 'DAILY', 'WEEKLY'].map(t => (
                <button key={t} className={`tag ${type === t ? 'selected' : ''}`} style={{ fontSize: 12 }}
                  onClick={() => setType(t)}>{t}</button>
              ))}
            </div>
          </div>
          <div style={{ maxHeight: 520, overflowY: 'auto' }}>
            {filtered.map(report => (
              <div
                key={report.id}
                onClick={() => setSelected(report)}
                style={{
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  background: selected?.id === report.id ? 'var(--bg-secondary)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 6 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{report.period}</div>
                  <span className={`badge ${report.type === 'WEEKLY' ? 'badge-new' : 'badge-active'}`}>{report.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Health: <strong style={{ color: 'var(--heritage-gold)' }}>{report.overallHealthScore}/100</strong>
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Priority: <strong style={{ color: report.conservationPriorityScore > 70 ? 'var(--sev-high)' : 'var(--risk-low)' }}>
                      {report.conservationPriorityScore}/100
                    </strong>
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {report.generatedBy} · {new Date(report.generatedDate).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report detail */}
        {selected ? (
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="section-title">{selected.period}</h2>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  Generated: {selected.generatedBy}
                </div>
              </div>
              {selected.aiDemo && <div className="demo-badge">⚡ Demo AI</div>}
            </div>

            <div className="card-body">
              {/* Metrics row */}
              <div className="grid grid-3 mb-20" style={{ gap: 12 }}>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--heritage-gold)' }}>{selected.overallHealthScore}/100</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Overall Health</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: selected.sites?.ahmedabad?.trend === 'DECLINING' ? 'var(--sev-high)' : 'var(--risk-low)' }}>
                    {selected.sites?.ahmedabad?.healthScore}/100
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>🕌 Ahmedabad</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{selected.sites?.ahmedabad?.trend}</div>
                </div>
                <div style={{ textAlign: 'center', padding: 12, background: 'var(--bg-secondary)', borderRadius: 8 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: selected.sites?.modhera?.trend === 'DECLINING' ? 'var(--sev-high)' : 'var(--risk-low)' }}>
                    {selected.sites?.modhera?.healthScore}/100
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>☀️ Modhera</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{selected.sites?.modhera?.trend}</div>
                </div>
              </div>

              {/* Key findings */}
              {selected.keyFindings?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🔍 Key Findings</div>
                  {selected.keyFindings.map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--heritage-gold)', fontWeight: 700 }}>•</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{f}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Priority actions */}
              {selected.priorityActions?.length > 0 && (
                <div style={{ marginBottom: 16, padding: 14, background: '#FDEDEC', borderRadius: 8, borderLeft: '4px solid var(--sev-high)' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, color: 'var(--sev-high)' }}>🚨 Priority Actions</div>
                  {selected.priorityActions.map((a, i) => (
                    <div key={i} style={{ fontSize: 13, marginBottom: 6, display: 'flex', gap: 8 }}>
                      <strong>{i + 1}.</strong> {a}
                    </div>
                  ))}
                </div>
              )}

              {/* AI report */}
              {selected.aiGeneratedReport && (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                    <span>📄 Full AI Report</span>
                    {selected.aiDemo && <span className="demo-badge" style={{ fontSize: 11 }}>Demo Mode</span>}
                  </div>
                  <div className="report-content">{selected.aiGeneratedReport}</div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <p>Select a report to view details, or generate a new one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
