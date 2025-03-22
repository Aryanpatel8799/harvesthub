import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  ShoppingCart,
  FileText, 
  Search,
  CloudSun,
  Truck,
  Award,
  FileCheck,
  Sprout,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Home,
  Leaf,
  Package
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type SidebarProps = {
  className?: string;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
};

type NavItem = {
  path: string;
  name: string;
  icon: JSX.Element;
  forUserTypes?: Array<'farmer' | 'consumer' | 'all'>;
};

const Sidebar = ({ className, collapsed = false, onCollapse }: SidebarProps) => {
  const location = useLocation();
  const { user } = useAuth();
  const isFarmer = user?.type === 'farmer';

  const navItems: NavItem[] = [
    {
      path: "/",
      name: "Home",
      icon: <Home size={20} />,
      forUserTypes: ['all']
    },
    { 
      path: "/dashboard", 
      name: "Dashboard", 
      icon: <BarChart3 size={20} />,
      forUserTypes: ['all']
    },
    { 
      path: "/marketplace", 
      name: "Marketplace", 
      icon: <ShoppingCart size={20} />,
      forUserTypes: ['all']
    },
    { 
      path: "/orders", 
      name: "Orders", 
      icon: <Package size={20} />,
      forUserTypes: ['farmer']
    },
    { 
      path: "/disease-detection", 
      name: "Disease Detection", 
      icon: <Search size={20} />,
      forUserTypes: ['all']
    },
    { 
      path: "/weather-market", 
      name: "Weather & Market", 
      icon: <CloudSun size={20} />,
      forUserTypes: ['farmer']
    },
    { 
      path: "/transport", 
      name: "Transport", 
      icon: <Truck size={20} />,
      forUserTypes: ['farmer']
    },
    { 
      path: "/organic-certification", 
      name: "Organic Certification", 
      icon: <Award size={20} />,
      forUserTypes: ['farmer']
    },
    { 
      path: "/government-schemes", 
      name: "Government Schemes", 
      icon: <FileText size={20} />,
      forUserTypes: ['farmer']
    },
    { 
      path: "/waste-marketplace", 
      name: "Waste Marketplace", 
      icon: <Sprout size={20} />,
      forUserTypes: ['farmer']
    },
    { 
      path: "/ai-chat", 
      name: "Health Assistant", 
      icon: <MessageSquare size={20} />,
      forUserTypes: ['all']
    },
  ];

  // Filter nav items based on user type
  const filteredNavItems = navItems.filter(item => 
    item.forUserTypes?.includes('all') || 
    item.forUserTypes?.includes(user?.type as 'farmer' | 'consumer')
  );

  return (
    <aside 
      className={cn(
        "h-full bg-white text-gray-600 flex flex-col transition-all duration-300 shadow-lg border-r border-gray-100",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex-1 py-6 flex flex-col gap-2 overflow-y-auto bg-gradient-to-b from-white to-gray-50">
        {filteredNavItems.map((item) => {
          // Only show farmer-only items to farmers
          if (item.forUserTypes?.includes('farmer') && !isFarmer) {
            return null;
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium transition-all duration-200 mx-2 rounded-lg group",
                location.pathname === item.path
                  ? "bg-green-50 text-green-700 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:translate-x-1",
                collapsed ? "justify-center" : "justify-start",
                // Highlight Orders link for farmers
                item.path === "/orders" && isFarmer && "bg-green-50/50",
              )}
            >
              <span className={cn(
                "transition-colors duration-200",
                location.pathname === item.path
                  ? "text-green-600"
                  : "text-gray-400 group-hover:text-gray-600",
              )}>
                {item.icon}
              </span>
              {!collapsed && (
                <span className="ml-3 truncate">
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <button 
          onClick={() => onCollapse?.(!collapsed)}
          className={cn(
            "w-full flex items-center transition-all duration-200 rounded-md p-2",
            collapsed ? "justify-center" : "justify-between",
            "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          {!collapsed && <span className="text-sm font-medium">Collapse Sidebar</span>}
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
