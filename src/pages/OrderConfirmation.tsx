import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, ShoppingCart } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

interface OrderDetails {
  _id: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  product: {
    name: string;
    price: number;
    imageUrl: string;
  };
  quantity: number;
  createdAt: string;
}

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [error, setError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"success" | "failed" | "processing" | "unknown">("unknown");

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const orderId = searchParams.get("orderId");
    const paymentIntentId = searchParams.get("payment_intent");
    const redirectStatus = searchParams.get("redirect_status");

    if (!orderId) {
      setError("Order ID not found in URL");
      setLoading(false);
      return;
    }

    // Set payment status based on redirect parameters
    if (redirectStatus === "succeeded") {
      setPaymentStatus("success");
    } else if (redirectStatus === "processing") {
      setPaymentStatus("processing");
    } else if (redirectStatus === "failed" || redirectStatus === "requires_payment_method") {
      setPaymentStatus("failed");
    }

    // Fetch order details
    const fetchOrderDetails = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching order ${orderId} from ${import.meta.env.VITE_API_URL}/api/orders/${orderId}`);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        if (!response.ok) {
          // Get the error text for more details
          const errorText = await response.text();
          let errorMessage = '';
          
          try {
            // Try to parse error as JSON
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorText;
          } catch {
            // If not valid JSON, use the raw text
            errorMessage = errorText;
          }
          
          if (response.status === 404) {
            throw new Error("Order not found. Please check your order ID.");
          } else if (response.status === 401) {
            throw new Error("You need to be logged in to view this order. Please log in and try again.");
          } else if (response.status === 403) {
            throw new Error("You are not authorized to view this order. It may belong to another user.");
          } else {
            throw new Error(`Failed to fetch order: ${errorMessage}`);
          }
        }

        // Try to parse the response as JSON
        let data;
        try {
          data = await response.json();
        } catch (jsonError) {
          console.error('Error parsing JSON:', jsonError);
          throw new Error('The server returned an invalid response. Please try again later.');
        }

        // Handle different response formats - the order might be directly in the response or in a data field
        const orderData = data.order || data;
        console.log("Order data received:", orderData);
        setOrder(orderData);
        
        // Set payment status based on order data if not already set by redirect status
        if (!redirectStatus) {
          if (orderData.paymentStatus === "paid") {
            setPaymentStatus("success");
          } else if (orderData.paymentStatus === "processing") {
            setPaymentStatus("processing");
          } else if (orderData.paymentStatus === "failed" || orderData.paymentStatus === "not_paid") {
            setPaymentStatus("failed");
          }
        }
        
        // If we came from a successful payment, update the status
        if (paymentStatus === "success" && paymentIntentId) {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/payments/status/${orderId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: 'include',
            });
          } catch (updateError) {
            console.error('Error updating payment status:', updateError);
            // Continue anyway - this is just an update, not critical
          }
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
        
        // Show toast for better visibility
        toast({
          variant: "destructive",
          title: "Error fetching order",
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location.search, toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-700">Checking your order status...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">{error || "We couldn't find your order. Please contact customer support."}</p>
          
          <div className="space-y-3">
            <Button
              onClick={() => navigate("/marketplace")}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              Return to Marketplace
            </Button>
            
            {error && error.includes("not authorized") && (
              <Button
                onClick={() => navigate("/login")}
                variant="outline"
                className="w-full border-blue-600 text-blue-600 hover:bg-blue-50"
              >
                Log In
              </Button>
            )}
            
            {error && error.includes("not found") && (
              <Button
                onClick={() => navigate("/profile")}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                View My Orders
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
        {paymentStatus === "success" ? (
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Payment Successful!</h2>
            <p className="text-gray-600">Your order has been placed successfully.</p>
          </div>
        ) : paymentStatus === "processing" ? (
          <div className="text-center mb-8">
            <Loader2 className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-800">Payment Processing</h2>
            <p className="text-gray-600">Your payment is being processed. We'll update you once it's complete.</p>
          </div>
        ) : (
          <div className="text-center mb-8">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Payment Failed</h2>
            <p className="text-gray-600 mb-6">Your payment could not be processed. Please try again.</p>
            <Button
              onClick={() => navigate(`/checkout?orderId=${order._id}&amount=${order.totalPrice}`)}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded"
            >
              Retry Payment
            </Button>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Order ID:</span>
            <span className="font-medium">{order?._id}</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Date:</span>
            <span className="font-medium">
              {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between text-gray-600 mb-2">
            <span>Status:</span>
            <span className="font-medium capitalize">{order?.status || 'pending'}</span>
          </div>
          <div className="flex justify-between text-gray-600 mb-6">
            <span>Payment Status:</span>
            <span 
              className={`font-medium capitalize ${
                order?.paymentStatus === "paid" 
                  ? "text-green-600" 
                  : order?.paymentStatus === "pending" 
                  ? "text-yellow-600" 
                  : "text-red-600"
              }`}
            >
              {order?.paymentStatus || 'pending'}
            </span>
          </div>
        </div>

        {order?.product && (
          <div className="border-t border-gray-200 pt-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Product</h3>
            <div className="flex items-center py-3 border-b border-gray-100 last:border-b-0">
              <div className="h-16 w-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {order.product?.imageUrl ? (
                  <img 
                    src={order.product.imageUrl} 
                    alt={order.product.name} 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <ShoppingCart className="h-8 w-8 text-gray-400 m-4" />
                )}
              </div>
              <div className="ml-4 flex-1">
                <h4 className="text-gray-800 font-medium">{order.product?.name || 'Product'}</h4>
                <div className="flex justify-between text-gray-600 text-sm mt-1">
                  <span>₹{order.product?.price?.toFixed(2) || '0.00'} × {order.quantity || 1}</span>
                  <span className="font-medium">₹{((order.product?.price || 0) * (order.quantity || 1)).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-gray-800 font-bold text-lg mb-6">
            <span>Total:</span>
            <span>₹{order?.totalPrice?.toFixed(2) || '0.00'}</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => navigate("/marketplace")}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              Continue Shopping
            </Button>
            <Button 
              onClick={() => navigate("/profile")}
              variant="outline"
              className="flex-1 border-green-600 text-green-600 hover:bg-green-50"
            >
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 