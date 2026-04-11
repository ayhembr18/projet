import { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

const DEPARTMENTS = ['Engineering', 'Sales', 'HR', 'Finance', 'Marketing', 'Data Science', 'Operations', 'Legal', 'Product', 'Other'];

export default function EnterpriseAddEmployee() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', jobTitle: '', department: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/enterprise/employees', form);
      setResult(res.data.employee);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add employee');
    } finally {
      setLoading(false);
    }
  };

  const credText = result ? `Username: ${result.credentials.username}\nTemporary password: ${result.credentials.temporaryPassword}\nLogin URL: ${result.credentials.loginUrl}` : '';

  const copy = () => {
    navigator.clipboard.writeText(credText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addAnother = () => {
    setResult(null);
    setForm({ firstName: '', lastName: '', email: '', jobTitle: '', department: '' });
  };

  if (result) {
    return (
      <div className="layout">
        <Sidebar />
        <main className="main" style={{ maxWidth: 600 }}>
          <div className="page-header">
            <div className="page-title">Employee added!</div>
          </div>

          <div className="card" style={{ borderColor: 'var(--success)', borderWidth: 1.5 }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
            <div className="card-title" style={{ marginBottom: 4 }}>
              {result.firstName} {result.lastName} has been added
            </div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>
              Send these credentials to the employee so they can log in.
            </div>

            <div className="credential-box" style={{ marginBottom: 16 }}>
              <div><span className="key">Username:</span>   <span className="value">{result.credentials.username}</span></div>
              <div><span className="key">Password:</span>   <span className="value">{result.credentials.temporaryPassword}</span></div>
              <div><span className="key">Login URL:</span>  <span className="value">{result.credentials.loginUrl}</span></div>
            </div>

            <div className="alert alert-warning" style={{ fontSize: 13, marginBottom: 20 }}>
              ⚠️ This password is shown <strong>only once</strong>. Copy and send it to the employee now. They will be prompted to change it on first login.
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-secondary" onClick={copy} style={{ flex: 1, justifyContent: 'center' }}>
                {copied ? '✓ Copied!' : 'Copy credentials'}
              </button>
              <button className="btn btn-primary" onClick={addAnother} style={{ flex: 1, justifyContent: 'center' }}>
                Add another employee
              </button>
            </div>

            <Link to="/enterprise/staff" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 10 }}>
              View all staff
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="layout">
      <Sidebar />
      <main className="main" style={{ maxWidth: 640 }}>
        <div style={{ marginBottom: 20 }}>
          <Link to="/enterprise/staff" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>← Back to staff</Link>
        </div>

        <div className="page-header">
          <div className="page-title">Add employee</div>
          <div className="page-subtitle">Login credentials will be generated automatically</div>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">First name *</label>
                <input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} placeholder="Jane" required />
              </div>
              <div className="form-group">
                <label className="form-label">Last name *</label>
                <input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} placeholder="Smith" required />
              </div>
              <div className="form-group">
                <label className="form-label">Work email *</label>
                <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@company.com" required />
              </div>
              <div className="form-group">
                <label className="form-label">Job title *</label>
                <input className="form-input" value={form.jobTitle} onChange={e => set('jobTitle', e.target.value)} placeholder="Software Engineer" required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department *</label>
              <select className="form-select" value={form.department} onChange={e => set('department', e.target.value)} required>
                <option value="">Select department</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="alert alert-info" style={{ fontSize: 13, marginBottom: 16 }}>
              A username (e.g. <code>jane.smith.4821</code>) and a temporary password will be generated. Send these to the employee so they can access their portal.
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? 'Adding employee...' : 'Add employee & generate credentials'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}