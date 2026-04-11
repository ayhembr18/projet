import { useState, useEffect } from 'react';
import Sidebar from '../../components/common/Sidebar';
import api from '../../utils/api';

const SKILLS_BY_ROLE = {
  data_science: ['Python', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'SQL', 'Statistics', 'Data Visualization', 'NLP', 'MLOps', 'Feature Engineering', 'A/B Testing', 'Spark', 'Kubernetes', 'Docker'],
  software_engineering: ['Python', 'Java', 'JavaScript', 'React', 'Node.js', 'Docker', 'Kubernetes', 'CI/CD', 'REST APIs', 'Microservices', 'Cloud (AWS/GCP/Azure)', 'Git', 'TypeScript', 'System Design', 'Agile'],
  product_management: ['Product Strategy', 'Roadmapping', 'Agile', 'User Research', 'SQL', 'Data Analysis', 'Stakeholder Management', 'A/B Testing', 'Market Research', 'OKRs', 'Wireframing', 'Go-to-Market', 'Leadership'],
  cybersecurity: ['Network Security', 'Penetration Testing', 'SIEM', 'Incident Response', 'Cloud Security', 'Python', 'Linux', 'Risk Assessment', 'SOC', 'Malware Analysis', 'Zero Trust', 'Compliance', 'Cryptography'],
  devops: ['Docker', 'Kubernetes', 'Terraform', 'CI/CD', 'Monitoring', 'Linux', 'Bash', 'Cloud (AWS/GCP/Azure)', 'Git', 'Jenkins', 'Ansible', 'Prometheus', 'Grafana', 'Networking'],
};

const ROLES = [
  { value: 'data_science', label: 'Data Science' },
  { value: 'software_engineering', label: 'Software Engineering' },
  { value: 'product_management', label: 'Product Management' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'devops', label: 'DevOps' },
];

export default function EmployeeProfile() {
  const [employee, setEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('hr');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const [hrForm, setHrForm] = useState({
    age: '', gender: 'Male', education: 3, educationField: 'Technical Degree',
    jobRole: '', jobLevel: 2, yearsAtCompany: '', yearsInCurrentRole: '',
    yearsSinceLastPromotion: '', yearsWithCurrManager: '', totalWorkingYears: '',
    numCompaniesWorked: '', trainingTimesLastYear: '', performanceRating: 3,
    percentSalaryHike: 14, stockOptionLevel: 0,
    jobSatisfaction: 3, workLifeBalance: 3, environmentSatisfaction: 3,
    relationshipSatisfaction: 3, jobInvolvement: 3,
    monthlyIncome: '', overTime: 'No',
    businessTravel: 'Travel_Rarely', distanceFromHome: '',
  });

  const [skillForm, setSkillForm] = useState({
    role: 'software_engineering', currentSkills: [],
    yearsExperience: '', proficiencyAvg: 0.7, learningVelocity: 0.5,
  });

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    api.get('/employee/me').then(res => {
      const emp = res.data.employee;
      setEmployee(emp);
      if (emp.hrProfile) setHrForm(f => ({ ...f, ...emp.hrProfile }));
      if (emp.skillProfile) setSkillForm(f => ({ ...f, ...emp.skillProfile }));
    });
  }, []);

  const setHr = (k, v) => setHrForm(f => ({ ...f, [k]: v }));
  const setSk = (k, v) => setSkillForm(f => ({ ...f, [k]: v }));

  const toggleSkill = (skill) => {
    setSkillForm(f => ({
      ...f,
      currentSkills: f.currentSkills.includes(skill)
        ? f.currentSkills.filter(s => s !== skill)
        : [...f.currentSkills, skill]
    }));
  };

  const saveHr = async () => {
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      await api.put('/employee/hr-profile', hrForm);
      setMsg({ text: 'HR profile saved!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Save failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const saveSkills = async () => {
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      await api.put('/employee/skill-profile', skillForm);
      setMsg({ text: 'Skill profile saved!', type: 'success' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Save failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (pwForm.newPassword !== pwForm.confirm) { setMsg({ text: 'Passwords do not match', type: 'error' }); return; }
    if (pwForm.newPassword.length < 8) { setMsg({ text: 'Password must be at least 8 characters', type: 'error' }); return; }
    setSaving(true); setMsg({ text: '', type: '' });
    try {
      await api.patch('/employee/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setMsg({ text: 'Password changed successfully!', type: 'success' });
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Password change failed', type: 'error' });
    } finally { setSaving(false); }
  };

  const ratingLabels = { 1: 'Low', 2: 'Below avg', 3: 'Average', 4: 'High' };
  const availableSkills = SKILLS_BY_ROLE[skillForm.role] || [];

  const tabs = [
    { id: 'hr', label: 'HR Profile' },
    { id: 'skills', label: 'Skills' },
    { id: 'password', label: 'Security' },
  ];

  return (
    <div className="layout">
      <Sidebar />
      <main className="main" style={{ maxWidth: 720 }}>
        <div className="page-header">
          <div className="page-title">My Profile</div>
          <div className="page-subtitle">Complete your profile to enable AI analysis</div>
        </div>

        {msg.text && <div className={`alert alert-${msg.type === 'error' ? 'error' : 'success'}`}>{msg.text}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 20, borderBottom: '1px solid var(--gray-200)', paddingBottom: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setMsg({ text: '', type: '' }); }}
              className="btn" style={{
                borderRadius: '8px 8px 0 0', borderBottom: 'none',
                background: activeTab === t.id ? 'white' : 'transparent',
                color: activeTab === t.id ? 'var(--primary)' : 'var(--gray-500)',
                borderTop: activeTab === t.id ? '2px solid var(--primary)' : '2px solid transparent',
                fontWeight: activeTab === t.id ? 600 : 400,
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* HR Profile Tab */}
        {activeTab === 'hr' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>HR information</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Used by the AI prediction model to assess attrition, promotion, and growth.</div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input className="form-input" type="number" min={18} max={70} value={hrForm.age} onChange={e => setHr('age', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select className="form-select" value={hrForm.gender} onChange={e => setHr('gender', e.target.value)}>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Education level</label>
                <select className="form-select" value={hrForm.education} onChange={e => setHr('education', +e.target.value)}>
                  <option value={1}>Below college</option><option value={2}>College</option>
                  <option value={3}>Bachelor</option><option value={4}>Master/PhD</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Field of education</label>
                <select className="form-select" value={hrForm.educationField} onChange={e => setHr('educationField', e.target.value)}>
                  {['Life Sciences', 'Medical', 'Marketing', 'Technical Degree', 'Human Resources', 'Other'].map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Job role</label>
                <input className="form-input" value={hrForm.jobRole} onChange={e => setHr('jobRole', e.target.value)} placeholder="e.g. Software Engineer" />
              </div>
              <div className="form-group">
                <label className="form-label">Job level (1–5)</label>
                <select className="form-select" value={hrForm.jobLevel} onChange={e => setHr('jobLevel', +e.target.value)}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>Level {n}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Years at company</label>
                <input className="form-input" type="number" min={0} value={hrForm.yearsAtCompany} onChange={e => setHr('yearsAtCompany', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Years in current role</label>
                <input className="form-input" type="number" min={0} value={hrForm.yearsInCurrentRole} onChange={e => setHr('yearsInCurrentRole', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Years since last promotion</label>
                <input className="form-input" type="number" min={0} value={hrForm.yearsSinceLastPromotion} onChange={e => setHr('yearsSinceLastPromotion', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Total working years</label>
                <input className="form-input" type="number" min={0} value={hrForm.totalWorkingYears} onChange={e => setHr('totalWorkingYears', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Training sessions last year</label>
                <input className="form-input" type="number" min={0} max={6} value={hrForm.trainingTimesLastYear} onChange={e => setHr('trainingTimesLastYear', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Monthly income (USD)</label>
                <input className="form-input" type="number" min={0} value={hrForm.monthlyIncome} onChange={e => setHr('monthlyIncome', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Overtime</label>
                <select className="form-select" value={hrForm.overTime} onChange={e => setHr('overTime', e.target.value)}>
                  <option value="No">No</option><option value="Yes">Yes</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Business travel</label>
                <select className="form-select" value={hrForm.businessTravel} onChange={e => setHr('businessTravel', e.target.value)}>
                  <option value="Non-Travel">Non-travel</option>
                  <option value="Travel_Rarely">Travel rarely</option>
                  <option value="Travel_Frequently">Travel frequently</option>
                </select>
              </div>
            </div>

            <hr className="divider" />
            <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 14 }}>Satisfaction ratings (1 = Low, 4 = High)</div>
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
                  <label className="form-label">{label}: <strong>{ratingLabels[hrForm[key]]}</strong></label>
                  <input type="range" min={1} max={4} value={hrForm[key]}
                    onChange={e => setHr(key, +e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--gray-400)' }}>
                    <span>1</span><span>2</span><span>3</span><span>4</span>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" disabled={saving} onClick={saveHr} style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
              {saving ? 'Saving...' : 'Save HR profile'}
            </button>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Skill profile</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Used by the skill gap analyzer to identify what you need to learn.</div>

            <div className="form-group">
              <label className="form-label">Your role / track</label>
              <select className="form-select" value={skillForm.role} onChange={e => setSk('role', e.target.value)}>
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Years of experience</label>
              <input className="form-input" type="number" min={0} max={50} value={skillForm.yearsExperience}
                onChange={e => setSk('yearsExperience', e.target.value)} placeholder="3" />
            </div>

            <div className="form-group">
              <label className="form-label">Average skill proficiency: <strong>{Math.round(skillForm.proficiencyAvg * 100)}%</strong></label>
              <input type="range" min={10} max={100} value={Math.round(skillForm.proficiencyAvg * 100)}
                onChange={e => setSk('proficiencyAvg', e.target.value / 100)}
                style={{ width: '100%', accentColor: 'var(--primary)' }} />
            </div>

            <div className="form-group">
              <label className="form-label">Learning velocity: <strong>{Math.round(skillForm.learningVelocity * 100)}%</strong></label>
              <div className="form-hint">How quickly do you pick up new skills? (self-assessment)</div>
              <input type="range" min={10} max={100} value={Math.round(skillForm.learningVelocity * 100)}
                onChange={e => setSk('learningVelocity', e.target.value / 100)}
                style={{ width: '100%', accentColor: 'var(--primary)', marginTop: 8 }} />
            </div>

            <div className="form-group">
              <label className="form-label">
                Current skills — select all that apply ({skillForm.currentSkills.length} selected)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                {availableSkills.map(skill => {
                  const selected = skillForm.currentSkills.includes(skill);
                  return (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer', border: '1px solid',
                        background: selected ? 'var(--primary)' : 'white',
                        color: selected ? 'white' : 'var(--gray-600)',
                        borderColor: selected ? 'var(--primary)' : 'var(--gray-300)',
                        transition: 'all 0.15s',
                      }}>
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            <button className="btn btn-primary" disabled={saving} onClick={saveSkills} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : 'Save skill profile'}
            </button>
          </div>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="card">
            <div className="card-title" style={{ marginBottom: 4 }}>Change password</div>
            <div className="card-subtitle" style={{ marginBottom: 20 }}>Use a strong password different from the temporary one.</div>

            <div className="form-group">
              <label className="form-label">Current password</label>
              <input className="form-input" type="password" value={pwForm.currentPassword}
                onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">New password</label>
              <input className="form-input" type="password" value={pwForm.newPassword}
                onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 8 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm new password</label>
              <input className="form-input" type="password" value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} />
            </div>
            <button className="btn btn-primary" disabled={saving} onClick={changePassword} style={{ width: '100%', justifyContent: 'center' }}>
              {saving ? 'Saving...' : 'Change password'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}