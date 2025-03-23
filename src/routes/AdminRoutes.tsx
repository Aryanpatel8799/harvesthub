import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import AdminLogin from '@/components/admin/AdminLogin';
import Dashboard from '@/components/admin/Dashboard';
import CertificationManagement from '@/components/admin/CertificationManagement';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user || user.type !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

const AdminRoutes = () => {
  const { user } = useAuth();

  // If user is already logged in as admin and tries to access login page, redirect to dashboard
  if (user?.type === 'admin' && window.location.pathname === '/admin/login') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // If user is logged in but not as admin, redirect to main dashboard
  if (user && user.type !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/certifications"
        element={
          <ProtectedRoute>
            <CertificationManagement />
          </ProtectedRoute>
        }
      />
      {/* Redirect root admin path to dashboard */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
};

export default AdminRoutes; 