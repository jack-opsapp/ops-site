'use client';

/**
 * CheckoutPayment — Step 2 of checkout: Stripe Elements payment form.
 *
 * Uses PaymentElement (supports cards, Apple Pay, Google Pay automatically).
 * Styled with Stripe Appearance API to match OPS dark theme.
 *
 * On successful payment: calls confirm-order API route, then redirects
 * to confirmation page.
 */

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface CheckoutPaymentProps {
  orderId: string;
  totalCents: number;
  onSuccess: (orderNumber: string) => void;
  onError: (message: string) => void;
}

export default function CheckoutPayment({ orderId, totalCents, onSuccess, onError }: CheckoutPaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    });

    if (error) {
      onError(error.message ?? 'Payment failed. Please try again.');
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const res = await fetch('/api/shop/confirm-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, paymentIntentId: paymentIntent.id }),
        });
        const data = await res.json();
        if (data.success) {
          onSuccess(data.orderNumber);
        } else {
          onError(data.error ?? 'Failed to confirm order.');
        }
      } catch {
        // Payment succeeded but confirmation failed — serious edge case
        onError('Failed to confirm order. Your payment was received — please contact support.');
      }
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: 'tabs',
        }}
      />
      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-ops-text-primary text-ops-background py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ops-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ops-background"
      >
        {isProcessing ? 'Processing...' : `Pay $${(totalCents / 100).toFixed(2)}`}
      </button>
    </form>
  );
}
