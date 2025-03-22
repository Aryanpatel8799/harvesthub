import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { ArrowRight, Leaf, Shield, Sprout } from "lucide-react";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-harvest-700 to-harvest-800 text-white">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Empowering Farmers with Smart Technology
            </h1>
            <p className="text-lg md:text-xl text-harvest-100 mb-8">
              Join our platform to access real-time market prices, weather insights, and connect directly with buyers.
            </p>
            {!user && (
              <div className="flex justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-harvest-700 hover:bg-harvest-50">
                    Get Started
                  </Button>
                </Link>
                <Link href="/marketplace">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-harvest-700">
                    Explore Market
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose HarvestHub?</h2>
          <p className="text-lg text-gray-600">Discover the benefits of our integrated farming platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Farming</h3>
            <p className="text-gray-600">Get live market price updates</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Disease Detection</h3>
            <p className="text-gray-600">Plant disease detection for home gardens</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Direct Sales</h3>
            <p className="text-gray-600">Consistent supply of fresh produce</p>
          </div>
        </div>
      </div>

      {/* CTA Section - Only show if user is not logged in */}
      {!user && (
        <div className="bg-harvest-700 text-white">
          <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-16">
            <div className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg text-harvest-100 mb-8">
                Join our platform today and be part of the agricultural revolution that benefits farmers and consumers alike.
              </p>
              <div className="flex justify-center gap-4">
                <Link href="/auth/signup?type=farmer">
                  <Button size="lg" className="bg-white text-harvest-700 hover:bg-harvest-50">
                    Join as Farmer
                  </Button>
                </Link>
                <Link href="/auth/signup?type=consumer">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-harvest-700">
                    Shop as Consumer
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home; 