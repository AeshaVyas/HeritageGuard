import React, { useState, useEffect } from 'react';
import { storytellingAPI } from '../../services/api';

const SITES = [
  { id: 'ahmedabad-walled-city', name: 'Ahmedabad Walled City', emoji: '🕌' },
  { id: 'modhera-sun-temple', name: 'Modhera Sun Temple', emoji: '☀️' },
];
const LANGUAGES = ['English', 'Hindi', 'Gujarati'];
const AGE_GROUPS = ['Child (6-12)', 'Teen (13-17)', 'Adult', 'Senior (60+)'];
const STYLES = ['Informative and engaging', 'Storytelling narrative', 'Academic', 'Family-friendly', 'Photography guide'];
const DURATIONS = [5, 10, 15, 30, 60];

export default function HeritageGuide() {
  const [form, setForm] = useState({
    site: 'modhera-sun-temple',
    language: 'English',
    interests: [],
    duration: 15,
    ageGroup: 'Adult',
    style: 'Informative and engaging',
  });
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metadata, setMetadata] = useState({ interests: [], languages: [] });

  useEffect(() => {
    storytellingAPI.getMetadata().then(res => {
      if (res.success) setMetadata(res.data);
    }).catch(() => {});
  }, []);

  const toggleInterest = (interest) => {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setStory(null);
    try {
      const res = await storytellingAPI.generate(form);
      if (res.success) setStory(res);
      else setError(res.errors?.join(', ') || 'Generation failed');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const interests = metadata.interests?.length ? metadata.interests : [
    'Architecture', 'History', 'Religion', 'Astronomy',
    'Local Culture', 'Photography', 'Sculpture', 'Family-friendly'
  ];

  return (
    <div style={{ padding: '48px 0' }}>
      <div className="container">
        <div className="page-header">
          <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--heritage-gold)', marginBottom: 8 }}>
            Powered by IBM Granite LLM
          </div>
          <h1 className="page-title">🏛 Personalized Heritage Guide</h1>
          <p className="page-subtitle">
            Get an AI-generated cultural story tailored to your interests, language, and available time.
          </p>
        </div>

        <div className="grid grid-2" style={{ gap: 32, alignItems: 'start' }}>
          {/* Form */}
          <div className="card">
            <div className="card-header">
              <h2 className="section-title">Customize Your Story</h2>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Site selection */}
              <div className="form-group">
                <label className="form-label">Heritage Site *</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {SITES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setForm(prev => ({ ...prev, site: s.id }))}
                      className={`btn ${form.site === s.id ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1, justifyContent: 'center' }}
                    >
                      {s.emoji} {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div className="form-group">
                <label className="form-label">Language</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang}
                      onClick={() => setForm(prev => ({ ...prev, language: lang }))}
                      className={`tag ${form.language === lang ? 'selected' : ''}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div className="form-group">
                <label className="form-label">Available Time (minutes)</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {DURATIONS.map(d => (
                    <button
                      key={d}
                      onClick={() => setForm(prev => ({ ...prev, duration: d }))}
                      className={`tag ${form.duration === d ? 'selected' : ''}`}
                    >
                      {d} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Age Group */}
              <div className="form-group">
                <label className="form-label">Age Group</label>
                <select
                  className="form-control"
                  value={form.ageGroup}
                  onChange={e => setForm(prev => ({ ...prev, ageGroup: e.target.value }))}
                >
                  {AGE_GROUPS.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>

              {/* Style */}
              <div className="form-group">
                <label className="form-label">Storytelling Style</label>
                <select
                  className="form-control"
                  value={form.style}
                  onChange={e => setForm(prev => ({ ...prev, style: e.target.value }))}
                >
                  {STYLES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              {/* Interests */}
              <div className="form-group">
                <label className="form-label">Your Interests (select multiple)</label>
                <div className="tags">
                  {interests.map(interest => (
                    <button
                      key={interest}
                      onClick={() => toggleInterest(interest)}
                      className={`tag ${form.interests.includes(interest) ? 'selected' : ''}`}
                      aria-pressed={form.interests.includes(interest)}
                    >
                      {interest}
                    </button>
                  ))}
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                onClick={handleGenerate}
                disabled={loading}
                style={{ justifyContent: 'center' }}
              >
                {loading ? '⏳ Generating Story...' : '✨ Generate My Heritage Story'}
              </button>

              {error && (
                <div className="alert-banner error">{error}</div>
              )}
            </div>
          </div>

          {/* Story output */}
          <div>
            {!story && !loading && (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>📖</div>
                <h3 style={{ marginBottom: 8 }}>Your Story Awaits</h3>
                <p style={{ fontSize: 14 }}>
                  Fill in your preferences and click Generate to receive a personalized
                  cultural story powered by IBM Granite LLM.
                </p>
              </div>
            )}

            {loading && (
              <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
                <div className="spinner" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-muted)' }}>
                  IBM Granite LLM is crafting your personalized heritage story...
                </p>
              </div>
            )}

            {story && (
              <div className="card animate-fadeIn">
                <div className="card-header">
                  <div>
                    <h2 className="section-title">Your Heritage Story</h2>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                      {SITES.find(s => s.id === story.metadata?.site)?.name} · {story.metadata?.language} · {story.metadata?.duration} min
                    </div>
                  </div>
                  {story.metadata?.demo && (
                    <div className="demo-badge">⚡ Demo AI Mode</div>
                  )}
                </div>

                {story.metadata?.demoNotice && (
                  <div className="alert-banner demo" style={{ margin: '0 20px', borderRadius: 8 }}>
                    💡 {story.metadata.demoNotice}
                  </div>
                )}

                <div className="card-body">
                  <div className="story-content" style={{ fontSize: 15, lineHeight: 1.85, color: 'var(--text-secondary)' }}>
                    {story.story}
                  </div>

                  {story.facts?.length > 0 && (
                    <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: '4px solid var(--heritage-gold)' }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>✨ Interesting Facts</div>
                      {story.facts.map((fact, i) => (
                        <div key={i} style={{ marginBottom: 10 }}>
                          <span className="badge badge-moderate" style={{ marginRight: 8 }}>{fact.interest}</span>
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{fact.fact}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {story.suggestedRoute?.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🗺 Suggested Route</div>
                      <ol style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {story.suggestedRoute.map((step, i) => (
                          <li key={i} style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-muted)' }}>
                    Generated by: {story.metadata?.source} · {new Date(story.metadata?.generatedAt).toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
