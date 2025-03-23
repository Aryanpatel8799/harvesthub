import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

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

interface RecentActivityProps {
  activities: Activity[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const RecentActivity = ({ activities }: RecentActivityProps) => {
  return (
    <Card className="p-6 bg-white shadow-lg rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity._id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary text-lg font-semibold">
                    {activity.farmer.fullName.charAt(0)}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{activity.farmer.fullName}</p>
                <p className="text-sm text-gray-500">{activity.farmer.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  activity.status
                )}`}
              >
                {activity.status}
              </span>
              <span className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivity; 