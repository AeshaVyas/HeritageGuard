import React, { useEffect, useState, useRef } from 'react';
import { encroachmentAPI } from '../../services/api';

const STATUS_COLORS = { UNDER_INVESTIGATION: '#E67E22', RESOLVED: '#27AE60', ESCALATED: '#C0392B' };

export default function Encroachment() {
  const [cases, setCases] = useState([]);
  const [sample, setSample] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeForm, setAnalyzeForm] = useState({ site: 'Ahmedabad Walled City', zone: 'Eastern Buffer Zone', imageType: 'SAMPLE' });
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    Promise.all([
      encroachmentAPI.getAll(),
      encroachmentAPI.getSample(),
    ]).then(([cRes, sRes]) => {
      if (cRes.success) setCases(cRes.data);
      if (sRes.success) setSample(sRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('site', analyzeForm.site);
      formData.append('zone', analyzeForm.zone);
      formData.append('imageType', analyzeForm.imageType);
      if (fileRef.current?.files[0]) formData.append('image', fileRef.current.files[0]);

      const res = await encroachmentAPI.analyze(formData);
      if (res.success) {
        setResult(res);
        setCases(prev => [res.case, ...prev]);
      }
    } catch (err) {
      setResult({ error: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await encroachmentAPI.updateStatus(id, status);
      if (res.success) setCases(prev => prev.map(c => c.id === id ? res.data : c));
    } catch {}
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">🔍 Encroachment Detection</h1>
        <p className="page-subtitle">AI-assisted screening for unauthorized changes near heritage buffer zones</p>
      </div>

      <div className="alert-banner warning mb-20">
        ⚠️ <strong>Important Disclaimer:</strong> This prototype provides AI-assisted screening and does not replace official heritage/legal inspection. All findings must be verified by certified heritage inspectors.
      </div>

      <div className="grid grid-2 mb-24" style={{ alignItems: 'start' }}>
        {/* Analysis tool */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">🤖 Run AI Screening</h2>
            <span className="demo-badge">⚡ Simulated CV</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Heritage Site</label>
              <select className="form-control" value={analyzeForm.site}
                onChange={e => setAnalyzeForm(p => ({ ...p, site: e.target.value }))}>
                <option>Ahmedabad Walled City</option>
                <option>Modhera Sun Temple</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Zone</label>
              <input className="form-control" value={analyzeForm.zone}
                onChange={e => setAnalyzeForm(p => ({ ...p, zone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Image (optional — simulated analysis if no file)</label>
              <input type="file" ref={fileRef} accept="image/*" className="form-control" style={{ padding: '8px' }} />
            </div>

            {/* Sample comparison */}
            {sample && (
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Sample Before/After Comparison</div>
                <div className="image-comparison">
                  <div className="comparison-image">
                    <div className="comparison-placeholder">🏛</div>
                    <div className="comparison-label">{sample.before?.label}</div>
                  </div>
                  <div className="comparison-image">
                    <div className="comparison-placeholder" style={{ background: 'linear-gradient(135deg, #FEF3E2, #E8DDD0)' }}>🏗</div>
                    <div className="comparison-label">{sample.after?.label}</div>
                  </div>
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  Change Score: <strong>{sample.after?.changeScore}%</strong> · Method: {sample.changesSummary?.analysisMethod}
                </div>
              </div>
            )}

            <button className="btn btn-primary" style={{ justifyContent: 'center' }}
              onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? '⏳ Analyzing...' : '🔍 Run Encroachment Analysis'}
            </button>

            {result && (
              <div>
                {result.error ? (
                  <div className="alert-banner error">{result.error}</div>
                ) : (
                  <div style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: 14, borderLeft: '4px solid var(--heritage-gold)' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Analysis Result</div>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                      <div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Type: </span>
                        <strong style={{ fontSize: 13 }}>{result.case?.type}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Confidence: </span>
                        <strong style={{ fontSize: 13, color: result.case?.confidenceScore > 70 ? 'var(--sev-high)' : 'var(--risk-moderate)' }}>
                          {result.case?.confidenceScore}%
                        </strong>
                      </div>
                      <span className={`badge badge-${result.case?.riskLevel.toLowerCase()}`}>{result.case?.riskLevel}</span>
                    </div>
                    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      {result.aiAnalysis?.analysis}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Cases list */}
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">📋 Cases ({cases.length})</h2>
          </div>
          <div className="card-body" style={{ padding: 0, maxHeight: 600, overflowY: 'auto' }}>
            {cases.map(c => (
              <div key={c.id} style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, flexWrap: 'wrap', gap: 6 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{c.type}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{c.site} · {c.zone}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className={`badge badge-${c.riskLevel.toLowerCase()}`}>{c.riskLevel}</span>
                    <span className={`badge badge-${c.status === 'RESOLVED' ? 'resolved' : c.status === 'ESCALATED' ? 'high' : 'investigating'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{c.description}</p>
                <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    Confidence: {c.confidenceScore}% · {c.detectedDate}
                  </span>
                  {c.status !== 'RESOLVED' && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleStatusUpdate(c.id, 'RESOLVED')}>
                        ✓ Resolve
                      </button>
                    </div>
                  )}
                </div>
                {c.aiExplanation && (
                  <div style={{ marginTop: 8, padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 6, fontSize: 11, color: 'var(--text-secondary)', borderLeft: '3px solid var(--heritage-gold)' }}>
                    {c.aiExplanation.substring(0, 200)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
