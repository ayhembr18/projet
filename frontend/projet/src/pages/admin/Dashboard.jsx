import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/enterprises?status=pending&limit=5'),
    ]).then(([statsRes, pendingRes]) => {
      setStats(statsRes.data);
      setRecent(pendingRes.data.enterprises);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">Admin dashboard</div>
          <div className="page-subtitle">Overview of all enterprise applications</div>
        </div>

        {loading ? (
          <div className="text-muted">Loading...</div>
        ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{stats?.totalEnterprises ?? 0}</div>
                <div className="stat-label">Total applications</div>
              </div>
              <div className="stat-card warning">
                <div className="stat-value">{stats?.pending ?? 0}</div>
                <div className="stat-label">Pending review</div>
              </div>
              <div className="stat-card success">
                <div className="stat-value">{stats?.approved ?? 0}</div>
                <div className="stat-label">Approved</div>
              </div>
              <div className="stat-card danger">
                <div className="stat-value">{stats?.denied ?? 0}</div>
                <div className="stat-label">Denied</div>
              </div>
              <div className="stat-card primary">
                <div className="stat-value">{stats?.totalEmployees ?? 0}</div>
                <div className="stat-label">Total employees</div>
              </div>
            </div>

            <div className="card">
              <div className="flex-between" style={{ marginBottom: 16 }}>
                <div className="card-title">Pending applications</div>
                <Link to="/admin/enterprises?status=pending" className="btn btn-secondary btn-sm">View all</Link>
              </div>

              {recent.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">✅</div>
                  <div>No pending applications</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Industry</th>
                        <th>Size</th>
                        <th>Contact</th>
                        <th>Applied</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map(e => (
                        <tr key={e._id}>
                          <td><strong>{e.companyName}</strong></td>
                          <td>{e.industry}</td>
                          <td>{e.companySize}</td>
                          <td>{e.contactName}</td>
                          <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                          <td>
                            <Link to={`/admin/enterprises/${e._id}`} className="btn btn-secondary btn-sm">
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
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