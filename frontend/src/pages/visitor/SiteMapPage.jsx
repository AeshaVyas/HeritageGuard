import React, { Suspense } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
const HeritageMap = React.lazy(() => import('../../components/map/HeritageMap'));

export default function SiteMapPage() {
  const { systemHealth } = useApp();

  const siteData = systemHealth ? {
    'ahmedabad-walled-city': {
      healthScore: systemHealth.ahmedabad?.healthScore,
      riskLevel: systemHealth.ahmedabad?.riskLevel,
      visitors: systemHealth.ahmedabad?.visitors,
      occupancy: systemHealth.ahmedabad?.occupancy,
    },
    'modhera-sun-temple': {
      healthScore: systemHealth.modhera?.healthScore,
      riskLevel: systemHealth.modhera?.riskLevel,
      visitors: systemHealth.modhera?.visitors,
      occupancy: systemHealth.modhera?.occupancy,
    },
  } : {};

  return (
    <div style={{ padding: '48px 0' }}>
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">🗺 Heritage Site Map</h1>
          <p className="page-subtitle">Interactive map showing Gujarat's UNESCO heritage sites with live status indicators</p>
        </div>

        <div className="alert-banner info mb-20">
          📍 Click on a map marker to see the site's current health score, visitor count, and risk level.
        </div>

        <Suspense fallback={<div className="loading-spinner"><div className="spinner" /></div>}>
          <HeritageMap siteData={siteData} height={520} />
        </Suspense>

        <div className="grid grid-2 mt-24">
          <div className="card">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 40 }}>🕌</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Ahmedabad Walled City</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>23.0225°N, 72.5714°E</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span className="badge badge-moderate">MODERATE Risk</span>
                  <Link to="/explore/ahmedabad" style={{ fontSize: 13, color: 'var(--heritage-teal)', fontWeight: 600 }}>View Details →</Link>
                </div>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ fontSize: 40 }}>☀️</div>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>Modhera Sun Temple</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>23.5858°N, 72.1322°E</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span className="badge badge-high">HIGH Risk</span>
                  <Link to="/explore/modhera" style={{ fontSize: 13, color: 'var(--heritage-teal)', fontWeight: 600 }}>View Details →</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
