import { useState } from 'react';
import { Search, Filter, Leaf, Recycle, DollarSign, MapPin, Calendar, MessageSquare } from 'lucide-react';

interface WasteListing {
  id: string;
  title: string;
  type: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  date: string;
  description: string;
  seller: {
    name: string;
    rating: number;
  };
  status: 'available' | 'pending' | 'sold';
}

const WasteMarketplace = () => {
  const [listings, setListings] = useState<WasteListing[]>([
    {
      id: 'WM001',
      title: 'Organic Compost',
      type: 'Compost',
      quantity: 500,
      unit: 'kg',
      price: 50,
      location: 'Green Valley Farm',
      date: '2024-03-20',
      description: 'High-quality organic compost made from farm waste. Perfect for organic farming.',
      seller: {
        name: 'John Smith',
        rating: 4.8
      },
      status: 'available'
    },
    {
      id: 'WM002',
      title: 'Crop Residues',
      type: 'Biomass',
      quantity: 1000,
      unit: 'kg',
      price: 30,
      location: 'Sunrise Farm',
      date: '2024-03-19',
      description: 'Wheat straw and crop residues available for composting or animal bedding.',
      seller: {
        name: 'Sarah Johnson',
        rating: 4.5
      },
      status: 'pending'
    }
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Waste Marketplace</h1>
          <p className="text-gray-600">Trade agricultural waste and byproducts sustainably</p>
        </div>
        <button className="bg-harvest-600 text-white px-6 py-2 rounded-lg hover:bg-harvest-700 transition-colors flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Create Listing
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search waste listings..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-harvest-600 focus:ring-2 focus:ring-harvest-100"
            />
          </div>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-600" />
            Filters
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <div key={listing.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-gray-800">{listing.title}</h3>
                <p className="text-sm text-gray-500">{listing.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                listing.status === 'available' ? 'bg-green-100 text-green-800' :
                listing.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Recycle className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="text-gray-800">{listing.quantity} {listing.unit}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  <p className="text-gray-800">${listing.price}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-800">{listing.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Posted</p>
                  <p className="text-gray-800">{listing.date}</p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-gray-600 text-sm">{listing.description}</p>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Seller:</span>
                <span className="text-sm font-medium text-gray-800">{listing.seller.name}</span>
                <span className="text-sm text-yellow-600">★ {listing.seller.rating}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <button className="flex-1 bg-harvest-600 text-white px-4 py-2 rounded-lg hover:bg-harvest-700 transition-colors">
                Contact Seller
              </button>
              <button className="flex-1 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WasteMarketplace;
