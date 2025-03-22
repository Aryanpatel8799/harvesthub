import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart, Key, Image, Star, StarHalf, User, Video, MapPin, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export interface ProductCardProps {
  _id: string;
  name: string;
  image: string;
  price: number;
  unit: string;
  rating: number;
  farmerName: string;
  farmerId: string;
  location: string;
  organic: boolean;
  rental: boolean;
  rentalPrice?: number;
  rentalUnit?: string;
  farmImages?: Array<{ url: string; caption: string }>;
  farmVideos?: Array<{ url: string; caption: string }>;
  totalOrders?: number;
  discount?: number;
  description?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ConsumerDetails {
  fullName: string;
  phone: string;
  address: string;
  deliveryInstructions?: string;
}

interface Review {
  rating: number;
  comment: string;
}

interface FarmerDetails {
  _id: string;
  fullName: string;
  email: string;
  location: string;
  description: string;
  farmImages: Array<{ url: string; caption: string }>;
  farmVideos: Array<{ url: string; caption: string }>;
  totalOrders: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

const ProductCard = ({
  _id,
  name,
  image,
  price,
  unit,
  rating = 0,
  farmerName = 'Unknown Farmer',
  farmerId,
  location = 'Unknown Location',
  organic = false,
  rental = false,
  rentalPrice,
  rentalUnit,
  farmImages = [],
  farmVideos = [],
  totalOrders = 0,
  discount = 0,
  description = '',
  onEdit,
  onDelete
}: ProductCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showFarmPhotosDialog, setShowFarmPhotosDialog] = useState(false);
  const [showFarmerProfileDialog, setShowFarmerProfileDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [displayedTotalOrders, setDisplayedTotalOrders] = useState(totalOrders);
  const [consumerDetails, setConsumerDetails] = useState<ConsumerDetails>({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    deliveryInstructions: ''
  });
  const [step, setStep] = useState<'quantity' | 'details'>('quantity');
  const [review, setReview] = useState<Review>({
    rating: 5,
    comment: ''
  });
  const [farmerDetails, setFarmerDetails] = useState<FarmerDetails | null>(null);
  const [loadingFarmer, setLoadingFarmer] = useState(false);

  const getImageUrl = (url: string) => {
    if (!url) return '/placeholder.jpg';
    if (url.startsWith('http')) return url;
    return `${import.meta.env.VITE_API_URL}${url}`;
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onDelete) return;

    try {
      if (window.confirm('Are you sure you want to delete this product?')) {
        await onDelete();
      }
    } catch (error) {
      console.error('Error in delete handler:', error);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!onEdit) return;

    try {
      onEdit();
    } catch (error) {
      console.error('Error in edit handler:', error);
    }
  };

  const handlePurchase = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to make a purchase",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const actualPrice = discount > 0 ? price * (1 - discount / 100) : price;
      const totalPrice = actualPrice * quantity;

      // Create the order first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          productId: _id,
          farmerId,
          quantity,
          totalPrice,
          consumerDetails: {
            ...consumerDetails,
            fullName: consumerDetails.fullName || user.fullName
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to place order');
      }

      // Get the order ID from the response (handle both possible formats)
      const orderId = data.order?._id || data.data?._id;
      
      if (!orderId) {
        throw new Error('Order ID not found in response');
      }

      // Redirect to the checkout page with the order ID and amount
      window.location.href = `/checkout?orderId=${orderId}&amount=${totalPrice}`;
      
      setShowPurchaseDialog(false);
      setStep('quantity');
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step === 'quantity') {
      setStep('details');
    }
  };

  const handleBack = () => {
    if (step === 'details') {
      setStep('quantity');
    }
  };

  const handleDialogClose = () => {
    setShowPurchaseDialog(false);
    setStep('quantity');
  };

  const handleReviewSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to submit a review",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${_id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      toast({
        title: "Success",
        description: "Review submitted successfully!",
      });

      setShowReviewDialog(false);
      // Reset review form
      setReview({ rating: 5, comment: '' });
    } catch (error) {
      console.error('Review submission error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (count: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setReview(prev => ({ ...prev, rating: index + 1 }))}
            className={`${index < review.rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
          >
            <Star className="w-6 h-6 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  const fetchFarmerDetails = async () => {
    if (!farmerId) return;
    
    try {
      setLoadingFarmer(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/farmers/${farmerId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch farmer details');
      }

      const data = await response.json();
      if (data.farmer) {
        setFarmerDetails(data.farmer);
        
        // Make sure we're using the most up-to-date totalOrders and rating from the server
        if (typeof data.farmer.totalOrders === 'number') {
          setDisplayedTotalOrders(data.farmer.totalOrders);
        }
      }
    } catch (error) {
      console.error('Error fetching farmer details:', error);
      toast({
        title: "Error",
        description: "Failed to load farmer details",
        variant: "destructive",
      });
    } finally {
      setLoadingFarmer(false);
    }
  };

  // Make sure we update the displayed totalOrders when the prop changes
  useEffect(() => {
    if (typeof totalOrders === 'number') {
      setDisplayedTotalOrders(totalOrders);
    }
  }, [totalOrders]);

  // Fetch farmer details when profile dialog opens
  useEffect(() => {
    if (showFarmerProfileDialog) {
      fetchFarmerDetails();
    }
  }, [showFarmerProfileDialog]);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={getImageUrl(image)}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder.jpg';
            }}
          />
          {organic && (
            <Badge className="absolute top-2 right-2 bg-green-500">
              Organic
            </Badge>
          )}
          {rental && (
            <Badge className="absolute top-2 left-2 bg-blue-500">
              Rental Available
            </Badge>
          )}
        </div>

        <CardHeader className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-lg">{name}</h3>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <User className="h-4 w-4" />
                <span>{farmerName}</span>
              </div>
            </div>
            {(onEdit || onDelete) && (
              <div className="flex gap-2">
                {onEdit && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleEdit}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex flex-col">
              {discount > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-green-600">
                      ₹{((price * (100 - discount)) / 100).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">/{unit}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 line-through">
                      ₹{price.toFixed(2)}
                    </span>
                    <span className="text-sm font-semibold text-green-600">
                      ({discount}% off)
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">₹{price.toFixed(2)}</span>
                  <span className="text-sm text-gray-500">/{unit}</span>
                </div>
              )}
            </div>
            {rental && rentalPrice && rentalUnit && (
              <div className="text-sm text-blue-600 font-medium">
                Rent: ₹{rentalPrice.toFixed(2)}/{rentalUnit}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
        
            </div>
            <span className="text-gray-500">{location}</span>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          {user?.type === 'consumer' && (
            <>
              <Button
                className="flex-1" 
                variant="default"
                onClick={() => setShowPurchaseDialog(true)}
              >
                {rental ? (
                  <>
                    <Key className="w-4 h-4 mr-2" />
                    Rent Now
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Buy Now
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFarmerProfileDialog(true)}
                className="flex-shrink-0"
                title="View Farmer Profile"
              >
                <User className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFarmPhotosDialog(true)}
                className="flex-shrink-0"
                title="View Farm Photos"
              >
                <Image className="w-4 h-4" />
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <Dialog open={showPurchaseDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rental ? 'Rent Product' : 'Purchase Product'}</DialogTitle>
            <DialogDescription>
              {step === 'quantity' 
                ? (rental ? 'Enter the rental details below' : 'Enter the quantity you want to purchase')
                : 'Enter your delivery details'}
            </DialogDescription>
          </DialogHeader>
          
          {step === 'quantity' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product</label>
                <p className="text-sm text-gray-500">{name}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Price per {unit}</label>
                {discount > 0 ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 line-through">₹{price.toFixed(2)}</p>
                    <p className="text-sm font-semibold text-green-600">
                      ₹{(price * (1 - discount / 100)).toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600">
                      You save: {discount}% off
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">₹{price.toFixed(2)}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="quantity" className="text-sm font-medium">
                  Quantity ({unit})
                </label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Total Price</label>
                {discount > 0 ? (
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 line-through">
                      ₹{(price * quantity).toFixed(2)}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      ₹{(price * (1 - discount / 100) * quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-green-600">
                      Total savings: ₹{(price * (discount / 100) * quantity).toFixed(2)}
                    </p>
                  </div>
                ) : (
                  <p className="text-lg font-bold">₹{(price * quantity).toFixed(2)}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={consumerDetails.fullName}
                  onChange={(e) => setConsumerDetails(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input
                  value={consumerDetails.phone}
                  onChange={(e) => setConsumerDetails(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter your phone number"
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Address</label>
                <Textarea
                  value={consumerDetails.address}
                  onChange={(e) => setConsumerDetails(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter your delivery address"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Delivery Instructions (Optional)</label>
                <Textarea
                  value={consumerDetails.deliveryInstructions}
                  onChange={(e) => setConsumerDetails(prev => ({ ...prev, deliveryInstructions: e.target.value }))}
                  placeholder="Any special delivery instructions?"
                  rows={2}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {step === 'quantity' ? (
              <>
                <Button variant="outline" onClick={handleDialogClose} className="mr-auto">
                  Cancel
                </Button>
                <Button onClick={handleNext}>
                  Next
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleBack} disabled={isSubmitting} className="mr-auto">
                  Back
                </Button>
                <Button 
                  onClick={handlePurchase} 
                  disabled={isSubmitting || !consumerDetails.phone || !consumerDetails.address}
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    `Proceed to Payment`
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFarmPhotosDialog} onOpenChange={setShowFarmPhotosDialog}>
        <DialogContent className="max-w-[90vw] max-h-[85vh] w-full overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Farm Photos</DialogTitle>
            <DialogDescription className="text-base">
              View photos of {farmerName}'s farm
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
            {farmImages && farmImages.length > 0 ? (
              farmImages.map((image, index) => (
                <div key={index} className="relative aspect-[4/3] group">
                  <img
                    src={getImageUrl(image.url)}
                    alt={image.caption || `Farm photo ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                      <p className="text-white text-base">
                        {image.caption}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-500">
                <Image className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">No farm photos available</p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFarmPhotosDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {name} from {farmerName}'s farm
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rating</label>
              <div className="flex items-center gap-2">
                {renderStars(review.rating)}
                <span className="text-sm text-gray-500">({review.rating} of 5)</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Review</label>
              <Textarea
                value={review.comment}
                onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your thoughts about this product..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={isSubmitting || !review.comment.trim()}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showFarmerProfileDialog} onOpenChange={setShowFarmerProfileDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Farmer Profile</DialogTitle>
            <DialogDescription>
              Learn more about {farmerName} and their farming practices
            </DialogDescription>
          </DialogHeader>
          
          {loadingFarmer ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-harvest-600"></div>
            </div>
          ) : farmerDetails ? (
            <div className="space-y-8 py-4">
              {/* Basic Info Card */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="bg-harvest-50 p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3">
                      <h3 className="text-2xl font-semibold text-gray-900">{farmerDetails.fullName}</h3>
                      <p className="text-gray-600 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-harvest-600" />
                        {farmerDetails.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        Member since {new Date(farmerDetails.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <div className="bg-white rounded-full p-3 shadow-sm">
                          <ShoppingCart className="w-6 h-6 text-harvest-600" />
                        </div>
                        <p className="mt-1 font-semibold">{displayedTotalOrders}</p>
                        <p className="text-sm text-gray-600">Orders</p>
                      </div>
                      <div className="text-center">
                        <div className="bg-white rounded-full p-3 shadow-sm">
                          <Star className="w-6 h-6 text-yellow-400" />
                        </div>
                        <p className="mt-1 font-semibold">
                          {farmerDetails.rating ? farmerDetails.rating.toFixed(1) : "0.0"}
                        </p>
                        <p className="text-sm text-gray-600">Rating</p>
                      </div>
                    </div>
                  </div>
                </div>

                {farmerDetails.description && (
                  <div className="p-6 border-t border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">About the Farm</h4>
                    <p className="text-gray-600 leading-relaxed">{farmerDetails.description}</p>
                  </div>
                )}
              </div>

              {/* Farm Photos Section */}
              <div className="bg-white shadow-md rounded-xl overflow-hidden">
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Image className="w-5 h-5 text-harvest-600" />
                    Farm Photos
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {farmerDetails.farmImages && farmerDetails.farmImages.length > 0 ? (
                      farmerDetails.farmImages.map((image, index) => (
                        <div key={index} className="relative aspect-video group">
                          <img
                            src={getImageUrl(image.url)}
                            alt={image.caption || `Farm photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg shadow-sm transition-transform duration-300 group-hover:scale-[1.02]"
                          />
                          {image.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-lg">
                              <p className="text-white text-sm">
                                {image.caption}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="col-span-2 flex flex-col items-center justify-center py-12 text-gray-400">
                        <Image className="w-12 h-12 mb-3 opacity-50" />
                        <p className="text-lg">No farm photos available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Farm Videos Section */}
              {farmerDetails.farmVideos && farmerDetails.farmVideos.length > 0 && (
                <div className="bg-white shadow-md rounded-xl overflow-hidden">
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Video className="w-5 h-5 text-harvest-600" />
                      Farm Videos ({farmerDetails.farmVideos.length})
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {farmerDetails.farmVideos.map((video, index) => {
                        // Generate a unique key for each video
                        const videoKey = `${farmerDetails._id}-video-${index}-${video.url}`;
                        const videoUrl = getImageUrl(video.url);
                        
                        return (
                          <div key={videoKey} className="relative aspect-video bg-black rounded-lg overflow-hidden">
                            <video
                              src={videoUrl}
                              controls
                              preload="metadata"
                              controlsList="nodownload"
                              className="w-full h-full object-contain"
                              poster="/video-placeholder.jpg"
                            >
                              <source src={videoUrl} type="video/mp4" />
                              <source src={videoUrl} type="video/webm" />
                              Your browser does not support the video tag.
                            </video>
                            {video.caption && (
                              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <p className="text-white text-sm font-medium">
                                  {video.caption}
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Failed to load farmer details. Please try again.
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFarmerProfileDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductCard;
