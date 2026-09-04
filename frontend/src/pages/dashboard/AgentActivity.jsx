import React, { useEffect, useState, useCallback } from 'react';
import { agentsAPI } from '../../services/api';
import { useApp } from '../../context/AppContext';

const AGENT_ICONS = {
  'structural-agent': '🏗',
  'visitor-agent': '👥',
  'storytelling-agent': '📖',
  'encroachment-agent': '🔍',
  'conservation-agent': '📋',
};

const AGENT_COLORS = {
  'structural-agent': '#C0392B',
  'visitor-agent': '#E67E22',
  'storytelling-agent': '#8E44AD',
  'encroachment-agent': '#2980B9',
  'conservation-agent': '#27AE60',
};

const RISK_COLORS = { CRITICAL: '#8B0000', HIGH: '#C0392B', MODERATE: '#E67E22', LOW: '#27AE60' };

export default function AgentActivity() {
  const { simulationActive } = useApp();
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [aRes, eRes] = await Promise.all([
        agentsAPI.getStatuses(),
        agentsAPI.getEvents(15),
      ]);
      if (aRes.success) setAgents(aRes.data);
      if (eRes.success) setEvents(eRes.data);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    const t = setInterval(fetchData, simulationActive ? 5000 : 15000);
    return () => clearInterval(t);
  }, [simulationActive, fetchData]);

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    setAnalyzeResult(null);
    try {
      const res = await agentsAPI.analyze();
      if (res.success) {
        setAnalyzeResult(res.data);
        fetchData();
      }
    } catch (err) {
      setAnalyzeResult({ error: err.message });
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return <div className="loading-spinner"><div className="spinner" /></div>;

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 className="page-title">🤖 AI Agent Activity</h1>
            <p className="page-subtitle">Live status of all five HeritageGuard AI agents powered by IBM Granite LLM</p>
          </div>
          <button className="btn btn-primary" onClick={handleRunAnalysis} disabled={analyzing}>
            {analyzing ? '⏳ Analyzing...' : '🎯 Run Multi-Agent Analysis'}
          </button>
        </div>
      </div>

      {/* Orchestrator flow diagram */}
      <div className="orchestrator-flow mb-24">
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'rgba(245,241,236,0.35)', letterSpacing: 1, marginBottom: 6, fontFamily: 'Inter' }}>
            DATA SOURCES
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {['Sensor Data', 'Visitor Data', 'Images', 'User Queries'].map(src => (
              <span key={src} style={{ padding: '4px 12px', background: 'rgba(245,241,236,0.06)', borderRadius: 6, fontSize: 12, color: 'rgba(245,241,236,0.6)' }}>{src}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 1, height: 30, background: 'rgba(201,168,76,0.4)' }} />
        </div>

        <div className="flow-center" style={{ margin: '0 auto 16px' }}>
          🎯 AI Orchestrator
          {simulationActive && (
            <div style={{ fontSize: 11, marginTop: 4, color: '#6EE79B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE79B', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
              SIMULATION ACTIVE
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{ width: 1, height: 30, background: 'rgba(201,168,76,0.4)' }} />
        </div>

        <div className="flow-agents">
          {agents.map(agent => (
            <div key={agent.id} style={{
              padding: '12px 16px',
              background: `${AGENT_COLORS[agent.id]}15`,
              border: `1px solid ${AGENT_COLORS[agent.id]}40`,
              borderRadius: 10,
              textAlign: 'center',
              minWidth: 130,
            }}>
              <div style={{ fontSize: 26, marginBottom: 4 }}>{AGENT_ICONS[agent.id]}</div>
              <div style={{ fontWeight: 700, fontSize: 12, color: 'rgba(245,241,236,0.9)', marginBottom: 4 }}>
                {agent.name.replace(' Agent', '')}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6EE79B', animation: 'pulse 2s infinite' }} />
                <span style={{ fontSize: 11, color: '#6EE79B' }}>{agent.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
          <div style={{ width: 1, height: 30, background: 'rgba(27,107,107,0.4)' }} />
        </div>

        <div className="flow-center" style={{ margin: '0 auto 12px', borderColor: 'rgba(27,107,107,0.6)', color: 'var(--heritage-teal-light)' }}>
          ⚡ IBM Granite LLM (watsonx.ai)
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(245,241,236,0.35)', fontFamily: 'Inter' }}>
          Dashboard · Alerts · Stories · Reports · Recommendations
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid grid-auto mb-24">
        {agents.map(agent => (
          <div key={agent.id} className="agent-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${AGENT_COLORS[agent.id]}15`,
                  border: `2px solid ${AGENT_COLORS[agent.id]}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24
                }}>
                  {AGENT_ICONS[agent.id]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{agent.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                    <div className="agent-status-dot" />
                    <span style={{ fontSize: 12, color: 'var(--risk-low)' }}>{agent.status}</span>
                  </div>
                </div>
              </div>
              <span className={`badge badge-${(agent.riskDetected || 'MODERATE').toLowerCase()}`}>
                {agent.riskDetected || 'MODERATE'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 13 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>Last Action:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{agent.lastAction}</span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: 'var(--text-muted)', minWidth: 90 }}>Current Task:</span>
                <span style={{ color: 'var(--text-secondary)' }}>{agent.currentTask}</span>
              </div>
              <div style={{ padding: '8px 10px', background: 'var(--bg-secondary)', borderRadius: 6, borderLeft: '3px solid var(--heritage-gold)', marginTop: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                💡 {agent.recommendation}
              </div>
            </div>

            {agent.metrics && (
              <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
                {Object.entries(agent.metrics).map(([key, val]) => (
                  <div key={key} style={{ padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: 6, textAlign: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{val}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Multi-agent analysis result */}
      {analyzeResult && (
        <div className="card mb-24">
          <div className="card-header">
            <h2 className="section-title">🎯 Multi-Agent Analysis Result</h2>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {new Date(analyzeResult.timestamp).toLocaleTimeString('en-IN')}
            </span>
          </div>
          <div className="card-body">
            {analyzeResult.error ? (
              <div className="alert-banner error">{analyzeResult.error}</div>
            ) : (
              <>
                <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>
                  Combined Alerts ({analyzeResult.combinedAlerts?.length || 0})
                </div>
                {(analyzeResult.combinedAlerts || []).map((alert, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, padding: '8px 12px', background: 'var(--bg-secondary)', borderRadius: 6 }}>
                    <span>{alert.type === 'structural' ? '🏗' : alert.type === 'visitor' ? '👥' : '🔍'}</span>
                    <div>
                      <span className={`badge badge-${(alert.severity || 'MODERATE').toLowerCase()}`} style={{ marginRight: 8 }}>{alert.severity}</span>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{alert.message}</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Event log */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">📜 Orchestrator Event Log</h2>
          <button className="btn btn-sm btn-secondary" onClick={fetchData}>🔄 Refresh</button>
        </div>
        <div className="card-body" style={{ maxHeight: 360, overflowY: 'auto', padding: 0 }}>
          {events.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)' }}>
              No events yet. Start simulation or run analysis.
            </div>
          ) : (
            events.map(ev => (
              <div key={ev.id} style={{ display: 'flex', gap: 12, padding: '10px 20px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 16 }}>
                  {ev.source === 'SIMULATION' ? '📡' : ev.source === 'ORCHESTRATOR' ? '🎯' : '🤖'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>{ev.source}</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(ev.timestamp).toLocaleTimeString('en-IN')}</span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ev.message}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
