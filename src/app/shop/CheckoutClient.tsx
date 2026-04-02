'use client';

/**
 * CheckoutClient — Orchestrates the stepped checkout flow.
 *
 * Two steps: Shipping → Payment.
 * Left column (60%): active step form. Right column (40%): sticky order summary.
 *
 * Step transitions use Framer Motion AnimatePresence with directional slide:
 * Shipping exits left, Payment enters right. Easing: project standard.
 * Reduced motion: opacity fade only.
 *
 * Redirects to /shop if cart is empty.
 * Loads Stripe Elements with OPS dark theme appearance.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useCartStore } from '@/lib/stores/cart';
import { theme } from '@/lib/theme';
import CheckoutShipping from '@/components/shop/CheckoutShipping';
import CheckoutPayment from '@/components/shop/CheckoutPayment';
import OrderSummary from '@/components/shop/OrderSummary';
import type { ShippingAddress, ShopShippingMethod } from '@/lib/shop/types';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface CheckoutClientProps {
  shippingMethods: ShopShippingMethod[];
}

type CheckoutStep = 'shipping' | 'payment';

export default function CheckoutClient({ shippingMethods }: CheckoutClientProps) {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const shouldReduceMotion = useReducedMotion();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Payment state (populated after shipping step)
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingCents, setShippingCents] = useState<number>(0);
  const [taxCents, setTaxCents] = useState<number>(0);
  const [totalCents, setTotalCents] = useState<number>(0);

  // Redirect to shop if cart is empty
  if (items.length === 0 && step === 'shipping') {
    router.push('/shop');
    return null;
  }

  const handleShippingContinue = async (address: ShippingAddress, email: string, shippingMethodId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/shop/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
          shippingAddress: address,
          shippingMethodId,
          email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to create payment. Please try again.');
        setIsLoading(false);
        return;
      }

      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setShippingCents(data.shippingCents);
      setTaxCents(data.taxCents);
      setTotalCents(data.totalCents);
      setStep('payment');
    } catch {
      setError('Network error. Please try again.');
    }

    setIsLoading(false);
  };

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/shop/confirmation?order=${orderId}`);
  };

  const handlePaymentError = (message: string) => {
    setError(message);
  };

  const stepIndicators = [
    { key: 'shipping', label: 'Shipping', number: 1 },
    { key: 'payment', label: 'Payment', number: 2 },
    { key: 'confirm', label: 'Confirm', number: 3 },
  ];

  const stepVariants = shouldReduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        initial: (direction: number) => ({ opacity: 0, x: direction * 20 }),
        animate: { opacity: 1, x: 0 },
        exit: (direction: number) => ({ opacity: 0, x: direction * -20 }),
      };

  return (
    <div className="pt-24 pb-20 px-6 md:px-10 max-w-[1400px] mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-text-secondary">Shop</span>
        <span className="text-white/30 text-[9px] mx-2" aria-hidden="true">/</span>
        <span className="font-caption uppercase tracking-[0.15em] text-[9px] text-ops-text-primary">Checkout</span>
      </nav>

      {/* Step indicators */}
      <div className="flex gap-6 mb-8" role="list" aria-label="Checkout steps">
        {stepIndicators.map((s) => {
          const isActive = s.key === step;
          const isCompleted = step === 'payment' && s.key === 'shipping';
          return (
            <div key={s.key} className="flex items-center gap-2" role="listitem">
              <span
                className={`
                  w-5 h-5 rounded-full text-[9px] flex items-center justify-center transition-colors duration-200
                  ${isActive || isCompleted
                    ? 'bg-white text-ops-background'
                    : 'border border-white/20 text-ops-text-secondary'
                  }
                `}
                aria-current={isActive ? 'step' : undefined}
              >
                {isCompleted ? '✓' : s.number}
              </span>
              <span
                className={`font-caption uppercase tracking-[0.1em] text-[9px] ${
                  isActive ? 'text-ops-text-primary' : 'text-ops-text-secondary'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-[2px] px-4 py-3 mb-6" role="alert">
          <p className="text-red-400 text-sm font-body">{error}</p>
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Form (60%) */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait" custom={step === 'shipping' ? -1 : 1}>
            {step === 'shipping' && (
              <motion.div
                key="shipping"
                custom={-1}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: theme.animation.easing }}
              >
                <CheckoutShipping
                  shippingMethods={shippingMethods}
                  onContinue={handleShippingContinue}
                  isLoading={isLoading}
                />
              </motion.div>
            )}
            {step === 'payment' && clientSecret && (
              <motion.div
                key="payment"
                custom={1}
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3, ease: theme.animation.easing }}
              >
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#597794',
                        colorBackground: '#141414',
                        colorText: '#FFFFFF',
                        borderRadius: '2px',
                        fontFamily: 'Mohave, sans-serif',
                      },
                    },
                  }}
                >
                  <CheckoutPayment
                    orderId={orderId!}
                    totalCents={totalCents}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </Elements>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Order summary (40%) */}
        <div className="lg:col-span-2">
          <OrderSummary
            shippingCents={step === 'payment' ? shippingCents : undefined}
            taxCents={step === 'payment' ? taxCents : undefined}
          />
        </div>
      </div>
    </div>
  );
}
