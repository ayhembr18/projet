import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

function DeleteModal({ emp, onConfirm, onCancel, loading }) {
  if (!emp) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 24,
    }}>
      <div style={{
        background: 'white', borderRadius: 12, padding: 32,
        maxWidth: 420, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 8 }}>
          Remove employee?
        </div>
        <p style={{ fontSize: 14, color: 'var(--gray-600)', lineHeight: 1.6, marginBottom: 24 }}>
          You are about to permanently remove <strong>{emp.firstName} {emp.lastName}</strong>.
          Their account, profile, and all AI results will be deleted. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }}
            onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" style={{ flex: 1, justifyContent: 'center' }}
            onClick={onConfirm} disabled={loading}>
            {loading ? 'Removing...' : 'Yes, remove'}
          </button>
        </div>
      </div>
    </div>
  );
}

function exportCSV(employees) {
  const headers = ['First Name', 'Last Name', 'Email', 'Job Title', 'Department', 'Username',
    'Profile Complete', 'Attrition Risk %', 'Attrition Level', 'Promotion Score', 'Promotion Status', 'Skill Coverage %'];
  const rows = employees.map(e => {
    const hr = e.aiResults?.hrPredictions?.predictions;
    const sk = e.aiResults?.skillAnalysis;
    return [
      e.firstName, e.lastName, e.email, e.jobTitle, e.department, e.username,
      e.profileCompleted ? 'Yes' : 'No',
      hr?.attrition_risk?.probability ?? '',
      hr?.attrition_risk?.level ?? '',
      hr?.promotion_readiness?.score ?? '',
      hr?.promotion_readiness?.status ?? '',
      sk?.coverage_score ?? '',
    ];
  });
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `staff_export_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function EnterpriseStaff() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [empToDelete, setEmpToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    api.get('/enterprise/employees').then(res => {
      setEmployees(res.data.employees);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await api.delete(`/enterprise/employees/${empToDelete._id}`);
      setEmployees(prev => prev.filter(e => e._id !== empToDelete._id));
      setTotal(t => t - 1);
      setEmpToDelete(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  const departments = [...new Set(employees.map(e => e.department))].sort();

  const filtered = employees.filter(e => {
    const matchSearch = search === '' ||
      `${e.firstName} ${e.lastName} ${e.department} ${e.jobTitle}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === '' || e.department === deptFilter;
    return matchSearch && matchDept;
  });

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <DeleteModal
          emp={empToDelete}
          onConfirm={confirmDelete}
          onCancel={() => setEmpToDelete(null)}
          loading={deleteLoading}
        />

        <div className="page-actions">
          <div>
            <div className="page-title">Staff</div>
            <div className="page-subtitle">{total} employees</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-secondary" onClick={() => exportCSV(filtered)}
              title="Export current view to CSV">
              ⬇ Export CSV
            </button>
            <Link to="/enterprise/staff/add" className="btn btn-primary">+ Add employee</Link>
          </div>
        </div>

        <div className="card">
          {/* Filters row */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <input className="form-input" style={{ maxWidth: 280 }} placeholder="Search by name, title, department..."
              value={search} onChange={e => setSearch(e.target.value)} />
            <select className="form-select" style={{ maxWidth: 200 }}
              value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
              <option value="">All departments</option>
              {departments.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {(search || deptFilter) && (
              <button className="btn btn-secondary btn-sm"
                onClick={() => { setSearch(''); setDeptFilter(''); }}>
                ✕ Clear filters
              </button>
            )}
            {(search || deptFilter) && (
              <span className="text-muted" style={{ alignSelf: 'center', fontSize: 13 }}>
                {filtered.length} of {total} shown
              </span>
            )}
          </div>

          {loading ? <div className="text-muted">Loading...</div> :
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div>{search || deptFilter ? 'No results found' : 'No employees yet'}</div>
                {!search && !deptFilter && (
                  <Link to="/enterprise/staff/add" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                    Add first employee
                  </Link>
                )}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Username</th>
                      <th>Profile</th>
                      <th>Attrition risk</th>
                      <th>Promotion</th>
                      <th>Skill %</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(emp => {
                      const hr = emp.aiResults?.hrPredictions?.predictions;
                      const sk = emp.aiResults?.skillAnalysis;
                      return (
                        <tr key={emp._id}>
                          <td>
                            <div style={{ fontWeight: 500 }}>{emp.firstName} {emp.lastName}</div>
                            <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{emp.jobTitle}</div>
                          </td>
                          <td>{emp.department}</td>
                          <td><code style={{ fontSize: 12, background: 'var(--gray-100)', padding: '2px 6px', borderRadius: 4 }}>{emp.username}</code></td>
                          <td>
                            <span className={`badge ${emp.profileCompleted ? 'badge-approved' : 'badge-gray'}`}>
                              {emp.profileCompleted ? 'Complete' : 'Pending'}
                            </span>
                          </td>
                          <td>
                            {hr ? (
                              <span className={`badge badge-${hr.attrition_risk.level.toLowerCase()}`}>
                                {hr.attrition_risk.probability}%
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            {hr ? (
                              <span className={`badge ${hr.promotion_readiness.status === 'Ready' ? 'badge-approved' : hr.promotion_readiness.status === 'Developing' ? 'badge-pending' : 'badge-gray'}`}>
                                {hr.promotion_readiness.status}
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            {sk ? (
                              <span style={{ fontWeight: 600, fontSize: 13, color: sk.coverage_score > 65 ? 'var(--success)' : sk.coverage_score > 40 ? 'var(--warning)' : 'var(--danger)' }}>
                                {sk.coverage_score}%
                              </span>
                            ) : '—'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <Link to={`/enterprise/staff/${emp._id}`} className="btn btn-secondary btn-sm">View</Link>
                              <button className="btn btn-danger btn-sm" onClick={() => setEmpToDelete(emp)}>Remove</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </main>
    </div>
  );
}