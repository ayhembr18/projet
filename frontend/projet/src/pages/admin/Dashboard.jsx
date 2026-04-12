import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

function StatCard({ value, label, variant = '' }) {
  return (
    <div className={`stat-card ${variant}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [allEnterprises, setAllEnterprises] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard'),
      api.get('/admin/enterprises?status=pending&limit=5'),
      api.get('/admin/enterprises?limit=100'),
    ]).then(([statsRes, pendingRes, allRes]) => {
      setStats(statsRes.data);
      setRecent(pendingRes.data.enterprises);
      setAllEnterprises(allRes.data.enterprises);
    }).finally(() => setLoading(false));
  }, []);

  // Compute platform-wide breakdown
  const industryCount = {};
  const sizeCount = {};
  allEnterprises.forEach(e => {
    industryCount[e.industry] = (industryCount[e.industry] || 0) + 1;
    sizeCount[e.companySize] = (sizeCount[e.companySize] || 0) + 1;
  });
  const topIndustries = Object.entries(industryCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const approvalRate = stats
    ? stats.totalEnterprises > 0
      ? Math.round((stats.approved / stats.totalEnterprises) * 100)
      : 0
    : null;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">Admin dashboard</div>
          <div className="page-subtitle">Platform overview</div>
        </div>

        {loading ? <div className="text-muted">Loading...</div> : (
          <>
            {/* Primary stats */}
            <div className="stats-grid">
              <StatCard value={stats?.totalEnterprises ?? 0} label="Total applications" />
              <StatCard value={stats?.pending ?? 0} label="Pending review" variant="warning" />
              <StatCard value={stats?.approved ?? 0} label="Approved" variant="success" />
              <StatCard value={stats?.denied ?? 0} label="Denied" variant="danger" />
              <StatCard value={stats?.totalEmployees ?? 0} label="Active employees" variant="primary" />
              {approvalRate !== null && (
                <StatCard value={`${approvalRate}%`} label="Approval rate" variant="success" />
              )}
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              {/* Industries breakdown */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Top industries</div>
                {topIndustries.length === 0 ? (
                  <div className="text-muted">No data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {topIndustries.map(([industry, count]) => {
                      const pct = Math.round((count / allEnterprises.length) * 100);
                      return (
                        <div key={industry}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: 'var(--gray-700)' }}>{industry}</span>
                            <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar primary" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Company size breakdown */}
              <div className="card">
                <div className="card-title" style={{ marginBottom: 16 }}>Company sizes</div>
                {Object.keys(sizeCount).length === 0 ? (
                  <div className="text-muted">No data yet</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {['1-10', '11-50', '51-200', '201-500', '500+'].filter(s => sizeCount[s]).map(size => {
                      const count = sizeCount[size] || 0;
                      const pct = Math.round((count / allEnterprises.length) * 100);
                      return (
                        <div key={size}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: 'var(--gray-700)' }}>{size} employees</span>
                            <span style={{ fontWeight: 600 }}>{count} ({pct}%)</span>
                          </div>
                          <div className="progress-bar-wrap">
                            <div className="progress-bar success" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pending applications table */}
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

            {/* Recently approved */}
            {allEnterprises.filter(e => e.status === 'approved').length > 0 && (
              <div className="card" style={{ marginTop: 20 }}>
                <div className="flex-between" style={{ marginBottom: 16 }}>
                  <div className="card-title">Recently approved</div>
                  <Link to="/admin/enterprises?status=approved" className="btn btn-secondary btn-sm">View all</Link>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Company</th>
                        <th>Industry</th>
                        <th>Country</th>
                        <th>Employees</th>
                        <th>Approved</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {allEnterprises.filter(e => e.status === 'approved').slice(0, 5).map(e => (
                        <tr key={e._id}>
                          <td><strong>{e.companyName}</strong></td>
                          <td>{e.industry}</td>
                          <td>{e.country}</td>
                          <td>{e.employeeCount ?? 0}</td>
                          <td>{e.approvedAt ? new Date(e.approvedAt).toLocaleDateString() : '—'}</td>
                          <td>
                            <Link to={`/admin/enterprises/${e._id}`} className="btn btn-secondary btn-sm">View</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}