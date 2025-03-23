import { Card } from '@/components/ui/card';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface DetailedStatsProps {
  stats: {
    totalFarmers: number;
    totalConsumers: number;
    totalOrders: number;
    pendingCertifications: number;
    approvedCertifications: number;
    rejectedCertifications: number;
  };
}

const DetailedStats = ({ stats }: DetailedStatsProps) => {
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? ((value / total) * 100).toFixed(1) : '0';
  };

  const totalCertifications = 
    (stats.pendingCertifications || 0) + 
    (stats.approvedCertifications || 0) + 
    (stats.rejectedCertifications || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* User Statistics */}
      <Card className="p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">User Statistics</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Farmers</span>
              <span className="text-green-600 font-semibold">{stats.totalFarmers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2"
                style={{ width: `${calculatePercentage(stats.totalFarmers, stats.totalFarmers + stats.totalConsumers)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Consumers</span>
              <span className="text-blue-600 font-semibold">{stats.totalConsumers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 rounded-full h-2"
                style={{ width: `${calculatePercentage(stats.totalConsumers, stats.totalFarmers + stats.totalConsumers)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Certification Status */}
      <Card className="p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Certification Status</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Pending</span>
              <span className="text-yellow-600 font-semibold">{stats.pendingCertifications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-500 rounded-full h-2"
                style={{ width: `${calculatePercentage(stats.pendingCertifications, totalCertifications)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Approved</span>
              <span className="text-green-600 font-semibold">{stats.approvedCertifications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 rounded-full h-2"
                style={{ width: `${calculatePercentage(stats.approvedCertifications, totalCertifications)}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Rejected</span>
              <span className="text-red-600 font-semibold">{stats.rejectedCertifications}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-red-500 rounded-full h-2"
                style={{ width: `${calculatePercentage(stats.rejectedCertifications, totalCertifications)}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6 bg-white shadow-lg rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="space-y-4">
          <button className="w-full py-2 px-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
            View Pending Certifications
          </button>
          <button className="w-full py-2 px-4 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors">
            Manage Users
          </button>
          <button className="w-full py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
            Generate Reports
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DetailedStats; 