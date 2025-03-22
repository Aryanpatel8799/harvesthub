import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import StripeProvider from "@/context/StripeContext";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ConsumerDashboard from "@/pages/ConsumerDashboard";
import Layout from "@/components/Layout";
import WeatherMarket from "@/pages/WeatherMarket";
import OrganicCertification from "@/pages/OrganicCertification";
import Transport from "@/pages/Transport";
import WasteMarketplace from "@/pages/WasteMarketplace";
import Marketplace from "@/pages/Marketplace";
import DiseaseDetection from "@/pages/DiseaseDetection";
import GovernmentSchemes from "@/pages/GovernmentSchemes";
import AIChat from "@/pages/AIChat";
import NotFound from "@/pages/NotFound";
import Index from "@/pages/Index";
import Checkout from "@/pages/Checkout";
import OrderConfirmation from "@/pages/OrderConfirmation";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "@/pages/Profile";
import FarmerOrders from "@/pages/FarmerOrders";
import AdminLayout from "@/components/admin/AdminLayout";
import AdminRoutes from "@/routes/AdminRoutes";
import GoogleTranslate from "@/components/GoogleTranslate"; // ✅ Import Google Translate Component

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51R5Xc3RsnrUQKVTh8gmSSelddvy8wtZDd4ejsEiiDeuvMNN5X0kntRr9Ppvyx4LKVzOY6qjm3EFowbk9M1bw6wG100cL307Fkr');

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

// Farmer-only route
const FarmerOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (user?.type !== "farmer") {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

// Smart dashboard that redirects based on user type
const SmartDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return user?.type === "farmer" ? <Dashboard /> : <ConsumerDashboard />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <StripeProvider>
          <Elements stripe={stripePromise}>
            <GoogleTranslate /> {/* ✅ Google Translate Component */}
            <Routes>
              <Route path="/login" element={<Login />} />

              {/* Protected Routes */}
              <Route element={<Layout />}>
                <Route path="/" element={<Index />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <SmartDashboard />
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
                    <ProtectedRoute>
                      <FarmerOnlyRoute>
                        <FarmerOrders />
                      </FarmerOnlyRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/weather-market"
                  element={
                    <ProtectedRoute>
                      <FarmerOnlyRoute>
                        <WeatherMarket />
                      </FarmerOnlyRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/organic-certification"
                  element={
                    <ProtectedRoute>
                      <FarmerOnlyRoute>
                        <OrganicCertification />
                      </FarmerOnlyRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transport"
                  element={
                    <ProtectedRoute>
                      <FarmerOnlyRoute>
                        <Transport />
                      </FarmerOnlyRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/waste-marketplace"
                  element={
                    <ProtectedRoute>
                      <FarmerOnlyRoute>
                        <WasteMarketplace />
                      </FarmerOnlyRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/government-schemes"
                  element={
                    <ProtectedRoute>
                      <FarmerOnlyRoute>
                        <GovernmentSchemes />
                      </FarmerOnlyRoute>
                    </ProtectedRoute>
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
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/order-confirmation"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
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

              {/* Admin routes */}
              <Route
                path="/admin/*"
                element={
                  <AdminLayout>
                    <AdminRoutes />
                  </AdminLayout>
                }
              />
            </Routes>
            <Toaster />
            <ToastContainer position="top-right" autoClose={3000} />
          </Elements>
        </StripeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
