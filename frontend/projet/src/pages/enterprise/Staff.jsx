import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

export default function EnterpriseStaff() {
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/enterprise/employees').then(res => {
      setEmployees(res.data.employees);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (emp) => {
    if (!confirm(`Permanently remove ${emp.firstName} ${emp.lastName}? This cannot be undone.`)) return;
    try {
      await api.delete(`/enterprise/employees/${emp._id}`);
      setEmployees(prev => prev.filter(e => e._id !== emp._id));
      setTotal(t => t - 1);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove employee');
    }
  };

  const filtered = employees.filter(e =>
    search === '' ||
    `${e.firstName} ${e.lastName} ${e.department} ${e.jobTitle}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-actions">
          <div>
            <div className="page-title">Staff</div>
            <div className="page-subtitle">{total} employees</div>
          </div>
          <Link to="/enterprise/staff/add" className="btn btn-primary">+ Add employee</Link>
        </div>

        <div className="card">
          <div style={{ marginBottom: 16 }}>
            <input className="form-input" style={{ maxWidth: 320 }} placeholder="Search employees..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          {loading ? <div className="text-muted">Loading...</div> :
            filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <div>{search ? 'No results found' : 'No employees yet'}</div>
                {!search && <Link to="/enterprise/staff/add" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>Add first employee</Link>}
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
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp)}>Remove</button>
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