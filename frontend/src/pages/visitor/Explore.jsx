import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeritageImage from '../../components/ui/HeritageImage';
import { sitesAPI } from '../../services/api';

export default function Explore() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sitesAPI.getAll().then(res => {
      if (res.success) setSites(res.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-spinner"><div className="spinner" /><span>Loading sites...</span></div>;

  return (
    <div style={{ padding: '60px 0' }}>
      <div className="container">
        <div className="page-header text-center" style={{ borderBottom: 'none', paddingBottom: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--heritage-gold)', marginBottom: 12 }}>
            Explore Gujarat's Heritage
          </div>
          <h1 className="page-title" style={{ fontSize: 42 }}>Discover Living History</h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: 560, margin: '12px auto 0', fontSize: 16 }}>
            Two extraordinary heritage destinations monitored and protected by AI
          </p>
        </div>

        <div className="grid grid-2 mt-24" style={{ maxWidth: 960, margin: '48px auto 0', gap: 32 }}>
          {sites.map(site => (
            <Link key={site.id} to={`/explore/${site.id === 'ahmedabad-walled-city' ? 'ahmedabad' : 'modhera'}`} style={{ textDecoration: 'none' }}>
              <div className="site-card card-hover" role="article">
                <HeritageImage
                  folder={`/assets/${site.id === 'ahmedabad-walled-city' ? 'ahmedabad/walled_city' : 'modhera/sun_temple'}`}
                  alt={`${site.name} heritage site`}
                  className="site-card-image"
                  height={260}
                  placeholderEmoji={site.id === 'ahmedabad-walled-city' ? '🕌' : '☀️'}
                  placeholderBg={site.id === 'ahmedabad-walled-city'
                    ? 'linear-gradient(135deg, #2C1A0E, #1B6B6B)'
                    : 'linear-gradient(135deg, #4A2C1A, #C9A84C)'}
                />
                <div className="site-card-body">
                  <div className="site-card-tag">{site.subtitle}</div>
                  <h2 className="site-card-title">{site.name}</h2>
                  <p className="site-card-description">{site.description?.substring(0, 180)}...</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16, padding: '12px 0', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--heritage-gold)' }}>{site.healthScore}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Health Score</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{site.currentVisitors}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Visitors</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <span className={`badge badge-${(site.riskLevel || 'MODERATE').toLowerCase()}`} style={{ fontSize: 11 }}>
                        {site.riskLevel || 'MODERATE'}
                      </span>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Risk Level</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Conservation Challenges:</div>
                    <div className="tags">
                      {(site.conservationRisks || []).slice(0, 3).map(risk => (
                        <span key={risk} className="tag" style={{ fontSize: 11 }}>{risk}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      📍 {site.location?.city}, Gujarat
                    </span>
                    <span style={{ color: 'var(--heritage-teal)', fontWeight: 700 }}>View Details →</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick links */}
        <div className="grid grid-3 mt-24" style={{ maxWidth: 900, margin: '48px auto 0' }}>
          <Link to="/guide" className="card card-hover" style={{ padding: 24, textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📖</div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>AI Heritage Guide</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Get a personalized cultural story in English, Hindi, or Gujarati</p>
          </Link>
          <Link to="/visitor-flow" className="card card-hover" style={{ padding: 24, textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>👥</div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>Live Visitor Flow</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Check real-time visitor density before you visit</p>
          </Link>
          <Link to="/map" className="card card-hover" style={{ padding: 24, textDecoration: 'none', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗺</div>
            <h3 style={{ fontSize: 16, marginBottom: 6 }}>Site Map</h3>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Interactive map of all heritage locations in Gujarat</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
