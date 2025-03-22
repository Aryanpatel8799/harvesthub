import React, { createContext, useContext, ReactNode } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe with your public key
const stripePromise = loadStripe('pk_test_51R5Xc3RsnrUQKVTh2l5GqLOocpxxH8pq8nXDUf0n8aeXuGGdYL371iT3xPD0eSnCZyD1tL32JZjVc5eUTsNbsLL700Mc5TPQZQ');

// Create the context
const StripeContext = createContext<{
  stripe: Promise<Stripe | null>;
}>({
  stripe: stripePromise,
});

// Create a provider component
export const StripeProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  return (
    <StripeContext.Provider value={{ stripe: stripePromise }}>
      {children}
    </StripeContext.Provider>
  );
};

// Create a custom hook to use the Stripe context
export const useStripe = () => useContext(StripeContext);

export default StripeProvider; 