import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { useStripe as useStripeContext } from "@stripe/react-stripe-js";
import { useAuth } from "@/context/AuthContext";
import CheckoutForm from "@/components/Checkout";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe('pk_test_51R5Xc3RsnrUQKVTh8gmSSelddvy8wtZDd4ejsEiiDeuvMNN5X0kntRr9Ppvyx4LKVzOY6qjm3EFowbk9M1bw6wG100cL307Fkr');

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [orderId, setOrderId] = useState("");
  const [amount, setAmount] = useState(0);
  const [error, setError] = useState("");
  const [isSecureContext, setIsSecureContext] = useState(true);

  // Check if using HTTP instead of HTTPS
  useEffect(() => {
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      setIsSecureContext(false);
      toast({
        variant: "destructive",
        title: "Insecure Connection",
        description: "Stripe requires HTTPS for live payments. This is a development environment only.",
      });
    }
  }, [toast]);

  useEffect(() => {
    // Make sure user is authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    // Extract order details from URL
    const searchParams = new URLSearchParams(location.search);
    const orderIdParam = searchParams.get("orderId");
    const amountParam = searchParams.get("amount");

    if (!orderIdParam || !amountParam) {
      toast({
        variant: "destructive",
        title: "Invalid checkout request",
        description: "Missing order information. Please try again."
      });
      navigate("/marketplace");
      return;
    }

    setOrderId(orderIdParam);
    setAmount(parseFloat(amountParam));

    // Create a payment intent
    const createPaymentIntent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payments/create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify({ 
            orderId: orderIdParam,
            customerId: user?._id || '',
          }),
        });

        if (response.status === 403) {
          throw new Error("Access denied. You don't have permission to make this payment.");
        }

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = "Failed to create payment intent";
          
          try {
            // Try to parse as JSON if possible
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If not valid JSON, use a portion of the text
            errorMessage = errorText.substring(0, 100) || errorMessage;
          }
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        // Handle different response formats
        const clientSecret = data.clientSecret || (data.success && data.client_secret);
        
        if (!clientSecret) {
          throw new Error("Invalid response from payment server. Missing client secret.");
        }
        
        setClientSecret(clientSecret);
      } catch (err: any) {
        console.error("Payment intent error:", err);
        setError(err.message || "Failed to initialize payment");
        toast({
          variant: "destructive",
          title: "Payment setup failed",
          description: err.message || "Failed to initialize payment"
        });
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [isAuthenticated, location.search, navigate, toast, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <Loader2 className="h-12 w-12 animate-spin text-green-600 mb-4" />
        <p className="text-gray-700">Preparing your checkout experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Payment Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md font-medium"
          >
            Return to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      {!isSecureContext && (
        <div className="w-full max-w-md mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-yellow-700">
            Using Stripe in development mode over HTTP. For production, HTTPS is required.
          </p>
        </div>
      )}
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        {clientSecret ? (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#22c55e',
                  colorBackground: '#ffffff',
                  colorText: '#1f2937',
                  colorDanger: '#ef4444',
                  fontFamily: 'system-ui, sans-serif',
                  borderRadius: '8px',
                },
              },
            }}
          >
            <CheckoutForm orderId={orderId} amount={amount} />
          </Elements>
        ) : (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
            <p>Loading payment form...</p>
          </div>
        )}
      </div>
    </div>
  );
} 