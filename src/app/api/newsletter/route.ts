/**
 * Newsletter Subscribe — POST /api/newsletter
 *
 * Accepts { email, firstName?, source? } and upserts into
 * newsletter_subscribers table. Re-activates if previously
 * unsubscribed.
 */

import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, source } = body as {
      email?: string;
      firstName?: string;
      source?: string;
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Upsert: insert or re-activate existing subscriber
    const { error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          first_name: firstName?.trim() || null,
          source: source || 'website',
          is_active: true,
          unsubscribed_at: null,
        },
        { onConflict: 'email' }
      );

    if (error) {
      console.error('Newsletter signup error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
