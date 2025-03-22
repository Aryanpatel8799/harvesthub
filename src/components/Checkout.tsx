import { useState, useEffect } from "react";
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
  AddressElement,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CheckoutFormProps {
  orderId: string;
  amount: number;
}

export default function CheckoutForm({ orderId, amount }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    // Check for payment intent status on return from redirect
    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?orderId=${orderId}`,
        receipt_email: email,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "An error occurred during payment processing");
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: error.message || "An error occurred during payment processing",
        });
      } else {
        setMessage("An unexpected error occurred.");
        toast({
          variant: "destructive",
          title: "Payment failed",
          description: "An unexpected error occurred during payment processing",
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Complete Your Purchase</h2>
        <p className="text-gray-600 mb-2">Amount: ₹{amount.toFixed(2)}</p>
        <p className="text-gray-600 mb-4">Order ID: {orderId}</p>
      </div>
      
      <LinkAuthenticationElement
        id="link-authentication-element"
        onChange={(e) => setEmail(e.value.email)}
        className="mb-4"
      />
      
      <PaymentElement id="payment-element" className="mb-6" />
      
      <AddressElement options={{mode: 'shipping'}} className="mb-6" />
      
      <Button 
        disabled={isLoading || !stripe || !elements} 
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          `Pay ₹${amount.toFixed(2)}`
        )}
      </Button>
      
      {message && <div className="mt-4 text-center text-sm text-gray-600">{message}</div>}
    </form>
  );
} 