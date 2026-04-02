'use client';

/**
 * CheckoutShipping — Step 1 of checkout: shipping address + method.
 *
 * Form fields: First Name, Last Name, Email, Address 1 & 2, City, State (dropdown),
 * ZIP, Country (US only for launch). Shipping method selector appears after address.
 *
 * OPS input style: bg-surface-elevated, 1px border, 2px radius, Kosugi uppercase labels.
 * Client-side validation before submit.
 *
 * Accessibility: labels linked to inputs, error messages, aria-required,
 * focus-visible rings, 44px+ touch targets.
 */

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cart';
import ShippingMethodSelector from './ShippingMethodSelector';
import type { ShippingAddress, ShopShippingMethod } from '@/lib/shop/types';

interface CheckoutShippingProps {
  shippingMethods: ShopShippingMethod[];
  onContinue: (address: ShippingAddress, email: string, shippingMethodId: string) => void;
  isLoading: boolean;
}

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY',
  'LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
  'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

export default function CheckoutShipping({ shippingMethods, onContinue, isLoading }: CheckoutShippingProps) {
  const subtotalCents = useCartStore((s) => s.subtotalCents());
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    zip: '',
  });
  const [shippingMethodId, setShippingMethodId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = 'Valid email required';
    if (!form.line1.trim()) errs.line1 = 'Required';
    if (!form.city.trim()) errs.city = 'Required';
    if (!form.state) errs.state = 'Required';
    if (!form.zip.trim() || !/^\d{5}(-\d{4})?$/.test(form.zip.trim())) errs.zip = 'Valid ZIP required';
    if (!shippingMethodId) errs.shippingMethod = 'Select a shipping method';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !shippingMethodId) return;
    onContinue(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        line1: form.line1.trim(),
        line2: form.line2.trim() || null,
        city: form.city.trim(),
        state: form.state,
        zip: form.zip.trim(),
        country: 'US',
      },
      form.email.trim().toLowerCase(),
      shippingMethodId
    );
  };

  const inputClass = (field: string) => `
    w-full bg-ops-surface-elevated border ${errors[field] ? 'border-red-500/50' : 'border-ops-border'}
    rounded-[2px] px-3 py-2.5 text-ops-text-primary text-sm font-body
    focus:outline-none focus:border-ops-border-hover transition-colors duration-200
    placeholder:text-ops-text-secondary/30
  `;

  const labelClass = 'font-caption uppercase tracking-[0.15em] text-[8px] text-ops-text-secondary block mb-1.5';
  const errorClass = 'text-red-400 text-[8px] font-caption mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Name */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className={labelClass}>First Name</label>
          <input
            id="firstName"
            type="text"
            autoComplete="given-name"
            value={form.firstName}
            onChange={(e) => update('firstName', e.target.value)}
            className={inputClass('firstName')}
            aria-required="true"
            aria-invalid={!!errors.firstName}
          />
          {errors.firstName && <p className={errorClass}>{errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className={labelClass}>Last Name</label>
          <input
            id="lastName"
            type="text"
            autoComplete="family-name"
            value={form.lastName}
            onChange={(e) => update('lastName', e.target.value)}
            className={inputClass('lastName')}
            aria-required="true"
            aria-invalid={!!errors.lastName}
          />
          {errors.lastName && <p className={errorClass}>{errors.lastName}</p>}
        </div>
      </div>

      {/* Email */}
      <div>
        <label htmlFor="email" className={labelClass}>Email</label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update('email', e.target.value)}
          className={inputClass('email')}
          aria-required="true"
          aria-invalid={!!errors.email}
        />
        {errors.email && <p className={errorClass}>{errors.email}</p>}
      </div>

      {/* Address */}
      <div>
        <label htmlFor="line1" className={labelClass}>Address</label>
        <input
          id="line1"
          type="text"
          autoComplete="address-line1"
          value={form.line1}
          onChange={(e) => update('line1', e.target.value)}
          className={inputClass('line1')}
          aria-required="true"
          aria-invalid={!!errors.line1}
        />
        {errors.line1 && <p className={errorClass}>{errors.line1}</p>}
      </div>

      <div>
        <label htmlFor="line2" className={labelClass}>Apt / Suite</label>
        <input
          id="line2"
          type="text"
          autoComplete="address-line2"
          value={form.line2}
          onChange={(e) => update('line2', e.target.value)}
          className={inputClass('line2')}
        />
      </div>

      {/* City / State / ZIP */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="city" className={labelClass}>City</label>
          <input
            id="city"
            type="text"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => update('city', e.target.value)}
            className={inputClass('city')}
            aria-required="true"
            aria-invalid={!!errors.city}
          />
          {errors.city && <p className={errorClass}>{errors.city}</p>}
        </div>
        <div>
          <label htmlFor="state" className={labelClass}>State</label>
          <select
            id="state"
            autoComplete="address-level1"
            value={form.state}
            onChange={(e) => update('state', e.target.value)}
            className={inputClass('state')}
            aria-required="true"
            aria-invalid={!!errors.state}
          >
            <option value="">—</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {errors.state && <p className={errorClass}>{errors.state}</p>}
        </div>
        <div>
          <label htmlFor="zip" className={labelClass}>ZIP</label>
          <input
            id="zip"
            type="text"
            autoComplete="postal-code"
            inputMode="numeric"
            value={form.zip}
            onChange={(e) => update('zip', e.target.value)}
            className={inputClass('zip')}
            aria-required="true"
            aria-invalid={!!errors.zip}
          />
          {errors.zip && <p className={errorClass}>{errors.zip}</p>}
        </div>
      </div>

      {/* Shipping method */}
      <ShippingMethodSelector
        methods={shippingMethods}
        selectedId={shippingMethodId}
        subtotalCents={subtotalCents}
        onSelect={setShippingMethodId}
      />
      {errors.shippingMethod && <p className={errorClass}>{errors.shippingMethod}</p>}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-ops-text-primary text-ops-background py-3 rounded-[3px] font-caption uppercase tracking-[0.15em] text-xs hover:bg-white/90 active:bg-white/80 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ops-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ops-background"
      >
        {isLoading ? 'Processing...' : 'Continue to Payment'}
      </button>
    </form>
  );
}
