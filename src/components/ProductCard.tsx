import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart, Key, Image, Star, StarHalf, User, Video } from "lucide-react";
import { useState } from "react";
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
          totalPrice: price * quantity,
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

      toast({
        title: "Success",
        description: "Order placed successfully! The farmer will review your order.",
      });

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

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <img
            src={image || '/placeholder.jpg'}
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
              <div className="flex items-center gap-1">
                <ShoppingCart className="h-4 w-4 text-gray-500" />
                <span>{totalOrders} orders</span>
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
                <p className="text-sm text-gray-500">₹{price.toFixed(2)}</p>
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
                <p className="text-lg font-bold">₹{(price * quantity).toFixed(2)}</p>
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
            {step === 'details' && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="mr-auto"
              >
                Back
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDialogClose}
            >
              Cancel
            </Button>
            <Button
              onClick={step === 'quantity' ? handleNext : handlePurchase}
              disabled={isSubmitting || (step === 'details' && (!consumerDetails.phone || !consumerDetails.address))}
            >
              {isSubmitting 
                ? 'Processing...' 
                : step === 'quantity'
                  ? 'Next'
                  : (rental ? 'Rent Now' : 'Buy Now')}
            </Button>
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
                    src={`${import.meta.env.VITE_API_URL}/uploads/products${image.url}`}
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
          
          <div className="space-y-8 py-4">
            {/* Basic Info */}
            <div className="flex items-start gap-6 bg-gray-50 p-6 rounded-lg">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{farmerName}</h3>
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <span className="inline-block w-4 h-4">📍</span>
                  {location}
                </p>
                <div className="mt-4 flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-harvest-600" />
                    <span className="text-gray-700 font-medium">{totalOrders} Orders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-gray-700 font-medium">{rating.toFixed(1)} Rating</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Farm Photos */}
            {farmImages && farmImages.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-harvest-600" />
                  Farm Photos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmImages.map((image, index) => (
                    <div key={index} className="relative group rounded-lg overflow-hidden">
                      <img
                        src={`/uploads/products${image.url}`}
                        alt={image.caption || `Farm photo ${index + 1}`}
                        className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
                          <p className="text-white text-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Farm Videos */}
            {farmVideos && farmVideos.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-harvest-600" />
                  Farming Videos
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {farmVideos.map((video, index) => (
                    <div key={index} className="space-y-2">
                      <div className="relative rounded-lg overflow-hidden bg-gray-100">
                        <video
                          src={`${import.meta.env.VITE_API_URL}/uploads/products${video.url}`}
                          controls
                          className="w-full aspect-video"
                          poster="/video-placeholder.jpg"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                      {video.caption && (
                        <p className="text-gray-700 text-sm">{video.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Media Message */}
            {(!farmImages?.length && !farmVideos?.length) && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <Image className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No photos or videos available yet.</p>
              </div>
            )}
          </div>

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
