import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function StepIndicator({ steps }) {
  return (
    <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
          {/* connector line */}
          {i < steps.length - 1 && (
            <div style={{
              position: 'absolute', top: 16, left: '50%', width: '100%', height: 2,
              background: step.done ? 'var(--primary)' : 'var(--gray-200)', zIndex: 0,
            }} />
          )}
          <div style={{
            width: 32, height: 32, borderRadius: '50%', zIndex: 1,
            background: step.done ? 'var(--primary)' : step.active ? 'var(--primary-light)' : 'var(--gray-100)',
            border: `2px solid ${step.done ? 'var(--primary)' : step.active ? 'var(--primary)' : 'var(--gray-200)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700,
            color: step.done ? 'white' : step.active ? 'var(--primary)' : 'var(--gray-400)',
          }}>
            {step.done ? '✓' : i + 1}
          </div>
          <div style={{ fontSize: 12, marginTop: 6, fontWeight: step.active ? 600 : 400,
            color: step.done ? 'var(--primary)' : step.active ? 'var(--gray-800)' : 'var(--gray-400)',
            textAlign: 'center', maxWidth: 80 }}>
            {step.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzeMsg, setAnalyzeMsg] = useState('');
  const [analyzeError, setAnalyzeError] = useState('');

  useEffect(() => {
    api.get('/employee/me')
      .then(res => setEmployee(res.data.employee))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (employee?.mustChangePassword) navigate('/employee/profile');
  }, [employee, navigate]);

  const handleAnalyze = async () => {
    setAnalyzing(true); setAnalyzeMsg(''); setAnalyzeError('');
    try {
      const res = await api.post('/employee/analyze');
      setAnalyzeMsg(res.data.message || 'Analysis complete!');
      const updated = await api.get('/employee/me');
      setEmployee(updated.data.employee);
    } catch (err) {
      setAnalyzeError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) return (
    <div className="layout"><Sidebar />
      <main className="main"><div className="text-muted">Loading...</div></main>
    </div>
  );

  const hr = employee?.aiResults?.hrPredictions?.predictions;
  const sk = employee?.aiResults?.skillAnalysis;
  const hasHrProfile = !!employee?.profileCompleted;
  const hasSkillProfile = !!employee?.skillProfile?.role;
  const hasAnalysis = !!(hr || sk);
  const profileComplete = hasHrProfile && hasSkillProfile;

  // Stale analysis: older than 30 days
  const analyzedAt = employee?.aiResults?.analyzedAt;
  const isStale = analyzedAt && ((Date.now() - new Date(analyzedAt)) / (1000 * 60 * 60 * 24)) > 30;

  const steps = [
    { label: 'HR Profile', done: hasHrProfile, active: !hasHrProfile },
    { label: 'Skill Profile', done: hasSkillProfile, active: hasHrProfile && !hasSkillProfile },
    { label: 'Run Analysis', done: hasAnalysis, active: profileComplete && !hasAnalysis },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">Welcome, {employee?.firstName} {employee?.lastName}</div>
          <div className="page-subtitle">{employee?.jobTitle} · {employee?.department}</div>
        </div>

        {/* Setup progress */}
        {!hasAnalysis && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>Getting started</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Complete these steps to unlock your AI insights</div>
            <StepIndicator steps={steps} />
            {!hasHrProfile && (
              <Link to="/employee/profile" className="btn btn-primary btn-sm">
                → Fill in HR Profile
              </Link>
            )}
            {hasHrProfile && !hasSkillProfile && (
              <Link to="/employee/profile" className="btn btn-primary btn-sm">
                → Fill in Skill Profile
              </Link>
            )}
            {profileComplete && !hasAnalysis && (
              <button className="btn btn-primary btn-sm" onClick={handleAnalyze} disabled={analyzing}>
                {analyzing ? 'Analyzing...' : '→ Run your first analysis'}
              </button>
            )}
          </div>
        )}

        {/* Stale analysis warning */}
        {isStale && (
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
            ⏰ Your last analysis was on <strong>{new Date(analyzedAt).toLocaleDateString()}</strong> — over 30 days ago.
            Re-run it to keep your insights up to date.
          </div>
        )}

        {analyzeMsg && <div className="alert alert-success">{analyzeMsg}</div>}
        {analyzeError && <div className="alert alert-error">{analyzeError}</div>}

        {/* Stats row */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className={`stat-card ${hasHrProfile ? 'success' : ''}`}>
            <div className="stat-value">{hasHrProfile ? '✓' : '✗'}</div>
            <div className="stat-label">HR Profile</div>
          </div>
          <div className={`stat-card ${hasSkillProfile ? 'success' : ''}`}>
            <div className="stat-value">{hasSkillProfile ? '✓' : '✗'}</div>
            <div className="stat-label">Skill Profile</div>
          </div>
          <div className={`stat-card ${hr ? 'primary' : ''}`}>
            <div className="stat-value">{hr ? hr.promotion_readiness.score + '%' : '—'}</div>
            <div className="stat-label">Promotion Score</div>
          </div>
          <div className={`stat-card ${sk ? 'success' : ''}`}>
            <div className="stat-value">{sk ? sk.coverage_score + '%' : '—'}</div>
            <div className="stat-label">Skill Coverage</div>
          </div>
          <div className={`stat-card ${hr ? (hr.attrition_risk.level === 'Low' ? 'success' : hr.attrition_risk.level === 'Medium' ? 'warning' : 'danger') : ''}`}>
            <div className="stat-value">{hr ? hr.attrition_risk.probability + '%' : '—'}</div>
            <div className="stat-label">Attrition Risk</div>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Quick actions */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button className="btn btn-primary" style={{ justifyContent: 'center' }}
                onClick={handleAnalyze} disabled={analyzing || !profileComplete}>
                {analyzing ? 'Running analysis...' : '🤖 Run AI Analysis'}
              </button>
              <Link to="/employee/profile" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                ✏️ Edit my profiles
              </Link>
              <Link to="/employee/results" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                📊 View full results
              </Link>
            </div>
            {!profileComplete && (
              <div className="text-muted" style={{ marginTop: 12, fontSize: 12 }}>
                Complete both HR and skill profiles to enable analysis.
              </div>
            )}
          </div>

          {/* AI snapshot */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>AI snapshot</div>
            <div className="card-subtitle" style={{ marginBottom: 16 }}>
              {analyzedAt
                ? `Last analyzed ${new Date(analyzedAt).toLocaleDateString()}`
                : 'No analysis run yet'}
            </div>
            {hr ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Promotion readiness</span>
                  <span className={`badge ${hr.promotion_readiness.status === 'Ready' ? 'badge-approved' : hr.promotion_readiness.status === 'Ready Soon' ? 'badge-pending' : 'badge-gray'}`}>
                    {hr.promotion_readiness.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Growth trajectory</span>
                  <span className={`badge ${hr.skill_growth_trajectory.status === 'Accelerating' ? 'badge-approved' : 'badge-gray'}`}>
                    {hr.skill_growth_trajectory.status}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Attrition risk</span>
                  <span className={`badge badge-${hr.attrition_risk.level.toLowerCase()}`}>
                    {hr.attrition_risk.level}
                  </span>
                </div>
                {sk && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Skill readiness</span>
                    <span className="badge badge-primary">{sk.readiness_level}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 20 }}>
                <div style={{ fontSize: 13, marginTop: 8 }}>Run analysis to see your AI insights</div>
              </div>
            )}
          </div>
        </div>

        {/* Insights */}
        {employee?.aiResults?.hrPredictions?.insights?.length > 0 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>💡 Key insights</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {employee.aiResults.hrPredictions.insights.map((ins, i) => (
                <div key={i} style={{
                  padding: '10px 14px', background: 'var(--gray-50)',
                  borderRadius: 8, fontSize: 14, color: 'var(--gray-700)',
                  borderLeft: '3px solid var(--primary)'
                }}>
                  {ins}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}