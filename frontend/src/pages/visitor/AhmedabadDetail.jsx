import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeritageImage from '../../components/ui/HeritageImage';
import { sitesAPI } from '../../services/api';

export default function AhmedabadDetail() {
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sitesAPI.getById('ahmedabad-walled-city').then(res => {
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
          folder="/assets/ahmedabad/walled_city"
          alt="Ahmedabad Walled City aerial view"
          style={{ width: '100%', height: 400, objectFit: 'cover', opacity: 0.5 }}
          placeholderBg="linear-gradient(135deg, #2C1A0E 0%, #1B6B6B 100%)"
          placeholderEmoji="🕌"
        />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '40px 40px' }}>
          <div style={{ fontSize: 12, color: 'var(--heritage-gold)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
            {site.subtitle}
          </div>
          <h1 style={{ color: 'white', fontSize: 42, marginBottom: 8 }}>{site.name}</h1>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>📍 {site.location.city}, {site.location.state}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>🏛 Founded: {site.yearBuilt}</span>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>👑 {site.founder}</span>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {/* Status bar */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 32 }}>
          <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
            <div className="stat-label">Health Score</div>
            <div className="stat-value" style={{ color: 'var(--heritage-gold)' }}>{site.healthScore}/100</div>
          </div>
          <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
            <div className="stat-label">Risk Level</div>
            <div><span className={`badge badge-${(site.riskLevel || 'MODERATE').toLowerCase()}`} style={{ fontSize: 14, padding: '6px 14px' }}>{site.riskLevel}</span></div>
          </div>
          <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
            <div className="stat-label">Current Visitors</div>
            <div className="stat-value">{site.currentVisitors}</div>
          </div>
          <div className="stat-card" style={{ flex: 1, minWidth: 150 }}>
            <div className="stat-label">Active Alerts</div>
            <div className="stat-value" style={{ color: site.activeAlerts > 0 ? 'var(--sev-high)' : 'var(--risk-low)' }}>{site.activeAlerts}</div>
          </div>
        </div>

        <div className="grid grid-2" style={{ gap: 32 }}>
          <div>
            {/* Historical Overview */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">📜 Historical Overview</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)' }}>{site.historicalOverview}</p>
              </div>
            </div>

            {/* Architecture */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">🏛 Architecture</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 12 }}>
                  Styles: {site.architecture.styles.join(' · ')}
                </p>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Notable Buildings</div>
                  {Object.entries(site.architecture.keyBuildings || {}).map(([name, desc]) => (
                    <div key={name} style={{ marginBottom: 8 }}>
                      <strong style={{ fontSize: 14 }}>{name}</strong>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{desc}</p>
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 14 }}>Architectural Features</div>
                  <div className="tags">
                    {(site.architecture.features || []).map(f => (
                      <span key={f} className="tag">{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Pol Houses */}
            <div className="card">
              <div className="card-header"><h2 className="section-title">🏘 Traditional Pol Houses</h2></div>
              <div className="card-body">
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 12 }}>
                  {site.polHouses.description}
                </p>
                <HeritageImage
                  folder="/assets/ahmedabad/pol_houses"
                  alt="Traditional pol house wooden carving Ahmedabad"
                  style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8, marginBottom: 12 }}
                  placeholderEmoji="🏘"
                  height={180}
                />
                <div className="tags">
                  {(site.polHouses.features || []).map(f => (
                    <span key={f} className="tag" style={{ fontSize: 12 }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            {/* Images gallery */}
            <div className="card mb-20">
              <div className="card-header"><h2 className="section-title">📸 Heritage Gallery</h2></div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { folder: '/assets/ahmedabad/heritage_buildings', label: 'Heritage Buildings', emoji: '🏛' },
                    { folder: '/assets/ahmedabad/streets', label: 'Historic Streets', emoji: '🛤' },
                    { folder: '/assets/ahmedabad/walled_city', label: 'Walled City', emoji: '🕌' },
                    { folder: '/assets/ahmedabad/pol_houses', label: 'Pol Houses', emoji: '🏘' },
                  ].map(item => (
                    <div key={item.folder} style={{ borderRadius: 8, overflow: 'hidden' }}>
                      <HeritageImage
                        folder={item.folder}
                        alt={item.label}
                        height={120}
                        style={{ width: '100%', objectFit: 'cover' }}
                        placeholderEmoji={item.emoji}
                      />
                      <div style={{ padding: '4px 8px', background: 'var(--bg-secondary)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>
                        {item.label}
                      </div>
                    </div>
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
                <span className="badge badge-moderate">Under Monitoring</span>
              </div>
              <div className="card-body">
                {(site.conservationRisks || []).map((risk, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--risk-moderate)', fontWeight: 700, fontSize: 16, marginTop: 1 }}>⚡</span>
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
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Best Time</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{site.visitorInfo.bestTime}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Entry Fee</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{site.visitorInfo.entryFee}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Timings</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{site.visitorInfo.timings}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 2 }}>Capacity</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{site.visitorInfo.capacity} visitors/day</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link to="/guide" className="btn btn-primary">📖 Get AI Heritage Guide</Link>
          <Link to="/dashboard/structural" className="btn btn-dark">🏗 View Structural Health</Link>
          <Link to="/explore" className="btn btn-secondary">← Back to Explore</Link>
        </div>
      </div>
    </div>
  );
}
