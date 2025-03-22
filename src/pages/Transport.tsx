import { useState } from 'react';
import { Truck, MapPin, Calendar, Package, Clock, DollarSign, Search, Filter } from 'lucide-react';

interface TransportRequest {
  id: string;
  pickup: string;
  delivery: string;
  date: string;
  cargo: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  price: number;
}

const Transport = () => {
  const [requests, setRequests] = useState<TransportRequest[]>([
    {
      id: 'TR001',
      pickup: 'Farm A, Rural District',
      delivery: 'City Market',
      date: '2024-03-20',
      cargo: 'Fresh Vegetables',
      status: 'pending',
      price: 250
    },
    {
      id: 'TR002',
      pickup: 'Farm B, Green Valley',
      delivery: 'Wholesale Market',
      date: '2024-03-21',
      cargo: 'Organic Fruits',
      status: 'in-transit',
      price: 300
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transport Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage your agricultural transport requests</p>
        </div>
        <button className="w-full sm:w-auto bg-harvest-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-harvest-700 transition-colors flex items-center justify-center gap-2">
          <Truck className="h-5 w-5" />
          New Transport Request
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search transport requests..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-harvest-600 focus:ring-2 focus:ring-harvest-100 text-sm sm:text-base"
            />
          </div>
          <button className="w-full sm:w-auto px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Filters
          </button>
        </div>
      </div>

      {/* Transport Requests Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {requests.map((request) => (
          <div key={request.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Request #{request.id}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{request.cargo}</p>
              </div>
              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm ${
                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                request.status === 'in-transit' ? 'bg-blue-100 text-blue-800' :
                request.status === 'delivered' ? 'bg-green-100 text-green-800' :
                'bg-red-100 text-red-800'
              }`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">From</p>
                  <p className="text-sm sm:text-base text-gray-800">{request.pickup}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">To</p>
                  <p className="text-sm sm:text-base text-gray-800">{request.delivery}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Date</p>
                  <p className="text-sm sm:text-base text-gray-800">{request.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                <div>
                  <p className="text-xs sm:text-sm text-gray-500">Price</p>
                  <p className="text-sm sm:text-base text-gray-800">${request.price}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-2">
              <button className="w-full bg-harvest-600 text-white px-4 py-2 rounded-lg hover:bg-harvest-700 transition-colors text-sm sm:text-base">
                View Details
              </button>
              <button className="w-full border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base">
                Track
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transport;
