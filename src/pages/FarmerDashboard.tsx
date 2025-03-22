import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Clock, Package } from "lucide-react";

interface Order {
  _id: string;
  productId: string;
  product: {
    name: string;
    price: number;
    unit: string;
  };
  quantity: number;
  totalPrice: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  consumerDetails: {
    fullName: string;
    phone: string;
    address: string;
    deliveryInstructions?: string;
  };
  createdAt: string;
}

const FarmerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/farmer`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, newStatus: 'accepted' | 'rejected' | 'completed') => {
    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            status: newStatus,
            rejectionReason: newStatus === 'rejected' ? rejectionReason : undefined,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      toast({
        title: "Success",
        description: `Order ${newStatus} successfully!`,
      });

      // Update the order in the local state
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === orderId
            ? { ...order, status: newStatus }
            : order
        )
      );

      setShowDetailsDialog(false);
      setRejectionReason("");
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Rejected</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Completed</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Order Management</CardTitle>
          <CardDescription>
            Manage and track all your product orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No orders found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total Price</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-mono">{order._id.slice(-8)}</TableCell>
                    <TableCell>{order.product.name}</TableCell>
                    <TableCell>{order.quantity} {order.product.unit}</TableCell>
                    <TableCell>₹{order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>{order.consumerDetails.fullName}</TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowDetailsDialog(true);
                        }}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Review order details and update status
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Product Details</h4>
                  <p>Name: {selectedOrder.product.name}</p>
                  <p>Quantity: {selectedOrder.quantity} {selectedOrder.product.unit}</p>
                  <p>Price per unit: ₹{selectedOrder.product.price}</p>
                  <p>Total Price: ₹{selectedOrder.totalPrice}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Customer Details</h4>
                  <p>Name: {selectedOrder.consumerDetails.fullName}</p>
                  <p>Phone: {selectedOrder.consumerDetails.phone}</p>
                  <p>Address: {selectedOrder.consumerDetails.address}</p>
                  {selectedOrder.consumerDetails.deliveryInstructions && (
                    <p>Instructions: {selectedOrder.consumerDetails.deliveryInstructions}</p>
                  )}
                </div>
              </div>

              {selectedOrder.status === 'pending' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'accepted')}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Accept Order
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'rejected')}
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Order
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rejection Reason</label>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Enter reason for rejection (required for rejecting orders)"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {selectedOrder.status === 'accepted' && (
                <Button
                  onClick={() => handleStatusUpdate(selectedOrder._id, 'completed')}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Mark as Completed
                </Button>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDetailsDialog(false);
                setRejectionReason("");
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDashboard; 