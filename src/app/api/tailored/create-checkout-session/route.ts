/**
 * Alias — POST /api/tailored/create-checkout-session
 *
 * Defensive. Any old client (cached HTML, ad creative, bookmark) that
 * hits the legacy path still gets a working Stripe Checkout Session.
 * Remove once /tailored has been 301'd long enough that the alias
 * stops receiving traffic.
 */

export { POST } from '@/app/api/spec/create-checkout-session/route';
