import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Education', 'Consulting', 'Media', 'Energy', 'Other'];
const SIZES = ['1-10', '11-50', '51-200', '201-500', '500+'];

export default function EnterpriseRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    companyName: '', industry: '', companySize: '', country: '',
    address: '', website: '', description: '',
    contactName: '', contactTitle: '', email: '', phone: '',
    password: '', confirmPassword: '',
  });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match'); return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters'); return;
    }
    setLoading(true); setError('');
    try {
      await api.post('/auth/enterprise/register', form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Application submitted!</h2>
          <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>
            Your application is under review. We'll notify you at <strong>{form.email}</strong> once a decision is made.
            You can also check your status on the login page.
          </p>
          <Link to="/enterprise/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            Go to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" style={{ alignItems: 'flex-start', paddingTop: 40 }}>
      <div style={{ width: '100%', maxWidth: 680 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: 14 }}>← Back to home</Link>
          <div className="auth-logo" style={{ marginTop: 12 }}>HRPlatform</div>
          <h1 className="auth-title">Register your company</h1>
          <div className="auth-sub">Fill in your details to apply for access</div>

          {/* Step indicator */}
          <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1 }}>
                <div style={{ height: 4, borderRadius: 2, background: s <= step ? 'var(--primary)' : 'var(--gray-200)', transition: 'background 0.3s' }} />
                <div style={{ fontSize: 11, color: s <= step ? 'var(--primary)' : 'var(--gray-400)', marginTop: 4, fontWeight: 500 }}>
                  {['Company info', 'Contact', 'Account'][s - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ maxWidth: '100%' }}>
          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Company name *</label>
                  <input className="form-input" value={form.companyName} onChange={e => set('companyName', e.target.value)} placeholder="Acme Corp" />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry *</label>
                  <select className="form-select" value={form.industry} onChange={e => set('industry', e.target.value)}>
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Company size *</label>
                  <select className="form-select" value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                    <option value="">Select size</option>
                    {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Country *</label>
                  <input className="form-input" value={form.country} onChange={e => set('country', e.target.value)} placeholder="Tunisia" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Business St, Tunis" />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Website</label>
                  <input className="form-input" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://acme.com" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Company description</label>
                <textarea className="form-textarea" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of your company and what you do..." />
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
                disabled={!form.companyName || !form.industry || !form.companySize || !form.country || !form.address}
                onClick={() => { setError(''); setStep(2); }}>
                Next: Contact info →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Your full name *</label>
                  <input className="form-input" value={form.contactName} onChange={e => set('contactName', e.target.value)} placeholder="Jane Smith" />
                </div>
                <div className="form-group">
                  <label className="form-label">Your title</label>
                  <input className="form-input" value={form.contactTitle} onChange={e => set('contactTitle', e.target.value)} placeholder="HR Director" />
                </div>
                <div className="form-group">
                  <label className="form-label">Work email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+216 XX XXX XXX" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  disabled={!form.contactName || !form.email}
                  onClick={() => { setError(''); setStep(3); }}>
                  Next: Set password →
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="form-group">
                <label className="form-label">Password *</label>
                <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="Min. 8 characters" />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm password *</label>
                <input className="form-input" type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="Repeat password" />
              </div>
              <div className="alert alert-info" style={{ fontSize: 13 }}>
                After submission, our team will review your application. You'll receive an approval decision before being able to log in.
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setStep(2)}>← Back</button>
                <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }}
                  disabled={!form.password || !form.confirmPassword || loading}
                  onClick={handleSubmit}>
                  {loading ? 'Submitting...' : 'Submit application'}
                </button>
              </div>
            </>
          )}
        </div>

        <div className="auth-link">Already approved? <Link to="/enterprise/login">Sign in</Link></div>
      </div>
    </div>
  );
}