/**
 * Alias — POST /api/tailored/webhook
 *
 * Forwards to /api/spec/webhook. Kept while Stripe Dashboard webhook URL
 * is being migrated. The signature is computed over the request body so
 * a redirect would break verification; instead re-export the canonical
 * handler so the alias is functionally identical.
 *
 * Remove this file once the Stripe Dashboard endpoint is set to
 * /api/spec/webhook and a deploy cycle has passed.
 */

export { POST } from '@/app/api/spec/webhook/route';
