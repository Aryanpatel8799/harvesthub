import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { Users, ShoppingBag, FileCheck, Clock, TrendingUp, ShoppingCart, CheckCircle, XCircle, FileText } from 'lucide-react';
import DetailedStats from './DetailedStats';
import RecentActivity from './RecentActivity';
import axios from 'axios';
import { Skeleton } from '@/components/ui/skeleton';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

interface DashboardStats {
  totalFarmers: number;
  totalConsumers: number;
  totalProducts: number;
  totalOrders: number;
  pendingCertifications: number;
  approvedCertifications: number;
  rejectedCertifications: number;
}

interface OrderByStatus {
  status: string;
  count: number;
}

interface MonthlyOrder {
  month: string;
  count: number;
}

interface Activity {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
  farmer: {
    fullName: string;
    email: string;
  };
}

interface Certification {
  _id: string;
  status: 'pending' | 'approved' | 'rejected';
  farmName: string;
  certificateFile: string;
  components: any[];
  createdAt: string;
  farmer: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const Dashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [ordersByStatus, setOrdersByStatus] = useState<OrderByStatus[]>([]);
  const [monthlyOrders, setMonthlyOrders] = useState<MonthlyOrder[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [pendingCertifications, setPendingCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      console.log('Fetching dashboard stats...');
      const statsResponse = await api.get('/api/soil/certifications/stats');
      if (!statsResponse.data) {
        throw new Error('No stats data received');
      }
      console.log('Dashboard stats response:', statsResponse.data);
      
      // Transform the data to match the expected interface
      const transformedStats: DashboardStats = {
        totalFarmers: statsResponse.data.totalFarmers || 0,
        totalConsumers: statsResponse.data.totalConsumers || 0,
        totalProducts: 0, // This will be handled separately if needed
        totalOrders: statsResponse.data.totalOrders || 0,
        pendingCertifications: statsResponse.data.pendingCertifications || 0,
        approvedCertifications: statsResponse.data.approvedCertifications || 0,
        rejectedCertifications: statsResponse.data.rejectedCertifications || 0
      };
      setStats(transformedStats);

      console.log('Fetching pending certifications...');
      const certificationsResponse = await api.get('/api/soil/certifications/pending');
      if (!certificationsResponse.data) {
        throw new Error('No certifications data received');
      }
      setPendingCertifications(certificationsResponse.data);
      console.log('Pending certifications:', certificationsResponse.data);

      // Transform orders data from the stats response
      if (statsResponse.data.orders) {
        const orderStatusData = [
          { status: 'Pending', count: statsResponse.data.orders.pending || 0 },
          { status: 'Completed', count: statsResponse.data.orders.completed || 0 },
          { status: 'Cancelled', count: statsResponse.data.orders.cancelled || 0 }
        ];
        setOrdersByStatus(orderStatusData);
        console.log('Orders by status:', orderStatusData);
      }

      // Get recent activity
      console.log('Fetching recent activity...');
      const activityResponse = await api.get('/api/soil/certifications/recent-activity');
      if (!activityResponse.data) {
        throw new Error('No activity data received');
      }
      setRecentActivity(activityResponse.data);
      console.log('Recent activity:', activityResponse.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      let errorMessage = 'Failed to fetch dashboard data';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          errorMessage = 'Dashboard data not found. Please check API endpoints.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        console.error('Axios error details:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to handle updating certification status
  const handleUpdateStatus = async (certificationId: string, status: 'approved' | 'rejected') => {
    try {
      // Define type for the data object to include optional rejectionReason
      interface UpdateStatusData {
        status: 'approved' | 'rejected';
        rejectionReason?: string;
      }
      
      let data: UpdateStatusData = { status };
      
      // If rejecting, prompt for reason
      if (status === 'rejected') {
        const reason = window.prompt('Please provide a reason for rejection:');
        if (!reason) return; // Cancel if no reason provided
        data.rejectionReason = reason;
      }
      
      console.log(`Updating certification ${certificationId} to ${status}`);
      
      // Use the exact endpoint from soilDetailsRoutes.js
      const response = await api.put(`/api/soil/certifications/${certificationId}`, data);
      console.log('Update response:', response.data);
      
      toast({
        title: 'Status Updated',
        description: `Certification has been ${status}`,
        variant: 'default'
      });
      
      // Refresh dashboard data
      fetchDashboardData();
      
    } catch (error) {
      console.error('Error updating certification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update certification status',
        variant: 'destructive'
      });
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const formatMonthlyData = monthlyOrders.map(item => ({
    name: item.month,
    orders: item.count
  }));

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
        >
          Refresh Data
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white shadow-lg rounded-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Farmers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalFarmers || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white shadow-lg rounded-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-green-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Consumers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalConsumers || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white shadow-lg rounded-lg border-l-4 border-purple-500">
          <div className="flex items-center">
            <FileCheck className="h-8 w-8 text-purple-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-white shadow-lg rounded-lg border-l-4 border-yellow-500">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-500" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending Certifications</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingCertifications || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Certification Section */}
      <h2 className="text-2xl font-bold mb-4 mt-8">Pending Certifications</h2>
      
      {pendingCertifications.length === 0 ? (
        <Card className="mb-6 p-6 flex items-center justify-center">
          <div className="text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No pending certifications</h3>
            <p className="text-gray-500">All farmer certifications have been processed</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {pendingCertifications.map(cert => (
            <Card key={cert._id} className="overflow-hidden">
              <CardHeader className="pb-2 flex flex-row justify-between items-start">
                <div>
                  <CardTitle>{cert.farmName}</CardTitle>
                  <CardDescription>
                    {cert.farmer ? 
                      `Submitted by: ${cert.farmer.fullName} (${cert.farmer.email})` : 
                      'Farmer information unavailable'}
                  </CardDescription>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  cert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  cert.status === 'approved' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {cert.status.charAt(0).toUpperCase() + cert.status.slice(1)}
                </span>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-3">
                  Submitted: {new Date(cert.createdAt).toLocaleDateString()}
                </div>
                <div className="flex justify-between mt-4">
                  <a 
                    href={`${api.defaults.baseURL}/uploads/certificates/${cert.certificateFile}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                  >
                    View Certificate
                  </a>
                  <div className="space-x-2">
                    <button 
                      onClick={() => handleUpdateStatus(cert._id, 'approved')}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus(cert._id, 'rejected')}
                      className="px-3 py-1 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Detailed Statistics */}
      {stats && <DetailedStats stats={stats} />}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Orders Chart */}
        <Card className="p-6 bg-white shadow-lg rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Monthly Certifications</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={formatMonthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Orders by Status Chart */}
        {ordersByStatus.length > 0 && (
          <Card className="p-6 bg-white shadow-lg rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Certification Status Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ordersByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {ordersByStatus.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 gap-6">
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  );
};

export default Dashboard; 