import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import HeritageImage from '../../components/ui/HeritageImage';
import { agentsAPI } from '../../services/api';

const AGENTS = [
  { name: 'Structural Health', icon: '🏗', color: '#C0392B', desc: 'Monitors sensor data, crack widths, moisture' },
  { name: 'Visitor Flow', icon: '👥', color: '#E67E22', desc: 'Tracks crowd density and recommends controls' },
  { name: 'Heritage Storytelling', icon: '📖', color: '#8E44AD', desc: 'Generates personalized cultural stories' },
  { name: 'Encroachment Detection', icon: '🔍', color: '#2980B9', desc: 'AI image screening for buffer zone changes' },
  { name: 'Conservation Reporting', icon: '📋', color: '#27AE60', desc: 'Aggregates data and generates priority reports' },
];

const STATS = [
  { value: '2', label: 'Heritage Sites', icon: '🏛' },
  { value: '5', label: 'AI Agents', icon: '🤖' },
  { value: '24/7', label: 'Real-time Monitoring', icon: '📡' },
  { value: 'IBM', label: 'Granite Powered', icon: '💡' },
];

export default function Home() {
  const { systemHealth, simulationActive, startSimulation } = useApp();
  const [agentStatuses, setAgentStatuses] = useState([]);

  useEffect(() => {
    agentsAPI.getStatuses().then(res => {
      if (res.success) setAgentStatuses(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div>
      {/* ─── Hero Section ─────────────────────────────────── */}
      <section className="hero-section">
        <div className="hero-bg-fallback" aria-hidden="true" />
        <div className="hero-bg" aria-hidden="true" style={{
          backgroundImage: `url('/assets/ui/hero/hero.jpg'), url('/assets/ui/hero/hero.jpeg'), url('/assets/ui/hero/hero.png'), url('/assets/modhera/sun_temple/1.jpg'), url('/assets/ahmedabad/walled_city/1.jpg')`
        }} />
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div className="hero-content animate-fadeIn">
            <div className="hero-badge">
              <span aria-hidden="true">🏛</span>
              Agentic AI for Heritage Conservation
            </div>

            <h1 className="hero-title">
              Protecting Heritage.<br />
              <span className="accent">Empowering Visitors.</span><br />
              Preserving Stories.
            </h1>

            <p className="hero-subtitle">
              An Agentic AI platform for intelligent conservation and immersive cultural tourism
              across Ahmedabad's Walled City and Modhera Sun Temple.
            </p>

            <div className="hero-buttons">
              <Link to="/explore" className="btn btn-primary btn-lg">
                🗺 Explore Heritage
              </Link>
              <Link to="/dashboard" className="btn btn-secondary btn-lg">
                📊 Conservation Dashboard
              </Link>
            </div>

            {/* Stats */}
            <div className="hero-stats">
              {STATS.map(stat => (
                <div key={stat.label} className="hero-stat">
                  <span className="hero-stat-value" aria-label={stat.value}>{stat.value}</span>
                  <span style={{ fontSize: 18 }} aria-hidden="true">{stat.icon}</span>
                  <div className="hero-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── System Status Bar ─────────────────────────────── */}
      {systemHealth && (
        <div style={{ background: '#1A120B', borderBottom: '1px solid rgba(201,168,76,0.2)', padding: '10px 0' }}>
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: 'rgba(245,241,236,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Live Status</span>
              <span style={{ fontSize: 13, color: 'rgba(245,241,236,0.8)' }}>
                Overall Health: <strong style={{ color: '#C9A84C' }}>{systemHealth.overall}/100</strong>
              </span>
              <span style={{ fontSize: 13, color: 'rgba(245,241,236,0.8)' }}>
                Ahmedabad: <strong style={{ color: '#C9A84C' }}>{systemHealth.ahmedabad?.visitors?.toLocaleString()} visitors</strong>
              </span>
              <span style={{ fontSize: 13, color: 'rgba(245,241,236,0.8)' }}>
                Modhera: <strong style={{ color: '#C9A84C' }}>{systemHealth.modhera?.visitors?.toLocaleString()} visitors</strong>
              </span>
              {simulationActive && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6EE79B', fontWeight: 600 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#6EE79B', display: 'inline-block' }} />
                  SIMULATION ACTIVE
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Heritage Sites Section ────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-primary)' }}>
        <div className="container">
          <div className="text-center mb-32">
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--heritage-gold)', marginBottom: 12 }}>
              Protected Heritage Sites
            </div>
            <h2 style={{ fontSize: 36, marginBottom: 12 }}>Gujarat's Living Heritage</h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '0 auto', fontSize: 16 }}>
              Two extraordinary heritage sites monitored and protected by our agentic AI platform
            </p>
          </div>

          <div className="grid grid-2" style={{ maxWidth: 900, margin: '0 auto' }}>
            {/* Ahmedabad Card */}
            <Link to="/explore/ahmedabad" style={{ textDecoration: 'none' }}>
              <div className="site-card card-hover" role="article">
                <HeritageImage
                  folder="/assets/ahmedabad/walled_city"
                  alt="Ahmedabad Walled City heritage architecture"
                  className="site-card-image"
                  height={220}
                  placeholderEmoji="🕌"
                />
                <div className="site-card-body">
                  <div className="site-card-tag">UNESCO World Heritage City · 1411 CE</div>
                  <h3 className="site-card-title">Ahmedabad Walled City</h3>
                  <p className="site-card-description">
                    India's first UNESCO World Heritage City, founded by Sultan Ahmed Shah I.
                    Home to intricate pol houses, magnificent mosques, and 600 years of living heritage.
                  </p>
                  <div className="site-card-meta">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className={`badge badge-${(systemHealth?.ahmedabad?.riskLevel || 'MODERATE').toLowerCase()}`}>
                        {systemHealth?.ahmedabad?.riskLevel || 'MODERATE'} RISK
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Health: {systemHealth?.ahmedabad?.healthScore || 72}/100
                      </span>
                    </div>
                    <span style={{ color: 'var(--heritage-teal)', fontWeight: 600, fontSize: 14 }}>Explore →</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Modhera Card */}
            <Link to="/explore/modhera" style={{ textDecoration: 'none' }}>
              <div className="site-card card-hover" role="article">
                <HeritageImage
                  folder="/assets/modhera/sun_temple"
                  alt="Modhera Sun Temple Solanki architecture"
                  className="site-card-image"
                  height={220}
                  placeholderEmoji="☀️"
                  placeholderBg="linear-gradient(135deg, #4A2C1A, #C9A84C)"
                />
                <div className="site-card-body">
                  <div className="site-card-tag">ASI Protected · 1026 CE</div>
                  <h3 className="site-card-title">Modhera Sun Temple</h3>
                  <p className="site-card-description">
                    A masterpiece of Solanki architecture, the Sun Temple is renowned for its
                    astronomical alignment, 108-shrine stepwell, and extraordinary stone carvings.
                  </p>
                  <div className="site-card-meta">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span className={`badge badge-${(systemHealth?.modhera?.riskLevel || 'HIGH').toLowerCase()}`}>
                        {systemHealth?.modhera?.riskLevel || 'HIGH'} RISK
                      </span>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        Health: {systemHealth?.modhera?.healthScore || 63}/100
                      </span>
                    </div>
                    <span style={{ color: 'var(--heritage-teal)', fontWeight: 600, fontSize: 14 }}>Explore →</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── AI Agents Section ────────────────────────────── */}
      <section style={{ padding: '80px 0', background: 'var(--bg-dark)' }}>
        <div className="container">
          <div className="text-center mb-32">
            <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--heritage-gold)', marginBottom: 12 }}>
              Powered by IBM Granite LLM
            </div>
            <h2 style={{ fontSize: 36, color: 'var(--text-light)', marginBottom: 12 }}>
              5 Agentic AI Collaborators
            </h2>
            <p style={{ color: 'rgba(245,241,236,0.55)', maxWidth: 560, margin: '0 auto', fontSize: 16 }}>
              Specialized AI agents work together through a central orchestrator to protect and promote Gujarat's cultural heritage
            </p>
          </div>

          {/* Orchestrator visual */}
          <div className="orchestrator-flow mb-32" style={{ maxWidth: 800, margin: '0 auto 32px' }}>
            <div className="flow-connector" style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: 'rgba(245,241,236,0.4)', fontFamily: 'Inter' }}>
                Sensor Data · Visitor Data · Images · User Queries
              </span>
            </div>
            <div className="flow-connector">↓</div>
            <div className="flow-center">🎯 AI Orchestrator</div>
            <div className="flow-connector">↓</div>
            <div className="flow-agents">
              {AGENTS.map(agent => (
                <div key={agent.name} className="flow-agent">
                  <div style={{ fontSize: 24, marginBottom: 4 }} aria-hidden="true">{agent.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{agent.name}</div>
                </div>
              ))}
            </div>
            <div className="flow-connector">↓</div>
            <div className="flow-center" style={{ borderColor: 'rgba(27,107,107,0.6)', color: 'var(--heritage-teal-light)' }}>
              ⚡ IBM Granite LLM
            </div>
            <div className="flow-connector">↓</div>
            <div style={{ textAlign: 'center', fontSize: 13, color: 'rgba(245,241,236,0.45)', fontFamily: 'Inter' }}>
              Dashboard · Alerts · Recommendations · Reports · Stories
            </div>
          </div>

          {/* Agent cards */}
          <div className="grid grid-auto" style={{ maxWidth: 1100, margin: '0 auto' }}>
            {AGENTS.map((agent, i) => {
              const status = agentStatuses[i];
              return (
                <div key={agent.name} className="agent-card animate-fadeIn" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: `${agent.color}20`, border: `2px solid ${agent.color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                    }} aria-hidden="true">
                      {agent.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{agent.name} Agent</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                        <div className="agent-status-dot" aria-hidden="true" />
                        <span style={{ fontSize: 12, color: 'var(--risk-low)' }}>Active</span>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>{agent.desc}</p>
                  {status && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {status.lastAction}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA Section ──────────────────────────────────── */}
      <section style={{ padding: '64px 0', background: 'var(--bg-secondary)' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: 32, marginBottom: 12 }}>Ready to Explore?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: 16, maxWidth: 480, margin: '0 auto 32px' }}>
            Discover heritage stories, monitor conservation status, and experience AI-powered cultural tourism
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/guide" className="btn btn-primary btn-lg">
              📖 Personalized AI Guide
            </Link>
            <Link to="/dashboard" className="btn btn-dark btn-lg">
              📊 Open Dashboard
            </Link>
            {!simulationActive && (
              <button onClick={startSimulation} className="btn btn-teal btn-lg">
                ▶ Start Simulation
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
