import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

function ScoreRing({ value, color, label, size = 72 }) {
  const r = 28; const circ = 2 * Math.PI * r;
  const fill = circ - (value / 100) * circ;
  const strokeColor = color === 'danger' ? 'var(--danger)' : color === 'warning' ? 'var(--warning)' : color === 'success' ? 'var(--success)' : 'var(--primary)';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--gray-100)" strokeWidth="6" />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={fill}
          transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="round" />
        <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="700" fill={strokeColor}>{value}%</text>
      </svg>
      <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

export default function EnterpriseEmployeeDetail() {
  const { id } = useParams();
  const [emp, setEmp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState(null);

  useEffect(() => {
    api.get(`/enterprise/employees/${id}`).then(res => setEmp(res.data.employee)).finally(() => setLoading(false));
  }, [id]);

  const handleReset = async () => {
    if (!confirm('Reset credentials for this employee?')) return;
    setResetLoading(true);
    try {
      const res = await api.post(`/enterprise/employees/${id}/reset-credentials`);
      setResetResult(res.data.credentials);
    } catch (err) {
      alert(err.response?.data?.message || 'Reset failed');
    } finally {
      setResetLoading(false);
    }
  };

  if (loading) return <div className="layout"><Sidebar /><main className="main"><div className="text-muted">Loading...</div></main></div>;
  if (!emp) return null;

  const hr = emp.aiResults?.hrPredictions?.predictions;
  const sk = emp.aiResults?.skillAnalysis;
  const insights = emp.aiResults?.hrPredictions?.insights || [];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div style={{ marginBottom: 20 }}>
          <Link to="/enterprise/staff" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>← Back to staff</Link>
        </div>

        {/* Header */}
        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <div className="page-title">{emp.firstName} {emp.lastName}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="badge badge-primary">{emp.jobTitle}</span>
              <span className="badge badge-gray">{emp.department}</span>
              <span className={`badge ${emp.profileCompleted ? 'badge-approved' : 'badge-gray'}`}>
                {emp.profileCompleted ? 'Profile complete' : 'Profile pending'}
              </span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={handleReset} disabled={resetLoading}>
            {resetLoading ? 'Resetting...' : 'Reset credentials'}
          </button>
        </div>

        {resetResult && (
          <div className="alert alert-warning" style={{ marginBottom: 16 }}>
            New credentials — username: <strong>{resetResult.username}</strong> · password: <strong>{resetResult.temporaryPassword}</strong>
          </div>
        )}

        {/* AI scores row */}
        {(hr || sk) && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title" style={{ marginBottom: 20 }}>AI analysis</div>
            <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {hr && <>
                <ScoreRing value={hr.attrition_risk.probability} label={`Attrition (${hr.attrition_risk.level})`}
                  color={hr.attrition_risk.level === 'High' ? 'danger' : hr.attrition_risk.level === 'Medium' ? 'warning' : 'success'} />
                <ScoreRing value={hr.promotion_readiness.score} label={`Promotion (${hr.promotion_readiness.status})`} color="primary" />
                <ScoreRing value={hr.skill_growth_trajectory.score} label={`Growth (${hr.skill_growth_trajectory.status})`}
                  color={hr.skill_growth_trajectory.status === 'Accelerating' ? 'success' : hr.skill_growth_trajectory.status === 'Steady' ? 'primary' : 'warning'} />
              </>}
              {sk && <>
                <ScoreRing value={Math.round(sk.coverage_score)} label={`Skill coverage`}
                  color={sk.coverage_score > 65 ? 'success' : sk.coverage_score > 40 ? 'warning' : 'danger'} />
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--gray-800)', lineHeight: 1, marginTop: 16 }}>{sk.readiness_level}</div>
                  <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 4 }}>Readiness level</div>
                </div>
              </>}
            </div>

            {insights.length > 0 && (
              <div style={{ marginTop: 20, borderTop: '1px solid var(--gray-100)', paddingTop: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: 'var(--gray-700)' }}>Key insights</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {insights.map((ins, i) => (
                    <div key={i} style={{ fontSize: 13, color: 'var(--gray-600)', padding: '6px 10px', background: 'var(--gray-50)', borderRadius: 6 }}>{ins}</div>
                  ))}
                </div>
              </div>
            )}

            {emp.aiResults?.analyzedAt && (
              <div className="text-muted" style={{ marginTop: 12, fontSize: 12 }}>
                Analyzed {new Date(emp.aiResults.analyzedAt).toLocaleString()}
              </div>
            )}
          </div>
        )}

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Skill gap details */}
          {sk && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Skill gap details</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Current skills ({sk.skill_count.current})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sk.matching_skills.map(s => <span key={s} className="badge badge-approved" style={{ fontSize: 11 }}>{s}</span>)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 6 }}>Missing skills ({sk.skill_count.missing})</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {sk.missing_skills.map(s => <span key={s} className="badge badge-denied" style={{ fontSize: 11 }}>{s}</span>)}
                </div>
              </div>
              <div className="text-muted" style={{ marginTop: 12 }}>
                Est. upskilling: <strong>{sk.estimated_upskilling_months} months</strong>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {sk?.recommendations?.length > 0 && (
            <div className="card">
              <div className="card-title" style={{ marginBottom: 16 }}>Learning recommendations</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {sk.recommendations.slice(0, 4).map(rec => (
                  <div key={rec.skill} style={{ padding: 12, background: 'var(--gray-50)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span className={`badge ${rec.urgency === 'Critical' ? 'badge-denied' : rec.urgency === 'High' ? 'badge-pending' : 'badge-gray'}`}>
                        {rec.urgency}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{rec.skill}</span>
                    </div>
                    {rec.courses.slice(0, 1).map(c => (
                      <div key={c.certification} style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                        {c.certification} · {c.platform} · {c.duration}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Employee contact info */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 16 }}>Contact & credentials</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              ['Email', emp.email],
              ['Username', emp.username],
              ['Job title', emp.jobTitle],
              ['Department', emp.department],
              ['Added', new Date(emp.createdAt).toLocaleDateString()],
              ['Must change password', emp.mustChangePassword ? 'Yes' : 'No'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{k}</div>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}