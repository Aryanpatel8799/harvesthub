import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Search, Filter, SlidersHorizontal, Plus, User } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductForm from "@/components/ProductForm";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import FarmerProfileForm from "@/components/FarmerProfileForm";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  organic: boolean;
  rental: boolean;
  rentalPrice?: number;
  rentalUnit?: string;
  location: string;
  images: Array<{ url: string; caption: string }>;
  farmImages: Array<{ url: string; caption: string }>;
  farmVideos: Array<{ url: string; caption: string }>;
  farmer: {
    fullName: string;
    location: string;
    _id: string;
    totalOrders: number;
  };
  rating: number;
  discount: number;
  expiryDate: string;
}

// Add a new interface for the edit form
interface EditableProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  organic: boolean;
  rental: boolean;
  rentalPrice?: number;
  rentalUnit?: string;
  location: string;
  images: Array<{ url: string; caption: string }>;
  farmImages: Array<{ url: string; caption: string }>;
}

const Marketplace = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showFarmerProfileForm, setShowFarmerProfileForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<EditableProduct | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    organic: false,
    rental: false,
    minPrice: "",
    maxPrice: "",
    location: ""
  });

  // Consumer categories
  const consumerCategories = ["Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Herbs"];
  
  // Farmer categories
  const farmerCategories = ["Seeds", "Fertilizers", "Tools", "Equipment Rental", "Pesticides", "Irrigation"];

  // Determine categories based on user type
  const categories = user?.type === 'farmer' ? farmerCategories : consumerCategories;

  const locations = ["Nagpur", "Mumbai", "Pune", "Nashik", "Kolhapur"];

  // Fetch products
  const fetchProducts = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.organic) queryParams.append('organic', 'true');
      if (filters.rental) queryParams.append('rental', 'true');
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
      if (filters.location) queryParams.append('location', filters.location);
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products?${queryParams}`,
        { credentials: 'include' }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      
      // Check if data.products exists and is an array
      if (data.products && Array.isArray(data.products)) {
        // Ensure all required fields exist before setting state
        const validProducts = data.products.filter(product => 
          product && 
          product._id && 
          product.farmer && 
          product.farmer._id && 
          product.farmer.fullName
        );
        setProducts(validProducts);
      } else {
        console.error('Invalid products data:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [filters, searchTerm]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      organic: false,
      rental: false,
      minPrice: "",
      maxPrice: "",
      location: ""
    });
  };

  const handleProductSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    fetchProducts();
  };

  const handleEditProduct = (product: Product) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "You must be logged in to edit products",
        variant: "destructive",
      });
      return;
    }

    // Verify product ownership
    if (user._id !== product.farmer._id) {
      toast({
        title: "Error",
        description: "You can only edit your own products",
        variant: "destructive",
      });
      return;
    }

    // Convert Product to EditableProduct
    const productToEdit: EditableProduct = {
      _id: product._id,
      name: product.name,
      description: product.description,
      price: product.price,
      unit: product.unit,
      category: product.category,
      organic: product.organic,
      rental: product.rental,
      rentalPrice: product.rentalPrice,
      rentalUnit: product.rentalUnit,
      location: product.location,
      images: product.images || [],
      farmImages: product.farmImages || []
    };

    setEditingProduct(productToEdit);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (productId: string, farmerId: string) => {
    if (!user?._id) {
      toast({
        title: "Error",
        description: "You must be logged in to delete products",
        variant: "destructive",
      });
      return;
    }

    // Verify product ownership
    if (user._id !== farmerId) {
      toast({
        title: "Error",
        description: "You can only delete your own products",
        variant: "destructive",
      });
      return;
    }

    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      let data;
      try {
        data = await response.json();
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Failed to delete product');
      }

      if (data?.success) {
        // Remove from state only if delete was successful
        setProducts(prevProducts => prevProducts.filter(p => p._id !== productId));

        toast({
          title: "Success",
          description: data.message || "Product deleted successfully!",
        });

        // Refresh the products list
        fetchProducts();
      } else {
        throw new Error(data?.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to reset all modal states
  const resetModalStates = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setShowFilters(false);
  };

  const getImageUrl = (product: Product) => {
    if (!product.images || product.images.length === 0) {
      return '/placeholder-product.jpg';
    }
    return `${import.meta.env.VITE_API_URL}${product.images[0].url}`;
  };

  const getFarmImageUrl = (product: Product) => {
    if (!product.farmImages || product.farmImages.length === 0) {
      return '/placeholder-farm.jpg';
    }
    return `${import.meta.env.VITE_API_URL}${product.farmImages[0].url}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero section */}
        <div className="py-8 md:py-12">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {user?.type === 'farmer' 
                  ? 'Farm Supplies & Equipment Marketplace' 
                  : 'Fresh Farm Produce Marketplace'}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl">
                {user?.type === 'farmer'
                  ? 'Browse and purchase high-quality farming supplies, rent equipment, and find everything you need for successful farming.'
                  : 'Browse and purchase fresh, high-quality produce directly from local farmers. Support sustainable agriculture and enjoy farm-to-table freshness.'}
              </p>
            </div>
            {user?.type === 'farmer' && (
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFarmerProfileForm(true)}
                  className="flex items-center px-4 py-2 bg-white border border-harvest-600 text-harvest-600 rounded-md hover:bg-harvest-50 transition-colors"
                >
                  <User className="w-5 h-5 mr-2" />
                  My Profile
                </button>
                <button
                  onClick={() => setShowProductForm(true)}
                  className="flex items-center px-4 py-2 bg-harvest-600 text-white rounded-md hover:bg-harvest-700 transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Product
                </button>
              </div>
            )}
          </div>

          {/* Search and filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="input-field pl-10 w-full"
                placeholder={user?.type === 'farmer' 
                  ? "Search for supplies, equipment or rentals..." 
                  : "Search for products, farmers or locations..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              className="md:w-auto flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5 mr-2" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-8 animate-slide-down">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-1/3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category}`}
                          name="category"
                          checked={filters.category === category}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-harvest-600 focus:ring-harvest-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`category-${category}`}
                          className="ml-2 text-sm text-gray-600"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:w-1/3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      name="minPrice"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                      className="input-field w-full"
                      placeholder="Min"
                    />
                    <span className="text-gray-500">to</span>
                    <input
                      type="number"
                      name="maxPrice"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                      className="input-field w-full"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div className="md:w-1/3">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Locations</h3>
                  <div className="space-y-2">
                    {locations.map((location) => (
                      <div key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`location-${location}`}
                          name="location"
                          checked={filters.location === location}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-harvest-600 focus:ring-harvest-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor={`location-${location}`}
                          className="ml-2 text-sm text-gray-600"
                        >
                          {location}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleResetFilters}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md text-sm mr-2"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="bg-harvest-600 hover:bg-harvest-700 text-white px-4 py-2 rounded-md text-sm"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Product sorting */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="text-sm text-gray-500 mb-4 sm:mb-0">
              Showing {products.length} products
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Sort by:</span>
              <select className="input-field text-sm py-1">
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Rating: High to Low</option>
              </select>
            </div>
          </div>

          {/* Products grid */}
          <div className="relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                // Only render if we have all required data
                if (!product?.farmer?._id) return null;

                const isOwner = user?.type === 'farmer' && user?._id === product.farmer._id;
                const imageUrl = getImageUrl(product);
                
                return (
                  <ProductCard
                    key={product._id}
                    _id={product._id}
                    name={product.name}
                    image={imageUrl}
                    price={product.price}
                    unit={product.unit}
                    rating={product.rating}
                    farmerName={product.farmer.fullName}
                    farmerId={product.farmer._id}
                    location={product.location}
                    organic={product.organic}
                    rental={product.rental}
                    rentalPrice={product.rentalPrice}
                    rentalUnit={product.rentalUnit}
                    farmImages={product.farmImages}
                    farmVideos={product.farmVideos}
                    totalOrders={product.farmer.totalOrders}
                    discount={product.discount}
                    onEdit={isOwner ? () => handleEditProduct(product) : undefined}
                    onDelete={isOwner ? async () => {
                      try {
                        if (!product._id || !product.farmer?._id) {
                          throw new Error("Invalid product data");
                        }
                        if (window.confirm('Are you sure you want to delete this product?')) {
                          await handleDeleteProduct(product._id, product.farmer._id);
                        }
                      } catch (error) {
                        console.error('Error in delete handler:', error);
                        toast({
                          title: "Error",
                          description: "Failed to delete product. Please try again.",
                          variant: "destructive",
                        });
                      }
                    } : undefined}
                  />
                );
              })}
            </div>

            {/* Overlay when form is open */}
            {showProductForm && (
              <div 
                className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
                onClick={resetModalStates}
              />
            )}
          </div>
        </div>
      </div>

      {/* Product Form Modal using Dialog component */}
      <Dialog open={showProductForm} onOpenChange={(open) => !open && resetModalStates()}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update your product details below.' : 'Fill in the details to add a new product.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            initialData={editingProduct}
            onSubmit={async (formData) => {
              try {
                if (!user?._id) {
                  throw new Error('You must be logged in to perform this action');
                }

                const url = editingProduct?._id
                  ? `${import.meta.env.VITE_API_URL}/api/products/${editingProduct._id}`
                  : `${import.meta.env.VITE_API_URL}/api/products`;
                
                const method = editingProduct?._id ? 'PUT' : 'POST';

                console.log('Submitting form data:', formData);
                
                const response = await fetch(url, {
                  method,
                  body: formData,
                  credentials: 'include',
                  headers: {
                    // Don't set Content-Type for FormData
                  }
                });

                let data;
                try {
                  data = await response.json();
                } catch (error) {
                  console.error('Error parsing response:', error);
                  throw new Error('Failed to parse server response');
                }

                console.log('Server response:', data);

                if (!response.ok) {
                  throw new Error(data?.message || 'Failed to save product');
                }

                if (data?.success) {
                  toast({
                    title: "Success",
                    description: `Product ${editingProduct ? 'updated' : 'created'} successfully!`,
                  });

                  // Update the products list with the new/updated product
                  if (editingProduct) {
                    setProducts(prevProducts => 
                      prevProducts.map(p => 
                        p._id === data.product._id ? data.product : p
                      )
                    );
                  } else {
                    setProducts(prevProducts => [data.product, ...prevProducts]);
                  }

                  resetModalStates();
                  // Refresh the products list to ensure we have the latest data
                  fetchProducts();
                } else {
                  throw new Error(data?.message || 'Failed to save product');
                }
              } catch (error) {
                console.error('Error saving product:', error);
                toast({
                  title: "Error",
                  description: error instanceof Error ? error.message : "Failed to save product",
                  variant: "destructive",
                });
              }
            }}
            onCancel={resetModalStates}
          />
        </DialogContent>
      </Dialog>

      {/* Filters Dialog */}
      <Dialog open={showFilters} onOpenChange={(open) => !open && setShowFilters(false)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Filter Products</DialogTitle>
            <DialogDescription className="text-gray-500">
              Customize your product search with filters
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      name="category"
                      checked={filters.category === category}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-harvest-600 focus:ring-harvest-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="ml-2 text-sm text-gray-600"
                    >
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Price Range</h3>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  name="minPrice"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="input-field w-full"
                  placeholder="Min"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="input-field w-full"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Locations</h3>
              <div className="space-y-2">
                {locations.map((location) => (
                  <div key={location} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`location-${location}`}
                      name="location"
                      checked={filters.location === location}
                      onChange={handleFilterChange}
                      className="h-4 w-4 text-harvest-600 focus:ring-harvest-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`location-${location}`}
                      className="ml-2 text-sm text-gray-600"
                    >
                      {location}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 text-sm font-medium text-white bg-harvest-600 hover:bg-harvest-700 rounded-md"
            >
              Apply Filters
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Farmer Profile Form Dialog */}
      <Dialog open={showFarmerProfileForm} onOpenChange={(open) => !open && setShowFarmerProfileForm(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>My Farmer Profile</DialogTitle>
            <DialogDescription>
              Update your profile information, farm photos, and videos.
            </DialogDescription>
          </DialogHeader>
          <FarmerProfileForm
            initialData={{
              fullName: user?.fullName || '',
              location: user?.location || '',
              description: user?.description || '',
              farmImages: user?.farmImages || [],
              farmVideos: user?.farmVideos || []
            }}
            onSubmit={async (formData) => {
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/farmers/profile`, {
                  method: 'PUT',
                  body: formData,
                  credentials: 'include'
                });

                const data = await response.json();

                if (!response.ok) {
                  throw new Error(data.message || 'Failed to update profile');
                }

                toast({
                  title: "Success",
                  description: "Profile updated successfully!",
                });

                setShowFarmerProfileForm(false);
                // Refresh the page or update user context if needed
              } catch (error) {
                console.error('Error updating profile:', error);
                toast({
                  title: "Error",
                  description: error instanceof Error ? error.message : "Failed to update profile",
                  variant: "destructive",
                });
              }
            }}
            onCancel={() => setShowFarmerProfileForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;
