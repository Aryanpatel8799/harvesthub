import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Layout from '@/components/Layout';
import Index from '@/pages/Index';
import Profile from '@/pages/Profile';
import FarmerOrders from '@/pages/FarmerOrders';
import Marketplace from '@/pages/Marketplace';
import NotFound from '@/pages/NotFound';
import WeatherMarket from '@/pages/WeatherMarket';
import OrganicCertification from '@/pages/OrganicCertification';
import Transport from '@/pages/Transport';
import WasteMarketplace from '@/pages/WasteMarketplace';
import DiseaseDetection from '@/pages/DiseaseDetection';
import GovernmentSchemes from '@/pages/GovernmentSchemes';
import AIChat from '@/pages/AIChat';
import { ToastContainer } from 'react-toastify';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Farmer only route
const FarmerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!user || user.type !== 'farmer') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            {/* Farmer-only routes */}
            <Route
              path="/orders"
              element={
                <FarmerRoute>
                  <FarmerOrders />
                </FarmerRoute>
              }
            />
            <Route
              path="/weather-market"
              element={
                <FarmerRoute>
                  <WeatherMarket />
                </FarmerRoute>
              }
            />
            <Route
              path="/organic-certification"
              element={
                <FarmerRoute>
                  <OrganicCertification />
                </FarmerRoute>
              }
            />
            <Route
              path="/transport"
              element={
                <FarmerRoute>
                  <Transport />
                </FarmerRoute>
              }
            />
            <Route
              path="/waste-marketplace"
              element={
                <FarmerRoute>
                  <WasteMarketplace />
                </FarmerRoute>
              }
            />
            <Route
              path="/government-schemes"
              element={
                <FarmerRoute>
                  <GovernmentSchemes />
                </FarmerRoute>
              }
            />
            {/* Routes for both consumers and farmers */}
            <Route
              path="/marketplace"
              element={
                <ProtectedRoute>
                  <Marketplace />
                </ProtectedRoute>
              }
            />
            <Route
              path="/disease-detection"
              element={
                <ProtectedRoute>
                  <DiseaseDetection />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <AIChat />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toaster />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
