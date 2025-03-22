import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProductFormProps {
  onSubmit: (formData: FormData) => void;
  onCancel: () => void;
  initialData?: EditableProduct;
}

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
  expiryDate?: string;
  discount?: number;
  discountedPrice?: number;
}

const ProductForm = ({ onSubmit, onCancel, initialData }: ProductFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>(initialData?.images?.map(img => img.url) || []);
  const [farmImages, setFarmImages] = useState<File[]>([]);
  const [previewFarmImages, setPreviewFarmImages] = useState<string[]>(initialData?.farmImages?.map(img => img.url) || []);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || 0,
    unit: initialData?.unit || '',
    category: initialData?.category || '',
    organic: initialData?.organic || false,
    rental: initialData?.rental || false,
    rentalPrice: initialData?.rentalPrice || 0,
    rentalUnit: initialData?.rentalUnit || '',
    location: initialData?.location || '',
    expiryDate: initialData?.expiryDate || '',
    discount: initialData?.discount || 0,
    discountedPrice: initialData?.discountedPrice || 0
  });

  const consumerCategories = ["Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Herbs"];
  
  const farmerCategories = ["Vegetables", "Fruits", "Grains", "Seeds", "Fertilizers", "Tools", "Equipment Rental", "Pesticides", "Irrigation"];

  const categories = user?.type === 'farmer' ? farmerCategories : consumerCategories;

  const locations = ["Nagpur", "Mumbai", "Pune", "Nashik", "Kolhapur"];

  useEffect(() => {
    if (initialData) {
      setPreviewImages(initialData.images.map(img => {
        const url = img.url;
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL}${url}`;
      }));
      setPreviewFarmImages(initialData.farmImages.map(img => {
        const url = img.url;
        if (url.startsWith('http')) return url;
        return `${import.meta.env.VITE_API_URL}${url}`;
      }));
    }
  }, [initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => {
      const newValue = type === 'number' ? Number(value) : value;
      const newState = { ...prev, [name]: newValue };
      
      // If price is being changed, recalculate discounted price
      if (name === 'price') {
        const price = Number(value);
        const discount = prev.discount || 0;
        const discountedPrice = price * (1 - (discount / 100));
        return { ...newState, discountedPrice };
      }
      return newState;
    });
  };

  // Define categories that can be rented (equipment-related categories)
  const rentableCategories = ["Tools", "Equipment Rental", "Irrigation"];
  
  // Define categories that can be organic
  const organicCategories = ["Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Herbs"];

  // Handle category change
  const handleCategoryChange = (value: string) => {
    setFormData(prev => {
      const isRentableCategory = rentableCategories.includes(value);
      const isOrganicCategory = organicCategories.includes(value);
      return {
        ...prev,
        category: value,
        // Automatically enable rental for equipment categories
        rental: isRentableCategory ? true : false,
        rentalPrice: isRentableCategory ? prev.rentalPrice || 0 : 0,
        rentalUnit: isRentableCategory ? prev.rentalUnit || 'day' : '',
        // Only allow organic for food categories
        organic: isOrganicCategory ? prev.organic : false
      };
    });
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'farm') => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast({
        title: "Error",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }

    const newImages = files.map(file => URL.createObjectURL(file));
    if (type === 'product') {
      setImages(files);
      setPreviewImages(newImages);
    } else {
      setFarmImages(files);
      setPreviewFarmImages(newImages);
    }
  };

  const removeImage = (index: number, type: 'product' | 'farm') => {
    if (type === 'product') {
      setImages(prev => prev.filter((_, i) => i !== index));
      setPreviewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setFarmImages(prev => prev.filter((_, i) => i !== index));
      setPreviewFarmImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Calculate discount based on expiry date
  const calculateDiscount = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let discount = 0;
    if (daysUntilExpiry <= 1) {
      discount = 50; // 50% discount if expiring in 1 day
    } else if (daysUntilExpiry <= 3) {
      discount = 30; // 30% discount if expiring in 2-3 days
    } else if (daysUntilExpiry <= 7) {
      discount = 15; // 15% discount if expiring in 4-7 days
    }

    return discount;
  };

  // Handle expiry date change
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpiryDate = e.target.value;
    const discount = calculateDiscount(newExpiryDate);
    const discountedPrice = formData.price * (1 - (discount / 100));
    
    setFormData(prev => ({
      ...prev,
      expiryDate: newExpiryDate,
      discount: discount,
      discountedPrice: discountedPrice
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append basic form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value.toString());
      });

      // Append product images
      images.forEach((image, index) => {
        formDataToSend.append('productImages', image);
      });

      // Append farm images
      farmImages.forEach((image, index) => {
        formDataToSend.append('farmImages', image);
      });

      // If editing, append the product ID
      if (initialData?._id) {
        formDataToSend.append('_id', initialData._id);
      }

      // Call the parent's onSubmit handler
      await onSubmit(formDataToSend);

      toast({
        title: "Success",
        description: `Product ${initialData?._id ? 'updated' : 'created'} successfully!`,
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: 0,
        unit: '',
        category: '',
        organic: false,
        rental: false,
        rentalPrice: 0,
        rentalUnit: '',
        location: '',
        expiryDate: '',
        discount: 0,
        discountedPrice: 0
      });
      setImages([]);
      setFarmImages([]);
      setPreviewImages([]);
      setPreviewFarmImages([]);

    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              step="0.01"
            />
            {formData.discount > 0 && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-gray-500 line-through">
                  Original Price: ₹{formData.price.toFixed(2)}
                </p>
                <p className="text-sm font-semibold text-green-600">
                  Discounted Price: ₹{formData.discountedPrice.toFixed(2)}
                </p>
                <p className="text-xs text-green-600">
                  Savings: ₹{(formData.price - formData.discountedPrice).toFixed(2)} ({formData.discount}% off)
                </p>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              required
              placeholder="e.g., kg, piece, dozen"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleExpiryDateChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
            {formData.discount > 0 && (
              <div className="mt-1">
                <p className="text-sm text-green-600">
                  Automatic discount: {formData.discount}% off
                </p>
                <p className="text-xs text-gray-500">
                  {formData.expiryDate && `Expires on ${new Date(formData.expiryDate).toLocaleDateString()}`}
                </p>
              </div>
            )}
          </div>

          {/* <div>
            <Label htmlFor="location">Location</Label>
            <Select
              value={formData.location}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="organic"
              checked={formData.organic}
              onCheckedChange={(checked) => handleSwitchChange('organic', checked)}
              disabled={!organicCategories.includes(formData.category)}
            />
            <Label htmlFor="organic">
              Organic Product
              {!organicCategories.includes(formData.category) && (
                <span className="ml-2 text-sm text-gray-500">(Only food items can be organic)</span>
              )}
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="rental"
              checked={formData.rental}
              onCheckedChange={(checked) => handleSwitchChange('rental', checked)}
              disabled={!rentableCategories.includes(formData.category)}
            />
            <Label htmlFor="rental">
              Available for Rental
              {!rentableCategories.includes(formData.category) && (
                <span className="ml-2 text-sm text-gray-500">(Only equipment items can be rented)</span>
              )}
            </Label>
          </div>

          {formData.rental && (
            <>
              <div>
                <Label htmlFor="rentalPrice">Rental Price</Label>
                <Input
                  id="rentalPrice"
                  name="rentalPrice"
                  type="number"
                  value={formData.rentalPrice}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <Label htmlFor="rentalUnit">Rental Unit</Label>
                <Input
                  id="rentalUnit"
                  name="rentalUnit"
                  value={formData.rentalUnit}
                  onChange={handleInputChange}
                  placeholder="e.g., day, week, month"
                />
              </div>
            </>
          )}

          <div>
            <Label>Product Images</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`}
                    alt={`Product ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'product')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previewImages.length < 5 && (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-harvest-500 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, 'product')}
                  />
                </label>
              )}
            </div>
          </div>

          <div>
            <Label>Farm Images</Label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
              {previewFarmImages.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`}
                    alt={`Farm ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index, 'farm')}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {previewFarmImages.length < 5 && (
                <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-harvest-500 transition-colors">
                  <Upload className="h-6 w-6 text-gray-400" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageChange(e, 'farm')}
                  />
                </label>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update Product" : "Add Product"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm; 