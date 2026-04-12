import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

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

  // Redirect to change-password if required
  useEffect(() => {
    if (employee?.mustChangePassword) {
      navigate('/employee/profile');
    }
  }, [employee, navigate]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalyzeMsg('');
    setAnalyzeError('');
    try {
      const res = await api.post('/employee/analyze');
      setAnalyzeMsg(res.data.message || 'Analysis complete!');
      // Refresh employee data to show updated results
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
  const profileComplete = employee?.profileCompleted && employee?.skillProfile?.role;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">
            Welcome, {employee?.firstName} {employee?.lastName}
          </div>
          <div className="page-subtitle">{employee?.jobTitle} · {employee?.department}</div>
        </div>

        {/* Profile completion status */}
        {!profileComplete && (
          <div className="alert alert-warning" style={{ marginBottom: 20 }}>
             Your profile is incomplete. Please fill in your{' '}
            <Link to="/employee/profile" style={{ fontWeight: 600 }}>HR and skill profiles</Link>
            {' '}before running an analysis.
          </div>
        )}

        {analyzeMsg && <div className="alert alert-success">{analyzeMsg}</div>}
        {analyzeError && <div className="alert alert-error">{analyzeError}</div>}

        {/* Stats row */}
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          <div className={`stat-card ${employee?.profileCompleted ? 'success' : ''}`}>
            <div className="stat-value">{employee?.profileCompleted ? '✓' : '✗'}</div>
            <div className="stat-label">HR Profile</div>
          </div>
          <div className={`stat-card ${employee?.skillProfile?.role ? 'success' : ''}`}>
            <div className="stat-value">{employee?.skillProfile?.role ? '✓' : '✗'}</div>
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
              <button
                className="btn btn-primary"
                style={{ justifyContent: 'center' }}
                onClick={handleAnalyze}
                disabled={analyzing || !profileComplete}
              >
                {analyzing ? 'Running analysis...' : ' Run AI Analysis'}
              </button>
              <Link to="/employee/profile" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                 Edit my profiles
              </Link>
              <Link to="/employee/results" className="btn btn-secondary" style={{ justifyContent: 'center' }}>
                 View full results
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
              {employee?.aiResults?.analyzedAt
                ? `Last analyzed ${new Date(employee.aiResults.analyzedAt).toLocaleDateString()}`
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
            <div className="card-title" style={{ marginBottom: 16 }}>Key insights</div>
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