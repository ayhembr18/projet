import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'denied'];

export default function AdminEnterprises() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = searchParams.get('status') || 'all';

  const [enterprises, setEnterprises] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
    api.get(`/admin/enterprises${params}`).then(res => {
      setEnterprises(res.data.enterprises);
      setTotal(res.data.total);
    }).finally(() => setLoading(false));
  }, [statusFilter]);

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">Enterprise applications</div>
          <div className="page-subtitle">{total} total applications</div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {STATUS_FILTERS.map(s => (
            <button key={s} className={`btn btn-sm ${statusFilter === s ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setSearchParams(s === 'all' ? {} : { status: s })}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="card">
          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : enterprises.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🏢</div>
              <div>No enterprises found</div>
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
                    <th>Country</th>
                    <th>Applied</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {enterprises.map(e => (
                    <tr key={e._id}>
                      <td><strong>{e.companyName}</strong></td>
                      <td>{e.industry}</td>
                      <td>{e.companySize}</td>
                      <td>
                        <div>{e.contactName}</div>
                        <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{e.email}</div>
                      </td>
                      <td>{e.country}</td>
                      <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                      <td><span className={`badge badge-${e.status}`}>{e.status}</span></td>
                      <td>
                        <Link to={`/admin/enterprises/${e._id}`} className="btn btn-secondary btn-sm">
                          {e.status === 'pending' ? 'Review' : 'View'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}