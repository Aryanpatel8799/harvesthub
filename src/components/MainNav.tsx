import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import {
  Home,
  ShoppingBag,
  Cloud,
  Leaf,
  Truck,
  Recycle,
  Package,
  LineChart
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  farmerOnly?: boolean;
}

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const { user } = useAuth();
  const isFarmer = user?.type === 'farmer';

  const items: NavItem[] = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="w-4 h-4" />,
    },
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LineChart className="w-4 h-4" />,
    },
    {
      title: "Orders",
      href: "/orders",
      icon: <Package className="w-4 h-4" />,
      farmerOnly: true,
    },
    {
      title: "Weather & Market",
      href: "/weather-market",
      icon: <Cloud className="w-4 h-4" />,
      farmerOnly: true,
    },
    {
      title: "Organic Certification",
      href: "/organic-certification",
      icon: <Leaf className="w-4 h-4" />,
      farmerOnly: true,
    },
    {
      title: "Transport",
      href: "/transport",
      icon: <Truck className="w-4 h-4" />,
      farmerOnly: true,
    },
    {
      title: "Waste Marketplace",
      href: "/waste-marketplace",
      icon: <Recycle className="w-4 h-4" />,
      farmerOnly: true,
    },
  ];

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      {items.map((item) => {
        // Only show farmer-only items to farmers
        if (item.farmerOnly && !isFarmer) {
          return null;
        }

        return (
          <Link
            key={item.href}
            to={item.href}
            className="flex items-center text-sm font-medium transition-colors hover:text-primary"
          >
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
} 