import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface OrderStatusProps {
  orderId: string;
  productId: string;
  productName: string;
  farmerName: string;
  status: string;
  quantity: number;
  totalPrice: number;
  createdAt: string;
  hasReviewed: boolean;
  onStatusUpdate?: () => void;
}

interface Review {
  rating: number;
  comment: string;
}

const OrderStatus = ({
  orderId,
  productId,
  productName,
  farmerName,
  status,
  quantity,
  totalPrice,
  createdAt,
  hasReviewed,
  onStatusUpdate
}: OrderStatusProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [review, setReview] = useState<Review>({
    rating: 5,
    comment: ''
  });
  const [newStatus, setNewStatus] = useState(status);
  const [rejectionReason, setRejectionReason] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-500';
      case 'accepted':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleStatusUpdate = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to update order status",
        variant: "destructive",
      });
      return;
    }

    if (user.type !== 'farmer') {
      toast({
        title: "Error",
        description: "Only farmers can update order status",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const requestBody = {
        status: newStatus,
        ...(newStatus === 'rejected' && { rejectionReason })
      };

      const url = `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`;
      console.log('Making PUT request to:', url);
      console.log('Request Body:', requestBody);

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Failed to update order status: ${response.status}`);
      }

      const data = await response.json().catch(() => ({ status: newStatus }));
      console.log('Success response:', data);

      setNewStatus(data.status || newStatus);
      setShowStatusDialog(false);
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });

      if (onStatusUpdate) {
        onStatusUpdate();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to update order status',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

    if (user.type !== 'consumer') {
      toast({
        title: "Error",
        description: "Only consumers can submit reviews",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          rating: review.rating,
          comment: review.comment,
          orderId: orderId
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
      
      // Trigger a refresh of the parent component
      if (onStatusUpdate) {
        onStatusUpdate();
      }
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
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{productName}</h3>
          <p className="text-sm text-gray-500">from {farmerName}</p>
        </div>
        <Badge className={getStatusColor(status)}>{status}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Order ID</p>
          <p className="font-medium">{orderId}</p>
        </div>
        <div>
          <p className="text-gray-500">Quantity</p>
          <p className="font-medium">{quantity}</p>
        </div>
        <div>
          <p className="text-gray-500">Total Price</p>
          <p className="font-medium">₹{totalPrice.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500">Order Date</p>
          <p className="font-medium">{new Date(createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {user?.type === 'farmer' && status !== 'completed' && status !== 'rejected' && (
        <div className="pt-4">
          <Button
            onClick={() => setShowStatusDialog(true)}
            className="w-full"
            variant="outline"
          >
            Update Status
          </Button>
        </div>
      )}

      {status === 'completed' && !hasReviewed && user?.type === 'consumer' && (
        <div className="pt-4">
          <Button
            onClick={() => setShowReviewDialog(true)}
            className="w-full"
            variant="outline"
          >
            Write a Review
          </Button>
        </div>
      )}

      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Update Order Status</DialogTitle>
            <DialogDescription>
              Change the status of this order
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'rejected' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Rejection Reason</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  rows={3}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              disabled={isSubmitting || (newStatus === 'rejected' && !rejectionReason.trim())}
              type="button"
            >
              {isSubmitting ? 'Updating...' : 'Update Status'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Write a Review</DialogTitle>
            <DialogDescription>
              Share your experience with {productName} from {farmerName}
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
    </div>
  );
};

export default OrderStatus; 