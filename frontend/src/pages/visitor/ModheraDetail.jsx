import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeritageImage from '../../components/ui/HeritageImage';
import { sitesAPI } from '../../services/api';

export default function ModheraDetail() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sitesAPI.getById('modhera-sun-temple').then(res => {
      if (res.success) setSite(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading...</span></div>;
  if (!site) return <div className="container" style={{ padding: '60px 0' }}>Site not found.</div>;

  return (
    <div>
      {/* Hero */}
      <div style={{ position: 'relative', height: 400, overflow: 'hidden', background: 'var(--bg-dark)' }}>
        <HeritageImage
          folder="/assets/modhera/sun_temple"
          alt="Modhera Sun Temple Solanki architecture"
          style={{ width: '100%', height: 400, objectFit: 'cover', opacity: 0.5 }}
          placeholderBg="linear-gradient(135deg, #4A2C1A 0%, #C9A84C 100%)"
          placeholderEmoji="☀️"
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 40px' }}>
          <div style={{ fontSize: 12, color: 'var(--heritage-gold)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            {site.subtitle}
          </div>
          <h1 style={{ color: 'white', fontSize: 42, marginBottom: 8 }}>{site.name}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>📍 {site.location.city}, {site.location.state}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>🏛 Built: {site.yearBuilt}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>👑 {site.dynasty}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {/* Status bar */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          {[
            { label: 'Health Score', value: `${site.healthScore}/100`, color: 'var(--heritage-gold)' },
            { label: 'Risk Level', badge: site.riskLevel },
            { label: 'Current Visitors', value: site.currentVisitors },
            { label: 'Active Alerts', value: site.activeAlerts, color: site.activeAlerts > 0 ? 'var(--sev-high)' : 'var(--risk-low)' },
          ].map(item => (
            <div key={item.label} className="stat-card" style={{ flex: 1, minWidth: 150 }}>
              <div className="stat-label">{item.label}</div>
              {item.badge
                ? <span className={`badge badge-${item.badge.toLowerCase()}`} style={{ fontSize: 14, padding: '6px 14px' }}>{item.badge}</span>
                : <div className="stat-value" style={{ color: item.color }}>{item.value}</div>
              }
            </div>
          ))}
        </div>

        <div className="grid grid-2" style={{ gap: 32 }}>
          <div>
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">📜 Historical Overview</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>{site.historicalOverview}</p>
              </div>
            </div>

            {/* Architecture */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">🏛 Temple Architecture</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Style: <strong>{site.architecture.styles.join(', ')}</strong>
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                  {site.architecture.astronomicalAlignment || 'The temple is aligned with the sunrise on equinoxes.'}
                </p>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>Three Sections</div>
                {Object.entries(site.architecture.features ? {} : (site.architecture.threeParts || {})).map(([k, v]) => (
                  <div key={k} style={{ marginBottom: 8, paddingLeft: 12, borderLeft: '3px solid var(--heritage-gold)' }}>
                    <strong style={{ fontSize: 13 }}>{k}</strong>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{v}</p>
                  </div>
                ))}
                {site.architecture.features && (
                  <div className="tags mt-8">
                    {site.architecture.features.map(f => <span key={f} className="tag">{f}</span>)}
                  </div>
                )}
              </div>
            </div>

            {/* Surya Kund */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">🌊 Surya Kund — Stepwell</h2></div>
              <div className="card-body">
                <HeritageImage
                  folder="/assets/modhera/stepwell"
                  alt="Surya Kund stepwell at Modhera Sun Temple"
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                  placeholderEmoji="🌊"
                  height={180}
                />
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {site.suryaKund?.description}
                </p>
                <div className="grid grid-3" style={{ gap: 10 }}>
                  {[
                    { label: 'Steps', value: site.suryaKund?.steps || 108 },
                    { label: 'Shrines', value: site.suryaKund?.shrines || 108 },
                    { label: 'Built', value: '1026 CE' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--heritage-gold)' }}>{item.value}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Gallery */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">📸 Temple Gallery</h2></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { folder: '/assets/modhera/sun_temple', label: 'Sun Temple', emoji: '☀️' },
                    { folder: '/assets/modhera/carvings', label: 'Stone Carvings', emoji: '🗿' },
                    { folder: '/assets/modhera/stepwell', label: 'Surya Kund', emoji: '🌊' },
                    { folder: '/assets/modhera/architecture', label: 'Architecture', emoji: '🏛' },
                  ].map(item => (
                    <div key={item.folder} style={{ borderRadius: 8, overflow: 'hidden' }}>
                      <HeritageImage folder={item.folder} alt={item.label} height={120}
                        style={{ width: '100%', objectFit: 'cover' }} placeholderEmoji={item.emoji} />
                      <div style={{ padding: '4px 8px', background: 'var(--bg-secondary)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sculptures */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">🗿 Sculptures & Carvings</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {site.sculptures?.description || 'The temple features extraordinary stone carvings covering virtually every surface.'}
                </p>
                <div className="tags">
                  {(site.sculptures?.subjects || site.architecture?.carvings || []).map(s => (
                    <span key={s} className="tag" style={{ fontSize: 12 }}>{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Cultural Significance */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">🎭 Cultural Significance</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)' }}>{site.culturalSignificance}</p>
              </div>
            </div>

            {/* Conservation Risks */}
            <div className="card mb-20">
              <div className="card-header">
                <h2 className="section-title">⚠️ Conservation Risks</h2>
                <span className="badge badge-high">Priority</span>
              </div>
              <div className="card-body">
                {(site.conservationRisks || []).map((risk, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--sev-high)', fontWeight: 700, fontSize: 16, marginTop: 1 }}>⚡</span>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{risk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visitor Info */}
            <div className="card">
              <div className="card-header"><h2 className="section-title">ℹ️ Visitor Information</h2></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Best Time', value: site.visitorInfo.bestTime },
                    { label: 'Timings', value: site.visitorInfo.timings },
                    { label: 'Entry Fee', value: site.visitorInfo.entryFee },
                    { label: 'Capacity', value: `${site.visitorInfo.capacity} visitors/day` },
                  ].map(item => (
                    <div key={item.label}>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/guide" className="btn btn-primary">📖 Get AI Heritage Story</Link>
          <Link to="/dashboard/structural" className="btn btn-dark">🏗 View Structural Health</Link>
          <Link to="/explore" className="btn btn-secondary">← Back to Explore</Link>
        </div>
      </div>
    </div>
  );
}
