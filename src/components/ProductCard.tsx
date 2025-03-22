import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShoppingCart, Key, Image } from "lucide-react";
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
  onEdit?: () => void;
  onDelete?: () => void;
}

interface ConsumerDetails {
  fullName: string;
  phone: string;
  address: string;
  deliveryInstructions?: string;
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
  onEdit,
  onDelete
}: ProductCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showFarmPhotosDialog, setShowFarmPhotosDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [consumerDetails, setConsumerDetails] = useState<ConsumerDetails>({
    fullName: user?.fullName || '',
    phone: '',
    address: '',
    deliveryInstructions: ''
  });
  const [step, setStep] = useState<'quantity' | 'details'>('quantity');

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
          {(onEdit || onDelete) && (
            <div className="absolute top-2 right-2 flex gap-2 z-10">
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white"
                  onClick={handleEdit}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 bg-white/80 hover:bg-white text-red-500 hover:text-red-600"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
        <CardHeader className="p-4">
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-gray-500">{farmerName}</p>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <span className="text-2xl font-bold">₹{price.toFixed(2)}</span>
              <span className="text-sm text-gray-500 ml-1">/{unit}</span>
            </div>
            {rental && rentalPrice && rentalUnit && (
              <div className="text-sm text-blue-600">
                Rent: ₹{rentalPrice.toFixed(2)}/{rentalUnit}
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
            </div>
            <span className="text-sm text-gray-500">{location}</span>
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
                    src={`${import.meta.env.VITE_API_URL}${image.url}`}
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
    </>
  );
};

export default ProductCard;
