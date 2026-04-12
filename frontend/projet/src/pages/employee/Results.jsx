import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

function ScoreRing({ value, color, label, size = 80 }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const fill = circ - (value / 100) * circ;
  const strokeColor =
    color === 'danger' ? 'var(--danger)' :
    color === 'warning' ? 'var(--warning)' :
    color === 'success' ? 'var(--success)' : 'var(--primary)';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth="7" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={fill}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="14" fontWeight="700" fill={strokeColor}>
          {value}%
        </text>
      </svg>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 6, maxWidth: size, margin: '6px auto 0' }}>
        {label}
      </div>
    </div>
  );
}

function ScoreBar({ label, value, color = 'primary' }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: 'var(--gray-600)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className={`progress-bar ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function EmployeeResults() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');

  const fetchResults = () => {
    return api.get('/employee/my-results')
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchResults(); }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true); setAnalyzeMsg(''); setAnalyzeError('');
    try {
      const res = await api.post('/employee/analyze');
      setAnalyzeMsg(res.data.message || 'Analysis complete!');
      setLoading(true);
      await fetchResults();
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="layout"><Sidebar />
      <main className="main"><div className="text-muted">Loading...</div></main>
    </div>
  );

  // Results are stored unwrapped:
  // aiResults.skillAnalysis  = { coverage_score, matching_skills, missing_skills, ... }
  // aiResults.hrPredictions  = { predictions: { attrition_risk, promotion_readiness, skill_growth_trajectory }, insights }
  const results = data?.results;
  const sk = results?.skillAnalysis;
  const hr = results?.hrPredictions;
  const predictions = hr?.predictions;
  const insights = hr?.insights || [];
  const employee = data?.employee;
  const profileComplete = employee?.profileCompleted && employee?.skillProfile?.role;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <div className="page-title">My AI Results</div>
            <div className="page-subtitle">
              {results?.analyzedAt
                ? `Last analyzed ${new Date(results.analyzedAt).toLocaleString()}`
                : 'No analysis run yet'}
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAnalyze}
            disabled={analyzing || !profileComplete}>
            {analyzing ? 'Analyzing...' : ' Re-run analysis'}
          </button>
        </div>

        {analyzeMsg && <div className="alert alert-success">{analyzeMsg}</div>}
        {analyzeError && <div className="alert alert-error">{analyzeError}</div>}

        {!profileComplete && (
          <div className="alert alert-warning">
             Complete your{' '}
            <Link to="/employee/profile" style={{ fontWeight: 600 }}>HR and skill profiles</Link>
            {' '}before running analysis.
          </div>
        )}

        {!results && profileComplete && (
          <div className="card" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <div className="card-title" style={{ marginBottom: 8 }}>No results yet</div>
            <div className="card-subtitle" style={{ marginBottom: 24 }}>
              Run your first AI analysis to see your skill gap report and HR predictions.
            </div>
            <button className="btn btn-primary" onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Run analysis now'}
            </button>
          </div>
        )}

        {results && (
          <>
            {/* Score rings */}
            {(predictions || sk) && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 24 }}>Overall scores</div>
                <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {predictions?.attrition_risk && (
                    <ScoreRing
                      value={predictions.attrition_risk.probability}
                      label={`Attrition risk (${predictions.attrition_risk.level})`}
                      color={predictions.attrition_risk.level === 'High' ? 'danger' : predictions.attrition_risk.level === 'Medium' ? 'warning' : 'success'}
                    />
                  )}
                  {predictions?.promotion_readiness && (
                    <ScoreRing
                      value={predictions.promotion_readiness.score}
                      label={`Promotion readiness (${predictions.promotion_readiness.status})`}
                      color="primary"
                    />
                  )}
                  {predictions?.skill_growth_trajectory && (
                    <ScoreRing
                      value={predictions.skill_growth_trajectory.score}
                      label={`Growth trajectory (${predictions.skill_growth_trajectory.status})`}
                      color={predictions.skill_growth_trajectory.status === 'Accelerating' ? 'success' : predictions.skill_growth_trajectory.status === 'Steady' ? 'primary' : 'warning'}
                    />
                  )}
                  {sk?.coverage_score !== undefined && (
                    <ScoreRing
                      value={sk.coverage_score}
                      label="Skill coverage"
                      color={sk.coverage_score > 65 ? 'success' : sk.coverage_score > 40 ? 'warning' : 'danger'}
                    />
                  )}
                </div>
              </div>
            )}

            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* Skill gap */}
              {sk && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 4 }}>Skill gap analysis</div>
                  <div className="card-subtitle" style={{ marginBottom: 16 }}>
                    Readiness: <strong>{sk.readiness_level}</strong> · Est. upskilling: <strong>{sk.estimated_upskilling_months} months</strong>
                  </div>

                  <ScoreBar label="Skill coverage" value={sk.coverage_score}
                    color={sk.coverage_score > 65 ? 'success' : sk.coverage_score > 40 ? 'warning' : 'danger'} />

                  <div style={{ marginTop: 16 }}>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
                       Skills you have ({sk.skill_count?.current ?? sk.matching_skills?.length ?? 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
                      {(sk.matching_skills || []).map(s => (
                        <span key={s} className="badge badge-approved" style={{ fontSize: 11 }}>{s}</span>
                      ))}
                      {(!sk.matching_skills || sk.matching_skills.length === 0) && (
                        <span className="text-muted" style={{ fontSize: 12 }}>None matched yet — add skills in your profile</span>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 8 }}>
                      ❌ Skills to develop ({sk.skill_count?.missing ?? sk.missing_skills?.length ?? 0})
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {(sk.missing_skills || []).map(s => (
                        <span key={s} className="badge badge-denied" style={{ fontSize: 11 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* HR predictions */}
              {predictions && (
                <div className="card">
                  <div className="card-title" style={{ marginBottom: 16 }}>HR predictions</div>
                  <ScoreBar label={`Attrition risk — ${predictions.attrition_risk.level}`}
                    value={predictions.attrition_risk.probability}
                    color={predictions.attrition_risk.level === 'High' ? 'danger' : predictions.attrition_risk.level === 'Medium' ? 'warning' : 'success'} />
                  <ScoreBar label={`Promotion readiness — ${predictions.promotion_readiness.status}`}
                    value={predictions.promotion_readiness.score} color="primary" />
                  <ScoreBar label={`Growth trajectory — ${predictions.skill_growth_trajectory.status}`}
                    value={predictions.skill_growth_trajectory.score}
                    color={predictions.skill_growth_trajectory.status === 'Accelerating' ? 'success' : 'primary'} />
                </div>
              )}
            </div>

            {/* Learning recommendations */}
            {sk?.recommendations?.length > 0 && (
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-title" style={{ marginBottom: 16 }}> Learning recommendations</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {sk.recommendations.map(rec => (
                    <div key={rec.skill} style={{
                      padding: 16, background: 'var(--gray-50)',
                      borderRadius: 10, border: '1px solid var(--gray-200)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span className={`badge ${rec.urgency === 'Critical' ? 'badge-denied' : rec.urgency === 'High' ? 'badge-pending' : 'badge-gray'}`}>
                          {rec.urgency}
                        </span>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{rec.skill}</span>
                      </div>
                      {rec.courses.map((c, i) => (
                        <div key={i} style={{ fontSize: 12, color: 'var(--gray-600)', lineHeight: 1.6 }}>
                          <div style={{ fontWeight: 500 }}>{c.certification}</div>
                          <div>{c.platform} · {c.duration}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>💡 Key insights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{
                      padding: '10px 16px', background: 'var(--primary-light)',
                      borderRadius: 8, fontSize: 14, color: 'var(--gray-800)',
                      borderLeft: '3px solid var(--primary)'
                    }}>
                      {ins}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}