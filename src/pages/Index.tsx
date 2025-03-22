import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sprout, 
  ShoppingCart, 
  LineChart, 
  Search, 
  FileCheck, 
  Users, 
  Zap 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const [animationVisible, setAnimationVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    // Animation trigger
    setAnimationVisible(true);

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Features list
  const features = [
    {
      icon: <ShoppingCart className="h-8 w-8 text-harvest-600" />,
      title: "Direct Marketplace",
      description: "Connect farmers directly with consumers, eliminating middlemen and ensuring fair prices.",
    },
    {
      icon: <Search className="h-8 w-8 text-harvest-600" />,
      title: "AI Disease Detection",
      description: "Upload plant images to instantly detect diseases and get treatment recommendations.",
    },
    {
      icon: <Sprout className="h-8 w-8 text-harvest-600" />,
      title: "Crop Recommendations",
      description: "Get AI-powered suggestions for optimal crop selection based on soil, weather, and market demand.",
    },
    {
      icon: <FileCheck className="h-8 w-8 text-harvest-600" />,
      title: "Government Schemes",
      description: "Access and apply for agricultural support schemes and subsidies available for farmers.",
    },
    {
      icon: <LineChart className="h-8 w-8 text-harvest-600" />,
      title: "Market Insights",
      description: "Live market price updates and trends to help make informed selling decisions.",
    },
    {
      icon: <Zap className="h-8 w-8 text-harvest-600" />,
      title: "Weather Forecasts",
      description: "Accurate weather predictions to plan farming activities and protect crops.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-harvest-50">

      {/* Hero Section */}
      <section className="pt-24 pb-12 md:pt-32 md:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
          <h1 
            className={`text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 ${
              animationVisible ? 'animate-slide-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.1s' }}
          >
            Connecting <span className="text-harvest-600">Farmers</span> Directly to <span className="text-harvest-600">Consumers</span>
          </h1>
          <p 
            className={`text-lg md:text-xl text-gray-600 mb-8 ${
              animationVisible ? 'animate-slide-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.3s' }}
          >
            HarvestHub eliminates middlemen by connecting farmers directly with consumers while providing AI-driven insights, government scheme information, and logistics support.
          </p>
          <div 
            className={`flex flex-col sm:flex-row gap-4 ${
              animationVisible ? 'animate-slide-up' : 'opacity-0'
            }`}
            style={{ animationDelay: '0.5s' }}
          >
            <Link 
              to="/marketplace"
              className="button-primary flex items-center justify-center md:justify-start"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link 
              to="/disease-detection" 
              className="button-secondary flex items-center justify-center md:justify-start"
            >
              <span>Try Disease Detection</span>
            </Link>
          </div>
        </div>
        <div 
          className={`lg:w-1/2 ${
            animationVisible ? 'animate-fade-in' : 'opacity-0'
          }`}
          style={{ animationDelay: '0.7s' }}
        >
          <div className="relative bg-white p-2 rounded-xl shadow-lg overflow-hidden">
            <img 
              src="https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
              alt="Farmer with fresh produce" 
              className="rounded-lg w-full h-auto"
            />
            <div className="absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg">
              <div className="flex items-center">
                <div className="bg-harvest-100 rounded-full p-2 mr-3">
                  <Sprout className="h-6 w-6 text-harvest-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Direct from Farms</h3>
                  <p className="text-xs text-gray-600">Fresh, organic and sustainably produced</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Key Features</h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Our platform brings together technology and agriculture to benefit both farmers and consumers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 ${
                animationVisible ? 'animate-slide-up' : 'opacity-0'
              }`}
              style={{ animationDelay: `${0.1 * (index + 1)}s` }}
            >
              <div className="bg-harvest-50 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* User Types Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Who Benefits</h2>
          <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
            Our platform serves multiple stakeholders in the agricultural ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-48 bg-gradient-to-r from-harvest-600 to-harvest-500 flex items-center justify-center">
              <Sprout className="h-16 w-16 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Farmers</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-harvest-600 mr-2">•</span>
                  <span className="text-gray-600">List and sell produce directly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-harvest-600 mr-2">•</span>
                  <span className="text-gray-600">AI-powered crop recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-harvest-600 mr-2">•</span>
                  <span className="text-gray-600">Access government schemes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-harvest-600 mr-2">•</span>
                  <span className="text-gray-600">Get live market price updates</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-48 bg-gradient-to-r from-blue-600 to-blue-500 flex items-center justify-center">
              <Users className="h-16 w-16 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Consumers</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-600">Buy fresh produce directly</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-600">Verify farm conditions via media</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-600">AI-powered diet recommendations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-600">Plant disease detection for home gardens</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div className="h-48 bg-gradient-to-r from-amber-600 to-amber-500 flex items-center justify-center">
              <ShoppingCart className="h-16 w-16 text-white" />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Businesses</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600">Bulk purchase from farmers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600">Subscription-based delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600">Direct connection with producers</span>
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  <span className="text-gray-600">Consistent supply of fresh produce</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Only show if user is not logged in */}
      {!user && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 mb-10">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-harvest-600 to-harvest-700 rounded-2xl p-8 md:p-12 shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-harvest-100 mb-8 max-w-2xl mx-auto">
                Join our platform today and be part of the agricultural revolution that benefits farmers and consumers alike.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  to="/dashboard" 
                  className="bg-white text-harvest-700 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Join as Farmer
                </Link>
                <Link 
                  to="/marketplace" 
                  className="bg-harvest-800 text-white hover:bg-harvest-900 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Shop as Consumer
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Company</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">About</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Careers</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Resources</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Knowledge Base</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Farming Tips</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Legal</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Privacy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Terms</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Connect</h3>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Twitter</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Facebook</a></li>
                <li><a href="#" className="text-gray-600 hover:text-harvest-600">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">© 2023 HarvestHub. All rights reserved.</p>
            <p className="text-gray-500 text-sm mt-4 md:mt-0">Made with ❤️ for farmers and consumers</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
