import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-green-50">
        <div className="animate-spin h-12 w-12 border-4 border-[#2D6A4F] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)]">
        {user && !isHomePage && (
          <Sidebar 
            collapsed={sidebarCollapsed} 
            onCollapse={setSidebarCollapsed}
            className="shadow-lg"
          />
        )}
        <main 
          className={cn(
            "flex-1 overflow-y-auto transition-all duration-300",
            isHomePage ? "p-0" : "p-6 md:p-8"
          )}
        >
          <div className={cn(
            "mx-auto",
            !isHomePage && "max-w-7xl"
          )}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
