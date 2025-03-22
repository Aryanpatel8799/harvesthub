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
import { LogOut, Settings, User, Menu, ChevronDown, Sprout, Languages } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import GoogleTranslate from "./GoogleTranslate";

const DEFAULT_AVATAR_URL = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm3RFDZM21teuCMFYx_AROjt-AzUwDBROFww&s";

// Language options
const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिंदी (Hindi)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'bn', label: 'বাংলা (Bengali)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ml', label: 'മലയാളം (Malayalam)' },
  { code: 'or', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'as', label: 'অসমীয়া (Assamese)' }
];

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

  const handleLanguageChange = (lang: string) => {
    try {
      // Method 1: Try using the combo box
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = lang;
        select.dispatchEvent(new Event('change'));
        return;
      }

      // Method 2: Try using the translate function directly
      const translateElement = window.google?.translate;
      if (translateElement) {
        if (lang === 'en') {
          translateElement.translate.restore();
        } else {
          translateElement.translate.translate(document.documentElement, 'en', lang);
        }
        return;
      }

      // Method 3: Try using the iframe method
      const iframe = document.querySelector('.goog-te-menu-frame') as HTMLIFrameElement;
      if (iframe) {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (iframeDoc) {
          const items = iframeDoc.querySelectorAll('.goog-te-menu2-item');
          items.forEach(item => {
            if (item.textContent?.includes(lang === 'hi' ? 'Hindi' : 'English')) {
              (item as HTMLElement).click();
            }
          });
        }
      }
    } catch (error) {
      console.error('Error changing language:', error);
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
            <div className="hidden md:flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Languages className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel className="text-gray-700">Other Languages</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {languages.map((lang) => (
                    <DropdownMenuItem
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className="cursor-pointer hover:bg-green-50"
                    >
                      {lang.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
            <div className="flex flex-col gap-2 px-4 py-2 border-t border-green-700 mt-4">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  className="text-sm text-white hover:text-green-200"
                  onClick={() => handleLanguageChange('en')}
                >
                  English
                </Button>
                <span className="text-green-400">/</span>
                <Button 
                  variant="ghost" 
                  className="text-sm text-white hover:text-green-200"
                  onClick={() => handleLanguageChange('hi')}
                >
                  हिंदी
                </Button>
              </div>
              <div className="space-y-1">
                {languages.filter(lang => !['en', 'hi'].includes(lang.code)).map((lang) => (
                  <Button
                    key={lang.code}
                    variant="ghost"
                    className="w-full text-left text-sm text-white hover:text-green-200 justify-start"
                    onClick={() => handleLanguageChange(lang.code)}
                  >
                    {lang.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
