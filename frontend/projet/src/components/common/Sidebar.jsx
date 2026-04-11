import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";

const icons = {
  dashboard: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  users: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  building: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  chart: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  user: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  logout: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  add: (
    <svg className="icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  ),
};

const navConfig = {
  enterprise: [
    { label: 'Dashboard', icon: 'dashboard', to: '/enterprise/dashboard' },
    { label: 'Staff', icon: 'users', to: '/enterprise/staff' },
    { label: 'Add Employee', icon: 'add', to: '/enterprise/staff/add' },
  ],
  employee: [
    { label: 'Dashboard', icon: 'dashboard', to: '/employee/dashboard' },
    { label: 'My Profile', icon: 'user', to: '/employee/profile' },
    { label: 'My Results', icon: 'chart', to: '/employee/results' },
  ],
  platform_admin: [
    { label: 'Dashboard', icon: 'dashboard', to: '/admin/dashboard' },
    { label: 'Applications', icon: 'building', to: '/admin/enterprises' },
  ],
};

export default function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = navConfig[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const roleName = {
    enterprise: 'Enterprise Portal',
    employee: 'Employee Portal',
    platform_admin: 'Admin Portal',
  }[role];

  const displayName = user?.companyName || user?.firstName
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user?.companyName
    : user?.name || user?.email || 'User';

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        HR<span>Platform</span>
        <div style={{ fontSize: 11, fontWeight: 400, color: 'var(--gray-400)', marginTop: 2 }}>{roleName}</div>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
          >
            {icons[item.icon]}
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--gray-700)', marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {displayName}
        </div>
        <button className="nav-item" style={{ padding: '8px 0', color: 'var(--gray-500)' }} onClick={handleLogout}>
          {icons.logout} Sign out
        </button>
      </div>
    </div>
  );
}