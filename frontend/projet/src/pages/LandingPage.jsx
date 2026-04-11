import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Nav */}
      <nav style={{ padding: '16px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--gray-200)' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>
          HR<span style={{ fontWeight: 400, color: 'var(--gray-500)' }}>Platform</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/enterprise/login" className="btn btn-secondary btn-sm">Enterprise login</Link>
          <Link to="/employee/login" className="btn btn-secondary btn-sm">Employee login</Link>
          <Link to="/admin/login" className="btn btn-secondary btn-sm" style={{ color: 'var(--gray-400)', fontSize: 12 }}>Admin</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '80px 24px 60px', textAlign: 'center' }}>
        <div className="badge badge-primary" style={{ marginBottom: 20, fontSize: 13 }}>AI-Powered HR Intelligence</div>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: 'var(--gray-900)', lineHeight: 1.15, marginBottom: 20 }}>
          Understand your workforce.<br />
          <span style={{ color: 'var(--primary)' }}>Predict what comes next.</span>
        </h1>
        <p style={{ fontSize: 18, color: 'var(--gray-500)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.7 }}>
          Our AI analyzes employee skill gaps, attrition risk, and promotion readiness — giving your HR team the insights to act before problems arise.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/enterprise/register" className="btn btn-primary" style={{ fontSize: 16, padding: '12px 28px' }}>
            Apply for your company
          </Link>
          <Link to="/enterprise/login" className="btn btn-secondary" style={{ fontSize: 16, padding: '12px 28px' }}>
            Sign in
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{ background: 'var(--gray-50)', padding: '60px 48px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
          {[
            {
              icon: '🧠',
              title: 'Skill gap analysis',
              desc: 'Identify exactly which skills each employee is missing for their role and get prioritized learning recommendations.'
            },
            {
              icon: '⚠️',
              title: 'Attrition risk',
              desc: 'Predict which employees are most likely to leave, with actionable insights to improve retention before it\'s too late.'
            },
            {
              icon: '🚀',
              title: 'Promotion readiness',
              desc: 'See who is ready to advance, who is developing, and what each employee needs to reach the next level.'
            },
          ].map(f => (
            <div key={f.title} className="card">
              <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
              <div className="card-title">{f.title}</div>
              <div style={{ fontSize: 14, color: 'var(--gray-500)', marginTop: 8, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '60px 48px' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 32, textAlign: 'center' }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
          {[
            { step: '01', title: 'Apply', desc: 'Submit your company application. Our admin reviews and approves it.' },
            { step: '02', title: 'Add your staff', desc: 'Add employees from your dashboard. Credentials are generated automatically.' },
            { step: '03', title: 'Employees complete profiles', desc: 'Each employee fills in their skills and HR data in their private portal.' },
            { step: '04', title: 'Get AI insights', desc: 'Our models analyze every profile and surface actionable intelligence.' },
          ].map(s => (
            <div key={s.step} style={{ textAlign: 'center', padding: '20px 16px' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginBottom: 8, letterSpacing: '0.05em' }}>{s.step}</div>
              <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--gray-800)' }}>{s.title}</div>
              <div style={{ fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: 'var(--primary)', padding: '48px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12 }}>Ready to get started?</h2>
        <p style={{ color: 'rgba(255,255,255,0.75)', marginBottom: 24, fontSize: 16 }}>Apply today. Setup takes less than 5 minutes.</p>
        <Link to="/enterprise/register" className="btn" style={{ background: 'white', color: 'var(--primary)', fontSize: 15, padding: '12px 28px', fontWeight: 600 }}>
          Register your company
        </Link>
      </div>
    </div>
  );
}