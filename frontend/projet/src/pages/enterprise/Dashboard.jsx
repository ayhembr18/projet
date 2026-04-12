import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

function ScoreBar({ label, value, color = 'primary' }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
        <span style={{ color: 'var(--gray-600)' }}>{label}</span>
        <span style={{ fontWeight: 600 }}>{value}%</span>
      </div>
      <div className="progress-bar-wrap">
        <div className={`progress-bar ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}

export default function EnterpriseDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/enterprise/dashboard').then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  const stats = data?.stats;
  const employees = data?.employees || [];

  const analyzed = employees.filter(e => e.aiResults?.hrPredictions?.predictions);
  const avgAttrition = analyzed.length
    ? Math.round(analyzed.reduce((s, e) => s + (e.aiResults.hrPredictions.predictions?.attrition_risk?.probability || 0), 0) / analyzed.length)
    : null;
  const avgPromotion = analyzed.length
    ? Math.round(analyzed.reduce((s, e) => s + (e.aiResults.hrPredictions.predictions?.promotion_readiness?.score || 0), 0) / analyzed.length)
    : null;
  const skillAnalyzed = employees.filter(e => e.aiResults?.skillAnalysis?.coverage_score !== undefined);
  const avgCoverage = skillAnalyzed.length
    ? Math.round(skillAnalyzed.reduce((s, e) => s + (e.aiResults.skillAnalysis.coverage_score || 0), 0) / skillAnalyzed.length)
    : null;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">Welcome, {user?.companyName}</div>
          <div className="page-subtitle">Your workforce intelligence overview</div>
        </div>

        {loading ? <div className="text-muted">Loading...</div> : (
          <>
            <div className="stats-grid">
              <div className="stat-card primary"><div className="stat-value">{stats?.total ?? 0}</div><div className="stat-label">Total employees</div></div>
              <div className="stat-card success"><div className="stat-value">{stats?.profileCompleted ?? 0}</div><div className="stat-label">Profiles completed</div></div>
              <div className="stat-card"><div className="stat-value">{stats?.analyzed ?? 0}</div><div className="stat-label">AI analyzed</div></div>
              <div className="stat-card danger"><div className="stat-value">{stats?.highAttritionRisk ?? 0}</div><div className="stat-label">High attrition risk</div></div>
              <div className="stat-card success"><div className="stat-value">{stats?.promotionReady ?? 0}</div><div className="stat-label">Promotion ready</div></div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 4 }}>AI team summary</div>
                <div className="card-subtitle" style={{ marginBottom: 20 }}>
                  {analyzed.length > 0 ? `Based on ${analyzed.length} analyzed employees` : 'Run analysis on employees to see data'}
                </div>
                {analyzed.length === 0 ? (
                  <div className="empty-state" style={{ padding: 24 }}>
                    <div style={{ fontSize: 28, marginBottom: 8 }}></div>
                    <div style={{ fontSize: 14 }}>No analysis data yet.</div>
                    <div className="text-muted" style={{ marginTop: 4 }}>Add employees and have them complete their profiles to get AI insights.</div>
                  </div>
                ) : (
                  <>
                    {avgAttrition !== null && <ScoreBar label="Avg. attrition risk" value={avgAttrition} color={avgAttrition > 60 ? 'danger' : avgAttrition > 35 ? 'warning' : 'success'} />}
                    {avgPromotion !== null && <ScoreBar label="Avg. promotion readiness" value={avgPromotion} color="primary" />}
                    {avgCoverage !== null && <ScoreBar label="Avg. skill coverage" value={avgCoverage} color="success" />}
                  </>
                )}
              </div>
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Quick actions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <Link to="/enterprise/staff/add" className="btn btn-primary" style={{ justifyContent: 'center' }}>+ Add employee</Link>
                  <Link to="/enterprise/staff" className="btn btn-secondary" style={{ justifyContent: 'center' }}>View all staff</Link>
                </div>
                <hr className="divider" />
                <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.7 }}>
                  <strong style={{ color: 'var(--gray-700)' }}>How it works</strong><br />
                  Add employees &rarr; they receive login credentials &rarr; they fill their profile &rarr; AI analysis runs automatically.
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="card-title">Recent employees</div>
                <Link to="/enterprise/staff" className="btn btn-secondary btn-sm">View all</Link>
              </div>
              {employees.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">👥</div>
                  <div>No employees yet</div>
                  <Link to="/enterprise/staff/add" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Add first employee</Link>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Name</th><th>Department</th><th>Profile</th><th>Attrition risk</th><th>Promotion</th><th>Skill coverage</th><th></th></tr></thead>
                    <tbody>
                      {employees.slice(0, 10).map(emp => {
                        const hr = emp.aiResults?.hrPredictions?.predictions;
                        const sk = emp.aiResults?.skillAnalysis;
                        return (
                          <tr key={emp._id}>
                            <td><div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div><div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{emp.jobTitle}</div></td>
                            <td>{emp.department}</td>
                            <td><span className={`badge ${emp.profileCompleted ? 'badge-approved' : 'badge-gray'}`}>{emp.profileCompleted ? 'Complete' : 'Pending'}</span></td>
                            <td>{hr ? <span className={`badge badge-${hr.attrition_risk.level.toLowerCase()}`}>{hr.attrition_risk.probability}% {hr.attrition_risk.level}</span> : <span className="text-muted">—</span>}</td>
                            <td>{hr ? <span className={`badge ${hr.promotion_readiness.status === 'Ready' ? 'badge-approved' : hr.promotion_readiness.status === 'Developing' ? 'badge-pending' : 'badge-gray'}`}>{hr.promotion_readiness.status}</span> : <span className="text-muted">—</span>}</td>
                            <td>{sk ? <span style={{ fontSize: 13, fontWeight: 600, color: sk.coverage_score > 65 ? 'var(--success)' : sk.coverage_score > 40 ? 'var(--warning)' : 'var(--danger)' }}>{sk.coverage_score}%</span> : <span className="text-muted">—</span>}</td>
                            <td><Link to={`/enterprise/staff/${emp._id}`} className="btn btn-secondary btn-sm">View</Link></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}