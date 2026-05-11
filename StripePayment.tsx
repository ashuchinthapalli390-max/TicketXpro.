import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Loader2, Lock, ShieldCheck } from 'lucide-react';
import { createPaymentIntent } from '../../services/api';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface CheckoutFormProps {
  bookingId: string;
  amount: number;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({ bookingId, amount, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isDummy, setIsDummy] = useState(false);

  useEffect(() => {
    const initPayment = async () => {
      try {
        const response = await createPaymentIntent(bookingId);
        setClientSecret(response.data.clientSecret);
        setIsDummy(!!response.data.dummy);
      } catch (err: any) {
        console.error('Payment intent error:', err);
        onError('Failed to initialize payment gateway.');
      }
    };
    initPayment();
  }, [bookingId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isDummy) {
      setIsProcessing(true);
      // Simulate network delay
      setTimeout(() => {
        onSuccess({ id: 'dummy_txn_' + Date.now(), status: 'succeeded' });
      }, 2000);
      return;
    }

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    });

    if (result.error) {
      onError(result.error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      if (result.paymentIntent.status === 'succeeded') {
        onSuccess(result.paymentIntent);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Card Details</label>
        <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 focus-within:border-primary transition-colors">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '14px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 text-gray-400 text-[10px] uppercase font-black tracking-widest justify-center">
        <Lock size={12} className="text-primary" /> 
        SECURE 256-BIT SSL ENCRYPTED PAYMENT
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing || !clientSecret}
        className="w-full py-5 bg-primary text-white font-black rounded-2xl hover:opacity-90 transition-all uppercase text-[10px] tracking-[0.3em] shadow-2xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Processing...
          </>
        ) : (
          `Authorize ₹${amount}`
        )}
      </button>
      
      <div className="flex items-center justify-center gap-4 pt-4">
        <div className="flex items-center gap-1.5 grayscale opacity-50">
           <ShieldCheck size={14} />
           <span className="text-[8px] font-black uppercase">PCI DSS Compliant</span>
        </div>
        <div className="w-px h-3 bg-gray-200 dark:bg-gray-800" />
        <div className="flex items-center gap-1.5 grayscale opacity-50">
           <span className="text-[8px] font-black uppercase">Safe & Secure</span>
        </div>
      </div>
    </form>
  );
};

export const StripePayment: React.FC<CheckoutFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  );
};
