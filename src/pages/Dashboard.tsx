import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MarketTrends from "@/components/MarketTrends";
import AIRecommendation from "@/components/AIRecommendation";
import { Calendar, Truck, ArrowUp, ArrowDown } from "lucide-react";
import { Weather } from "@/components/Weather";

const Dashboard = () => {
  const { user } = useAuth();
  const userName = user?.fullName|| 'Farmer';
  console.log(user);
  // Sample data - in a real app, this would come from an API

  const inventoryData = {
    current: 356,
    lastWeekChange: "+5%",
    pendingOrders: 12,
    shipmentsToday: 3,
    revenue: 24560,
    revenueChange: "+18%",
  };

  const aiRecommendations = [
    {
      type: "crop" as const,
      title: "Consider planting gourd or bottle gourd next week",
      description: "Market trends and weather conditions are favorable for these crops.",
    },
    {
      type: "weather" as const,
      title: "Consider harvesting your tomato crop within 3 days",
      description: "Weather forecast indicates potential rain that could affect harvest quality.",
    },
    {
      type: "market" as const,
      title: "Current market price for organic tomatoes is 15% higher",
      description: "This is a good time to sell if you have organic tomatoes in stock.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <div className="flex-1  max-w-[1600px] mx-auto">
          {/* Header section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Welcome, {userName}! <span className="text-harvest-600">👋</span>
              </h1>
              <p className="text-gray-600">
                {new Date().toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <button className="button-primary">
                Add New Product
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Current Inventory</h3>
                <div className="bg-harvest-100 rounded-full p-2">
                  <Calendar className="h-5 w-5 text-harvest-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-gray-800">
                  {inventoryData.current} kg
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>from last week</span>
                  <span className="ml-2 flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {inventoryData.lastWeekChange}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Pending Orders</h3>
                <div className="bg-orange-100 rounded-full p-2">
                  <Truck className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-gray-800">{inventoryData.pendingOrders}</div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>{inventoryData.shipmentsToday} to ship today</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Revenue (March)</h3>
                <div className="bg-blue-100 rounded-full p-2">
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-gray-800">
                  ₹{inventoryData.revenue.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>from February</span>
                  <span className="ml-2 flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {inventoryData.revenueChange}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 gap-4 md:gap-6">
            {/* Weather and Market section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Weather and AI Suggestions section */}
              <div className="lg:col-span-1 space-y-4">
                <Weather />
                {/* AI Recommendations */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">AI Suggestions</h3>
                  <div className="space-y-3">
                    {aiRecommendations.map((recommendation, index) => (
                      <AIRecommendation
                        key={index}
                        type={recommendation.type}
                        title={recommendation.title}
                        description={recommendation.description}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Market Trends section - full width below weather on mobile, 2 columns on desktop */}
              <div className="lg:col-span-2">
                <MarketTrends currency="₹" />
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Recent Orders</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="py-3 px-4 text-sm font-medium text-gray-500">Order ID</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500">Customer</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500">Products</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500">Amount</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                      <th className="py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">#ORD-7890</td>
                      <td className="py-3 px-4 text-sm">Priya Sharma</td>
                      <td className="py-3 px-4 text-sm">Tomatoes (5kg), Onions (3kg)</td>
                      <td className="py-3 px-4 text-sm">₹680</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Pending
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-sm text-harvest-600 hover:text-harvest-700">
                          View
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">#ORD-7889</td>
                      <td className="py-3 px-4 text-sm">Rohit Patel</td>
                      <td className="py-3 px-4 text-sm">Potatoes (10kg)</td>
                      <td className="py-3 px-4 text-sm">₹450</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Completed
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-sm text-harvest-600 hover:text-harvest-700">
                          View
                        </button>
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">#ORD-7888</td>
                      <td className="py-3 px-4 text-sm">Amit Verma</td>
                      <td className="py-3 px-4 text-sm">Organic Tomatoes (2kg), Chillies (1kg)</td>
                      <td className="py-3 px-4 text-sm">₹320</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          Shipped
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-sm text-harvest-600 hover:text-harvest-700">
                          View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;