import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function EnterpriseLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res = await api.post('/auth/enterprise/login', form);
      login(res.data.enterprise, res.data.token, 'enterprise');
      navigate('/enterprise/dashboard');
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
        <div className="auth-title">Enterprise sign in</div>
        <div className="auth-sub">Access your company dashboard</div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="jane@acme.com" required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              placeholder="Your password" required />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-link">Don't have an account? <Link to="/enterprise/register">Apply here</Link></div>
        <div className="auth-link" style={{ marginTop: 8 }}>
          Are you an employee? <Link to="/employee/login">Employee login</Link>
        </div>
      </div>
    </div>
  );
}