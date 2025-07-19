import { useAuth } from "@/context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

export default function AdminProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div></div>;
  }

  if (!user || user.type !== "admin") {
    // If not logged in as admin, redirect to admin login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 