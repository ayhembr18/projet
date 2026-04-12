import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

const ROLES = [
  'Software Engineer', 'Data Scientist', 'DevOps Engineer', 'Product Manager',
  'HR Manager', 'Sales Manager', 'Marketing Manager', 'Finance Manager', 'Project Manager', 'Other',
];

const ALL_SKILLS = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C#', 'Go', 'Rust',
  'React', 'Vue', 'Angular', 'Node.js', 'Django', 'FastAPI', 'Spring Boot',
  'SQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Linux',
  'Git', 'REST APIs', 'GraphQL', 'Microservices', 'Testing',
  'Machine Learning', 'Deep Learning', 'Scikit-learn', 'Pandas', 'Statistics',
  'Data Visualization', 'Tableau', 'Power BI',
  'Agile', 'Scrum', 'Product Strategy', 'Roadmapping', 'User Research', 'Stakeholder Management',
  'Communication', 'Problem Solving', 'Teamwork', 'Time Management', 'Leadership',
  'Negotiation', 'CRM', 'Digital Marketing', 'SEO', 'Financial Modeling', 'Excel',
];

export default function EmployeeProfile() {
  const [tab, setTab] = useState('hr');
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  // HR Profile form
  const [hr, setHr] = useState({
    age: '', gender: 'Male', education: 3, educationField: 'Technical Degree',
    jobRole: '', jobLevel: 2, yearsAtCompany: '', yearsInCurrentRole: '',
    yearsSinceLastPromotion: '', yearsWithCurrManager: '', totalWorkingYears: '',
    numCompaniesWorked: 1, trainingTimesLastYear: 0, performanceRating: 3,
    percentSalaryHike: 14, stockOptionLevel: 0, jobSatisfaction: 3,
    workLifeBalance: 3, environmentSatisfaction: 3, relationshipSatisfaction: 3,
    jobInvolvement: 3, monthlyIncome: '', overTime: 'No',
    businessTravel: 'Travel_Rarely', distanceFromHome: 10,
  });

  // Skill Profile form
  const [skill, setSkill] = useState({
    role: '', currentSkills: [], yearsExperience: '', proficiencyAvg: 0.7, learningVelocity: 0.5,
  });

  // Password change form
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    api.get('/employee/me').then(res => {
      const emp = res.data.employee;
      setEmployee(emp);
      if (emp.hrProfile) setHr(h => ({ ...h, ...emp.hrProfile }));
      if (emp.skillProfile) setSkill(s => ({ ...s, ...emp.skillProfile }));
    }).finally(() => setLoading(false));
  }, []);

  const setH = (k, v) => setHr(f => ({ ...f, [k]: v }));
  const setS = (k, v) => setSkill(f => ({ ...f, [k]: v }));

  const toggleSkill = (s) => {
    setSkill(f => ({
      ...f,
      currentSkills: f.currentSkills.includes(s)
        ? f.currentSkills.filter(x => x !== s)
        : [...f.currentSkills, s],
    }));
  };

  const saveHr = async () => {
    setSaving(true); setMsg(''); setError('');
    try {
      await api.put('/employee/hr-profile', hr);
      setMsg('HR profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save HR profile');
    } finally {
      setSaving(false);
    }
  };

  const saveSkill = async () => {
    if (!skill.role) { setError('Please select your role'); return; }
    setSaving(true); setMsg(''); setError('');
    try {
      await api.put('/employee/skill-profile', skill);
      setMsg('Skill profile saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save skill profile');
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match'); return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwError('New password must be at least 8 characters'); return;
    }
    setSaving(true); setPwMsg(''); setPwError('');
    try {
      await api.patch('/employee/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      setPwMsg('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const ratingLabel = (v) => ['', 'Poor', 'Below Average', 'Average', 'Good', 'Excellent'][v] || v;

  if (loading) return <div className="layout"><Sidebar /><main className="main"><div className="text-muted">Loading...</div></main></div>;

  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="page-header">
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Keep your information up to date for accurate AI analysis</div>
        </div>

        {employee?.mustChangePassword && (
          <div className="alert alert-warning">
             Please change your temporary password before continuing.
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { key: 'hr', label: ' HR Profile' },
            { key: 'skill', label: ' Skill Profile' },
            { key: 'password', label: ' Password' },
          ].map(t => (
            <button key={t.key}
              className={`btn btn-sm ${tab === t.key ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setTab(t.key); setMsg(''); setError(''); }}>
              {t.label}
            </button>
          ))}
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* ── HR PROFILE ── */}
        {tab === 'hr' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>HR Profile</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Used for attrition risk and promotion predictions</div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Age</label>
                <input className="form-input" type="number" min="18" max="70"
                  value={hr.age} onChange={e => setH('age', +e.target.value)} placeholder="30" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={hr.gender} onChange={e => setH('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Education level (1–5)</label>
                <select className="form-select" value={hr.education} onChange={e => setH('education', +e.target.value)}>
                  <option value={1}>1 — Below College</option>
                  <option value={2}>2 — College</option>
                  <option value={3}>3 — Bachelor</option>
                  <option value={4}>4 — Master</option>
                  <option value={5}>5 — Doctor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Education field</label>
                <select className="form-select" value={hr.educationField} onChange={e => setH('educationField', e.target.value)}>
                  {['Technical Degree', 'Life Sciences', 'Medical', 'Marketing', 'Human Resources', 'Other'].map(f => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Job role title</label>
                <input className="form-input" value={hr.jobRole} onChange={e => setH('jobRole', e.target.value)} placeholder="Software Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Job level (1–5)</label>
                <input className="form-input" type="number" min="1" max="5"
                  value={hr.jobLevel} onChange={e => setH('jobLevel', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Years at company</label>
                <input className="form-input" type="number" min="0"
                  value={hr.yearsAtCompany} onChange={e => setH('yearsAtCompany', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Years in current role</label>
                <input className="form-input" type="number" min="0"
                  value={hr.yearsInCurrentRole} onChange={e => setH('yearsInCurrentRole', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Years since last promotion</label>
                <input className="form-input" type="number" min="0"
                  value={hr.yearsSinceLastPromotion} onChange={e => setH('yearsSinceLastPromotion', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Total working years</label>
                <input className="form-input" type="number" min="0"
                  value={hr.totalWorkingYears} onChange={e => setH('totalWorkingYears', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Number of companies worked</label>
                <input className="form-input" type="number" min="1"
                  value={hr.numCompaniesWorked} onChange={e => setH('numCompaniesWorked', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Training sessions last year</label>
                <input className="form-input" type="number" min="0" max="6"
                  value={hr.trainingTimesLastYear} onChange={e => setH('trainingTimesLastYear', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly income ($)</label>
                <input className="form-input" type="number" min="1000"
                  value={hr.monthlyIncome} onChange={e => setH('monthlyIncome', +e.target.value)} placeholder="5000" />
              </div>
              <div className="form-group">
                <label className="form-label">Distance from home (km)</label>
                <input className="form-input" type="number" min="0"
                  value={hr.distanceFromHome} onChange={e => setH('distanceFromHome', +e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Overtime</label>
                <select className="form-select" value={hr.overTime} onChange={e => setH('overTime', e.target.value)}>
                  <option value="No">No</option><option value="Yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Business travel</label>
                <select className="form-select" value={hr.businessTravel} onChange={e => setH('businessTravel', e.target.value)}>
                  <option value="Non-Travel">Non-Travel</option>
                  <option value="Travel_Rarely">Travel Rarely</option>
                  <option value="Travel_Frequently">Travel Frequently</option>
                </select>
              </div>
            </div>

            {/* Satisfaction ratings */}
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)', marginBottom: 12 }}>Satisfaction ratings (1–4)</div>
              <div className="form-grid">
                {[
                  ['jobSatisfaction', 'Job satisfaction'],
                  ['workLifeBalance', 'Work-life balance'],
                  ['environmentSatisfaction', 'Environment satisfaction'],
                  ['relationshipSatisfaction', 'Relationship satisfaction'],
                  ['jobInvolvement', 'Job involvement'],
                  ['performanceRating', 'Performance rating'],
                ].map(([key, label]) => (
                  <div className="form-group" key={key}>
                    <label className="form-label">{label} — <strong>{ratingLabel(hr[key])}</strong></label>
                    <input type="range" min="1" max="4" value={hr[key]}
                      onChange={e => setH(key, +e.target.value)}
                      style={{ width: '100%', accentColor: 'var(--primary)' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)' }}>
                      <span>1</span><span>2</span><span>3</span><span>4</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={saveHr} disabled={saving}>
              {saving ? 'Saving...' : 'Save HR profile'}
            </button>
          </div>
        )}

        {/* ── SKILL PROFILE ── */}
        {tab === 'skill' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Skill Profile</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Used for skill gap analysis and learning recommendations</div>

            <div className="form-grid" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Your role *</label>
                <select className="form-select" value={skill.role} onChange={e => setS('role', e.target.value)}>
                  <option value="">Select your role</option>
                  {ROLES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Years of experience</label>
                <input className="form-input" type="number" min="0" max="40"
                  value={skill.yearsExperience}
                  onChange={e => setS('yearsExperience', +e.target.value)} placeholder="3" />
              </div>
            </div>

            <div className="form-grid" style={{ marginBottom: 20 }}>
              <div className="form-group">
                <label className="form-label">Average proficiency — <strong>{Math.round(skill.proficiencyAvg * 100)}%</strong></label>
                <input type="range" min="0" max="1" step="0.05"
                  value={skill.proficiencyAvg}
                  onChange={e => setS('proficiencyAvg', +e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)' }}>
                  <span>Beginner</span><span>Expert</span>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Learning velocity — <strong>{Math.round(skill.learningVelocity * 100)}%</strong></label>
                <input type="range" min="0" max="1" step="0.05"
                  value={skill.learningVelocity}
                  onChange={e => setS('learningVelocity', +e.target.value)}
                  style={{ width: '100%', accentColor: 'var(--primary)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)' }}>
                  <span>Slow</span><span>Fast</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Current skills ({skill.currentSkills.length} selected) — click to toggle
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {ALL_SKILLS.map(s => (
                  <button key={s} type="button"
                    onClick={() => toggleSkill(s)}
                    style={{
                      padding: '5px 12px', borderRadius: 20, fontSize: 12, cursor: 'pointer',
                      border: '1px solid',
                      borderColor: skill.currentSkills.includes(s) ? 'var(--primary)' : 'var(--gray-300)',
                      background: skill.currentSkills.includes(s) ? 'var(--primary-light)' : 'white',
                      color: skill.currentSkills.includes(s) ? 'var(--primary)' : 'var(--gray-600)',
                      fontWeight: skill.currentSkills.includes(s) ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn btn-primary" style={{ marginTop: 8 }} onClick={saveSkill} disabled={saving}>
              {saving ? 'Saving...' : 'Save skill profile'}
            </button>
          </div>
        )}

        {/* ── PASSWORD ── */}
        {tab === 'password' && (
          <div className="card" style={{ maxWidth: 480 }}>
            <div className="card-title" style={{ marginBottom: 4 }}>Change password</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>
              {employee?.mustChangePassword
                ? 'You must change your temporary password before using the platform.'
                : 'Update your account password.'}
            </div>

            {pwMsg && <div className="alert alert-success">{pwMsg}</div>}
            {pwError && <div className="alert alert-error">{pwError}</div>}

            <div className="form-group">
              <label className="form-label">Current password</label>
              <input className="form-input" type="password"
                value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))}
                placeholder="Your current or temporary password" />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="form-input" type="password"
                value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))}
                placeholder="At least 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input className="form-input" type="password"
                value={pwForm.confirmPassword}
                onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))}
                placeholder="Repeat new password" />
            </div>
            <button className="btn btn-primary" onClick={changePassword} disabled={saving}>
              {saving ? 'Saving...' : 'Change password'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}