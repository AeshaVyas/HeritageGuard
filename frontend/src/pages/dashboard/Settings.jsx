import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';

export default function Settings() {
  const [aiStatus, setAiStatus] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    aiAPI.getStatus().then(res => {
      if (res.success) setAiStatus(res.data);
    }).catch(() => {});
  }, []);

  return (
    <div className="animate-fadeIn">
      <div className="page-header">
        <h1 className="page-title">⚙️ Settings</h1>
        <p className="page-subtitle">System configuration and IBM Cloud integration status</p>
      </div>

      {/* IBM Integration Status */}
      <div className="card mb-24">
        <div className="card-header">
          <h2 className="section-title">⚡ IBM watsonx.ai Integration</h2>
          {aiStatus && (
            <span className={`badge ${aiStatus.configured ? 'badge-active' : 'badge-demo'}`}>
              {aiStatus.configured ? '✓ Connected' : '⚡ Demo Mode'}
            </span>
          )}
        </div>
        <div className="card-body">
          {aiStatus?.configured ? (
            <div className="alert-banner success">
              ✅ IBM Granite LLM is configured and active. All AI features are using real IBM watsonx.ai responses.
            </div>
          ) : (
            <div className="alert-banner demo">
              ⚡ <strong>Demo AI Mode Active</strong> — IBM Granite connection is not configured. The application is running with realistic demo responses.
              <br /><br />
              To enable real IBM Granite LLM responses, add the following to your <code style={{ background: 'rgba(0,0,0,0.06)', padding: '1px 6px', borderRadius: 4 }}>backend/.env</code> file:
            </div>
          )}

          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Required Environment Variables (backend/.env)</div>
            <div style={{ background: '#1A120B', borderRadius: 8, padding: 16, fontFamily: 'monospace', fontSize: 13, color: '#C9A84C', lineHeight: 2 }}>
              <div># IBM Cloud API Key</div>
              <div style={{ color: '#6EE79B' }}>IBM_CLOUD_API_KEY=your_ibm_cloud_api_key</div>
              <div style={{ marginTop: 8 }}># IBM watsonx.ai Project ID</div>
              <div style={{ color: '#6EE79B' }}>WATSONX_PROJECT_ID=your_project_id</div>
              <div style={{ marginTop: 8 }}># IBM watsonx.ai URL</div>
              <div style={{ color: '#6EE79B' }}>WATSONX_URL=https://us-south.ml.cloud.ibm.com</div>
              <div style={{ marginTop: 8 }}># Granite Model ID</div>
              <div style={{ color: '#6EE79B' }}>GRANITE_MODEL_ID=ibm/granite-13b-instruct-v2</div>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>IBM Granite Setup Steps</div>
            <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Log in to IBM Cloud (cloud.ibm.com)',
                'Navigate to watsonx.ai and create a project',
                'Copy your Project ID from the project settings',
                'Generate an IBM Cloud API key from IAM → API Keys',
                'Note the watsonx.ai service URL for your region',
                'Add all credentials to backend/.env',
                'Restart the backend server',
              ].map((step, i) => (
                <li key={i} style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Application Configuration */}
      <div className="card mb-24">
        <div className="card-header">
          <h2 className="section-title">🔧 Application Configuration</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-2" style={{ gap: 20 }}>
            {[
              { label: 'Application Name', value: 'HeritageGuard AI' },
              { label: 'Version', value: '1.0.0' },
              { label: 'Heritage Sites Monitored', value: '2' },
              { label: 'AI Agents Active', value: '5' },
              { label: 'Simulation Interval', value: '5 seconds' },
              { label: 'Backend URL', value: 'http://localhost:5000' },
              { label: 'Frontend URL', value: 'http://localhost:5173' },
              { label: 'Map Provider', value: 'OpenStreetMap (Leaflet)' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About */}
      <div className="card">
        <div className="card-header">
          <h2 className="section-title">ℹ️ About HeritageGuard AI</h2>
        </div>
        <div className="card-body">
          <p style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary)', marginBottom: 16 }}>
            HeritageGuard AI is an agentic AI platform for the intelligent conservation and immersive cultural tourism
            of Gujarat's heritage sites — Ahmedabad's UNESCO World Heritage Walled City and the Modhera Sun Temple.
          </p>
          <div className="alert-banner warning" style={{ marginBottom: 16 }}>
            ⚠️ <strong>Important:</strong> This is a prototype/demonstration platform. All sensor readings,
            visitor counts, and encroachment detections are simulated for demonstration purposes.
            AI-generated content should be treated as decision support, not official conservation guidance.
            Always consult certified heritage professionals for actual conservation decisions.
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <span className="badge badge-new">React + Vite Frontend</span>
            <span className="badge badge-new">Node.js + Express Backend</span>
            <span className="badge badge-active">IBM Granite LLM</span>
            <span className="badge badge-active">IBM watsonx.ai</span>
            <span className="badge badge-moderate">OpenStreetMap / Leaflet</span>
            <span className="badge badge-moderate">Recharts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
