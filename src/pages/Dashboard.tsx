import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import MarketTrends from "@/components/MarketTrends";
import AIRecommendation from "@/components/AIRecommendation";
import { Calendar, Truck, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { Weather } from "@/components/Weather";
import { useToast } from "@/components/ui/use-toast";

interface Order {
  _id: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  consumer?: {
    _id: string;
    fullName: string;
  };
  consumerDetails?: {
    fullName: string;
    phone: string;
    address: string;
  };
  product: {
    _id: string;
    name: string;
    price: number;
    unit: string;
    imageUrl?: string;
  };
  quantity: number;
  createdAt: string;
  formattedCreatedAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const userName = user?.fullName || 'Farmer';
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Calculated stats
  const [stats, setStats] = useState({
    pendingOrders: 0,
    totalRevenue: 0,
    shipmentsToday: 0,
    revenueChange: "+0%"
  });

  // AI recommendations remain static for now
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

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        
        // Determine which endpoint to use based on user role
        const endpoint = user?.type === 'farmer' 
          ? `${import.meta.env.VITE_API_URL}/api/orders/farmer`
          : `${import.meta.env.VITE_API_URL}/api/orders/consumer`;
        
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch orders');
        }
        
        const data = await response.json();
        if (data.success && data.orders) {
          setOrders(data.orders);
          
          // Calculate dashboard statistics
          calculateStats(data.orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch orders. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchOrders();
    }
  }, [user, toast]);
  
  // Calculate statistics from orders
  const calculateStats = (orderData: Order[]) => {
    // Count pending orders
    const pendingCount = orderData.filter(order => 
      order.status === 'pending'
    ).length;
    
    // Calculate total revenue from completed orders
    const completedOrders = orderData.filter(order => 
      order.status === 'completed' || 
      (order.status === 'accepted' && order.paymentStatus === 'paid')
    );
    
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + (order.totalPrice || 0), 
      0
    );
    
    // Count shipments scheduled for today
    const today = new Date().toISOString().split('T')[0];
    const shipmentsToday = orderData.filter(order => 
      order.status === 'accepted' && 
      order.createdAt.split('T')[0] === today
    ).length;
    
    // For simplicity, we'll use a static revenue change percentage
    // In a real app, you would compare with previous month/week
    
    setStats({
      pendingOrders: pendingCount,
      totalRevenue,
      shipmentsToday,
      revenueChange: "+18%" // Static for now
    });
  };

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
                  356 kg
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>from last week</span>
                  <span className="ml-2 flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    +5%
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
                <div className="text-3xl font-bold text-gray-800">{stats.pendingOrders}</div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>{stats.shipmentsToday} to ship today</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Revenue (This Month)</h3>
                <div className="bg-blue-100 rounded-full p-2">
                  <ArrowUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-gray-800">
                  ₹{stats.totalRevenue.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-sm text-gray-500">
                  <span>from last month</span>
                  <span className="ml-2 flex items-center text-green-600">
                    <ArrowUp className="h-3 w-3 mr-1" />
                    {stats.revenueChange}
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-700">Recent Orders</h3>
                {orders.length > 0 && (
                  <button 
                    onClick={() => window.open('/orders-history', '_blank')}
                    className="text-sm text-harvest-600 hover:text-harvest-700 flex items-center"
                  >
                    View All
                    <ArrowUp className="h-3 w-3 ml-1 rotate-45" />
                  </button>
                )}
              </div>
              
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-harvest-600" />
                  <span className="ml-2 text-gray-600">Loading orders...</span>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-6 text-gray-500">
                  <p>No orders found. Start shopping to see your orders here!</p>
                  <button 
                    onClick={() => window.open('/marketplace', '_blank')}
                    className="mt-3 px-4 py-2 bg-harvest-600 text-white rounded-md hover:bg-harvest-700 transition-colors text-sm"
                  >
                    Browse Marketplace
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {(user?.type === 'farmer' ? orders.slice(0, 3) : orders.slice(0, 5)).map((order) => (
                    <div 
                      key={order._id} 
                      className={`border ${order.status === 'pending' ? 'border-yellow-200' : order.status === 'completed' ? 'border-green-200' : 'border-gray-200'} rounded-lg p-4 hover:bg-gray-50 transition-colors`}
                    >
                      {user?.type === 'farmer' ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                              {order.product?.imageUrl ? (
                                <img 
                                  src={order.product.imageUrl} 
                                  alt={order.product.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Calendar className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-medium text-gray-800">
                                {order.consumerDetails?.fullName || 'Customer'}
                              </span>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500">Order #{order._id.substring(0, 6)}</span>
                                <span className="text-sm text-gray-500">•</span>
                                <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-sm font-medium text-gray-800">₹{order.totalPrice?.toFixed(2) || '0.00'}</p>
                              <span className={`px-2 py-0.5 text-xs font-medium rounded-full 
                                ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                  order.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                  'bg-blue-100 text-blue-700'}`}
                              >
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </span>
                            </div>
                            <button 
                              onClick={() => window.open(`/order-details/${order._id}`, '_blank')}
                              className="px-3 py-1.5 bg-harvest-50 text-harvest-700 border border-harvest-200 rounded-md hover:bg-harvest-100 transition-colors text-sm font-medium"
                            >
                              View
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">Order #{order._id.substring(0, 6)}</span>
                              <span className="text-sm text-gray-500">•</span>
                              <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full 
                              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                                order.status === 'completed' || (order.status === 'accepted' && order.paymentStatus === 'paid') ? 'bg-green-100 text-green-700' : 
                                order.status === 'accepted' ? 'bg-blue-100 text-blue-700' : 
                                'bg-red-100 text-red-700'}`}
                            >
                              {order.status === 'accepted' && order.paymentStatus !== 'paid' 
                                ? 'Payment Pending'
                                : order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                          
                          <div className="flex items-start space-x-4">
                            <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                              {order.product?.imageUrl ? (
                                <img 
                                  src={order.product.imageUrl} 
                                  alt={order.product.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Calendar className="h-6 w-6" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 mb-1">
                                {order.product?.name || 'Product'}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm text-gray-600">
                                <span>Quantity: {order.quantity || 1} {order.product?.unit || 'kg'}</span>
                                <span>•</span>
                                <span>₹{(order.product?.price || 0).toFixed(2)}/{order.product?.unit || 'kg'}</span>
                              </div>
                              <div className="mt-2 font-medium text-gray-900">
                                Total: ₹{order.totalPrice?.toFixed(2) || '0.00'}
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end space-y-2">
                              <button 
                                onClick={() => window.open(`/order-details/${order._id}`, '_blank')}
                                className="px-4 py-2 bg-harvest-50 text-harvest-700 border border-harvest-200 rounded-md hover:bg-harvest-100 transition-colors text-sm font-medium"
                              >
                                Order Details
                              </button>
                              {order.status === 'accepted' && order.paymentStatus !== 'paid' && (
                                <button 
                                  onClick={() => window.open(`/checkout?orderId=${order._id}&amount=${order.totalPrice}`, '_blank')}
                                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
                                >
                                  Complete Payment
                                </button>
                              )}
                            </div>
                          </div>
                          
                          {order.status === 'pending' && (
                            <div className="mt-3 pt-2 border-t border-gray-100 text-sm text-gray-500 flex items-center">
                              <Loader2 className="h-3 w-3 animate-spin mr-2 text-yellow-600" />
                              Waiting for farmer to accept your order
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;