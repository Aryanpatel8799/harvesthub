import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Video, ShoppingCart, Star, MapPin } from "lucide-react";

interface FarmerProfileFormProps {
  initialData?: {
    fullName: string;
    location: string;
    description: string;
    farmImages: Array<{ url: string; caption: string }>;
    farmVideos: Array<{ url: string; caption: string }>;
    totalOrders?: number;
    rating?: number;
  };
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const FarmerProfileForm = ({ initialData, onSubmit, onCancel }: FarmerProfileFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [videos, setVideos] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>(
    initialData?.farmImages?.map(img => img.url) || []
  );
  const [previewVideos, setPreviewVideos] = useState<string[]>(
    initialData?.farmVideos?.map(vid => vid.url) || []
  );
  const [videoCaptions, setVideoCaptions] = useState<string[]>(
    initialData?.farmVideos?.map(vid => vid.caption || '') || []
  );
  const [imageCaptions, setImageCaptions] = useState<string[]>(
    initialData?.farmImages?.map(img => img.caption || '') || []
  );
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    location: initialData?.location || '',
    description: initialData?.description || ''
  });

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalImages = images.length + newFiles.length;
    
    if (totalImages > 5) {
      toast({
        title: "Error",
        description: "You can only upload up to 5 images in total.",
        variant: "destructive",
      });
      return;
    }

    const newImagePreviews = newFiles.map(file => URL.createObjectURL(file));
    setImages(prev => [...prev, ...newFiles]);
    setPreviewImages(prev => [...prev, ...newImagePreviews]);
    setImageCaptions(prev => [...prev, ...newFiles.map(() => '')]);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    const totalVideos = videos.length + newFiles.length;
    
    if (totalVideos > 3) {
      toast({
        title: "Error",
        description: "You can only upload up to 3 videos in total.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 100MB per video)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    const oversizedFiles = newFiles.filter(file => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      toast({
        title: "Error",
        description: "Videos must be under 100MB each.",
        variant: "destructive",
      });
      return;
    }

    const newVideoPreviews = newFiles.map(file => URL.createObjectURL(file));
    setVideos(prev => [...prev, ...newFiles]);
    setPreviewVideos(prev => [...prev, ...newVideoPreviews]);
    setVideoCaptions(prev => [...prev, ...newFiles.map(() => '')]);
  };

  const handleCaptionChange = (index: number, caption: string, type: 'image' | 'video') => {
    if (type === 'video') {
      setVideoCaptions(prev => {
        const newCaptions = [...prev];
        newCaptions[index] = caption;
        return newCaptions;
      });
    } else {
      setImageCaptions(prev => {
        const newCaptions = [...prev];
        newCaptions[index] = caption;
        return newCaptions;
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    setImageCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setPreviewVideos(prev => prev.filter((_, i) => i !== index));
    setVideoCaptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append basic form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      // Append farm images with captions
      images.forEach((image, index) => {
        formDataToSend.append('farmImages', image);
        formDataToSend.append('imageCaptions', imageCaptions[index] || '');
      });

      // Append farm videos with captions
      videos.forEach((video, index) => {
        formDataToSend.append('farmVideos', video);
        formDataToSend.append('videoCaptions', videoCaptions[index] || '');
      });

      await onSubmit(formDataToSend);

      toast({
        title: "Success",
        description: "Profile updated successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Stats */}
      <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-harvest-600" />
            <span className="text-sm font-medium">{initialData?.totalOrders || 0} Orders</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <span className="text-sm font-medium">{initialData?.rating?.toFixed(1) || '0.0'} Rating</span>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description">Farm Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Tell us about your farm and farming practices..."
            rows={4}
          />
        </div>
      </div>

      {/* Farm Photos */}
      <div>
        <Label>Farm Photos (Max 5)</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previewImages.map((url, index) => (
            <div key={index} className="relative group bg-white p-4 rounded-lg border border-gray-200">
              <img
                src={getImageUrl(url)}
                alt={`Farm ${index + 1}`}
                className="w-full h-48 object-cover rounded-md mb-2"
              />
              <Input
                placeholder="Add a caption for this photo"
                value={imageCaptions[index] || ''}
                onChange={(e) => handleCaptionChange(index, e.target.value, 'image')}
                className="mb-2"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {previewImages.length < 5 && (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-harvest-500 transition-colors">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Photo</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Farm Videos */}
      <div>
        <Label>Farm Videos (Max 3)</Label>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previewVideos.map((url, index) => (
            <div key={index} className="relative group bg-white p-4 rounded-lg border border-gray-200">
              <video
                src={url}
                controls
                className="w-full h-48 object-cover rounded-md mb-2"
              />
              <Input
                placeholder="Add a caption for this video"
                value={videoCaptions[index] || ''}
                onChange={(e) => handleCaptionChange(index, e.target.value, 'video')}
                className="mb-2"
              />
              <button
                type="button"
                onClick={() => removeVideo(index)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          {previewVideos.length < 3 && (
            <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-harvest-500 transition-colors">
              <Video className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Video</span>
              <input
                type="file"
                className="hidden"
                accept="video/*"
                multiple
                onChange={handleVideoChange}
              />
            </label>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Profile'}
        </Button>
      </div>
    </form>
  );
};

export default FarmerProfileForm; 