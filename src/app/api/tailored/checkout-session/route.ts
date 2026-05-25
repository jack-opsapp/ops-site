/**
 * Alias — GET /api/tailored/checkout-session?session_id=…
 *
 * Old success_url Stripe sessions still point here. Forward to the
 * canonical handler so the legacy confirmation flow keeps working.
 * Remove once historical /tailored sessions are no longer in flight.
 */

export { GET } from '@/app/api/spec/checkout-session/route';
