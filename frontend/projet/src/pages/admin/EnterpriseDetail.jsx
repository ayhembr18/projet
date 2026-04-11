import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

export default function AdminEnterpriseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/admin/enterprises/${id}`).then(res => setData(res.data)).finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action) => {
    setActionLoading(true); setMsg('');
    try {
      await api.patch(`/admin/enterprises/${id}/${action}`, { note });
      setMsg(action === 'approve' ? 'Enterprise approved successfully.' : 'Enterprise denied.');
      // Refresh
      const res = await api.get(`/admin/enterprises/${id}`);
      setData(res.data);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="layout"><Sidebar /><main className="main"><div className="text-muted">Loading...</div></main></div>;
  if (!data) return null;

  const { enterprise, employees } = data;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div style={{ marginBottom: 20 }}>
          <Link to="/admin/enterprises" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>
            ← Back to applications
          </Link>
        </div>

        <div className="flex-between" style={{ marginBottom: 24 }}>
          <div>
            <div className="page-title">{enterprise.companyName}</div>
            <div style={{ marginTop: 4, display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className={`badge badge-${enterprise.status}`}>{enterprise.status}</span>
              <span className="text-muted">{enterprise.industry} · {enterprise.companySize} employees · {enterprise.country}</span>
            </div>
          </div>
        </div>

        {msg && <div className={`alert ${msg.includes('denied') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

        <div className="grid-2" style={{ marginBottom: 20 }}>
          {/* Company details */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Company information</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Company', enterprise.companyName],
                ['Industry', enterprise.industry],
                ['Size', enterprise.companySize + ' employees'],
                ['Country', enterprise.country],
                ['Address', enterprise.address],
                ['Website', enterprise.website || '—'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)', minWidth: 80 }}>{k}</span>
                  <span style={{ fontSize: 14, color: 'var(--gray-800)' }}>{v}</span>
                </div>
              ))}
              {enterprise.description && (
                <div>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 4 }}>Description</div>
                  <div style={{ fontSize: 14, color: 'var(--gray-700)', lineHeight: 1.6 }}>{enterprise.description}</div>
                </div>
              )}
            </div>
          </div>

          {/* Contact details */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Contact person</div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                ['Name', enterprise.contactName],
                ['Title', enterprise.contactTitle || '—'],
                ['Email', enterprise.email],
                ['Phone', enterprise.phone || '—'],
                ['Applied', new Date(enterprise.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--gray-500)', minWidth: 80 }}>{k}</span>
                  <span style={{ fontSize: 14, color: 'var(--gray-800)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Admin note */}
            {enterprise.adminNote && (
              <div style={{ marginTop: 16, padding: 12, background: 'var(--gray-50)', borderRadius: 6 }}>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginBottom: 4 }}>Admin note</div>
                <div style={{ fontSize: 14 }}>{enterprise.adminNote}</div>
              </div>
            )}
          </div>
        </div>

        {/* Action panel — only show if pending */}
        {enterprise.status === 'pending' && (
          <div className="card" style={{ marginBottom: 20, borderColor: 'var(--warning)', borderWidth: 1.5 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>Review application</div>
            <div className="card-subtitle" style={{ marginBottom: 16 }}>Add an optional note before approving or denying.</div>
            <div className="form-group">
              <label className="form-label">Note (optional)</label>
              <textarea className="form-textarea" rows={2} placeholder="e.g. Documents verified, approved. / Missing company registration documents."
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-success" disabled={actionLoading} onClick={() => handleAction('approve')} style={{ flex: 1, justifyContent: 'center' }}>
                {actionLoading ? '...' : '✓ Approve'}
              </button>
              <button className="btn btn-danger" disabled={actionLoading} onClick={() => handleAction('deny')} style={{ flex: 1, justifyContent: 'center' }}>
                {actionLoading ? '...' : '✗ Deny'}
              </button>
            </div>
          </div>
        )}

        {/* Employees table (only relevant if approved) */}
        {employees.length > 0 && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 16 }}>Employees ({employees.length})</div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Department</th>
                    <th>Profile</th>
                    <th>Analyzed</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map(emp => (
                    <tr key={emp._id}>
                      <td>{emp.firstName} {emp.lastName}</td>
                      <td><code style={{ fontSize: 12 }}>{emp.username}</code></td>
                      <td>{emp.department}</td>
                      <td>
                        <span className={`badge ${emp.profileCompleted ? 'badge-approved' : 'badge-gray'}`}>
                          {emp.profileCompleted ? 'Complete' : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${emp.aiResults?.skillAnalysis ? 'badge-primary' : 'badge-gray'}`}>
                          {emp.aiResults?.skillAnalysis ? 'Done' : 'Not yet'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}