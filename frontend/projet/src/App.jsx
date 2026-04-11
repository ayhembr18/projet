import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Public pages
import LandingPage from './pages/LandingPage';
import EnterpriseRegister from './pages/EnterpriseRegister';
import EnterpriseLogin from './pages/EnterpriseLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import AdminLogin from './pages/AdminLogin';

// Enterprise portal
import EnterpriseDashboard from './pages/enterprise/Dashboard';
import EnterpriseStaff from './pages/enterprise/Staff';
import EnterpriseAddEmployee from './pages/enterprise/AddEmployee';
import EnterpriseEmployeeDetail from './pages/enterprise/EmployeeDetail';

// Employee portal
import EmployeeDashboard from './pages/employee/Dashboard';
import EmployeeProfile from './pages/employee/Profile';
import EmployeeResults from './pages/employee/Results';

// Admin portal
import AdminDashboard from './pages/admin/Dashboard';
import AdminEnterprises from './pages/admin/Enterprises';
import AdminEnterpriseDetail from './pages/admin/EnterpriseDetail';

function ProtectedRoute({ children, allowedRole }) {
  const { user, role, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (allowedRole && role !== allowedRole) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/enterprise/register" element={<EnterpriseRegister />} />
      <Route path="/enterprise/login" element={<EnterpriseLogin />} />
      <Route path="/employee/login" element={<EmployeeLogin />} />
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Enterprise portal */}
      <Route path="/enterprise/dashboard" element={
        <ProtectedRoute allowedRole="enterprise"><EnterpriseDashboard /></ProtectedRoute>
      } />
      <Route path="/enterprise/staff" element={
        <ProtectedRoute allowedRole="enterprise"><EnterpriseStaff /></ProtectedRoute>
      } />
      <Route path="/enterprise/staff/add" element={
        <ProtectedRoute allowedRole="enterprise"><EnterpriseAddEmployee /></ProtectedRoute>
      } />
      <Route path="/enterprise/staff/:id" element={
        <ProtectedRoute allowedRole="enterprise"><EnterpriseEmployeeDetail /></ProtectedRoute>
      } />

      {/* Employee portal */}
      <Route path="/employee/dashboard" element={
        <ProtectedRoute allowedRole="employee"><EmployeeDashboard /></ProtectedRoute>
      } />
      <Route path="/employee/profile" element={
        <ProtectedRoute allowedRole="employee"><EmployeeProfile /></ProtectedRoute>
      } />
      <Route path="/employee/results" element={
        <ProtectedRoute allowedRole="employee"><EmployeeResults /></ProtectedRoute>
      } />

      {/* Admin portal */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute allowedRole="platform_admin"><AdminDashboard /></ProtectedRoute>
      } />
      <Route path="/admin/enterprises" element={
        <ProtectedRoute allowedRole="platform_admin"><AdminEnterprises /></ProtectedRoute>
      } />
      <Route path="/admin/enterprises/:id" element={
        <ProtectedRoute allowedRole="platform_admin"><AdminEnterpriseDetail /></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}