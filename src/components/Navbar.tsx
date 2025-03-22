import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LogOut, Settings, User, Menu, ChevronDown, Sprout } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_AVATAR_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  // Define navigation items based on user login status
  const navItems = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/marketplace", label: "Marketplace" },
    { to: "/disease-detection", label: "Disease Detection" },
    // Only show Government Schemes when user is not logged in
    ...(!user ? [{ to: "/government-schemes", label: "Government Schemes" }] : []),
  ];

  return (
    <nav className="bg-green-800 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <RouterLink to="/" className="flex items-center gap-2 text-xl font-bold text-white hover:text-green-200 transition-colors">
              <Sprout className="h-6 w-6" />
              <span>HarvestHub</span>
            </RouterLink>
            <div className="hidden md:flex ml-10 space-x-1">
              {navItems.map((item) => (
                <RouterLink
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-green-800 hover:text-green-200 transition-all duration-200"
                >
                  {item.label}
                </RouterLink>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 bg-green-800 rounded-full px-3 py-1">
              <Button variant="ghost" className="text-sm text-white hover:text-green-200 hover:bg-transparent">
                हिंदी
              </Button>
              <span className="text-green-400">/</span>
              <Button variant="ghost" className="text-sm text-white hover:text-green-200 hover:bg-transparent">
                English
              </Button>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-green-800 rounded-full pl-2 pr-4 py-1 transition-colors">
                  <Avatar className="h-8 w-8 ring-2 ring-green-400/30">
                    <AvatarImage src={DEFAULT_AVATAR_URL} alt="User avatar" />
                    <AvatarFallback className="bg-green-700 text-white">
                      {user?.fullName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline font-medium text-white">{user?.fullName || 'User'}</span>
                  <ChevronDown className="hidden md:inline h-4 w-4 text-green-200" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 bg-white">
                  <DropdownMenuLabel className="text-gray-700 font-medium">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <RouterLink to="/profile" className="flex items-center w-full px-2 py-2 text-sm cursor-pointer hover:bg-green-50">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </RouterLink>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-green-50 cursor-pointer text-gray-700">
                    <Settings className="mr-2 h-4 w-4 text-green-600" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <RouterLink to="/login">
                <Button 
                  variant="outline" 
                  className="text-green-700 border-white hover:bg-white hover:text-green-900 transition-all duration-200 font-medium px-6 py-2 rounded-full border-2 shadow-sm hover:shadow-md active:scale-95"
                >
                  Sign In
                </Button>
              </RouterLink>
            )}

            <Button
              variant="ghost"
              className="md:hidden text-white hover:bg-green-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-in slide-in-from-top duration-200 bg-green-800">
            {navItems.map((item) => (
              <RouterLink
                key={item.to}
                to={item.to}
                className="block px-4 py-2 text-sm text-white hover:bg-green-700 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </RouterLink>
            ))}
            <div className="flex items-center gap-2 px-4 py-2 border-t border-green-700 mt-4">
              <Button variant="ghost" className="text-sm text-white hover:text-green-200">
                हिंदी
              </Button>
              <span className="text-green-400">/</span>
              <Button variant="ghost" className="text-sm text-white hover:text-green-200">
                English
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
