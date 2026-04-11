import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function EmployeeLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/employee/login', form);
      login(res.data.employee, res.data.token, 'employee');
      navigate('/employee/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" style={{ color: 'var(--gray-400)', textDecoration: 'none', fontSize: 13 }}>← Home</Link>
        <div className="auth-logo" style={{ marginTop: 12 }}>HRPlatform</div>
        <div className="auth-title">Employee sign in</div>
        <div className="auth-sub">Use the credentials sent by your company</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              placeholder="firstname.lastname.1234" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your temporary password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-link">
          Are you an enterprise manager? <Link to="/enterprise/login">Enterprise login</Link>
        </div>
      </div>
    </div>
  );
}

export function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/admin/login', form);
      login(res.data.admin, res.data.token, 'platform_admin');
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" style={{ color: 'var(--gray-400)', textDecoration: 'none', fontSize: 13 }}>← Home</Link>
        <div className="auth-logo" style={{ marginTop: 12 }}>HRPlatform</div>
        <div className="auth-title">Platform admin</div>
        <div className="auth-sub">Restricted access</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="admin@platform.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Admin password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default EmployeeLogin;