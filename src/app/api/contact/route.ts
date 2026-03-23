/**
 * Contact Form — POST /api/contact
 *
 * Accepts { name, email, message } and inserts into
 * contact_messages table. Also adds to newsletter_subscribers
 * if not already subscribed.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, message } = body as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please include a message.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    // Store the contact message
    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: name?.trim() || null,
        email: normalizedEmail,
        message: message.trim(),
      });

    if (error) {
      console.error('Contact form error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    // Also add to newsletter subscribers (won't duplicate due to upsert)
    await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          first_name: name?.trim().split(' ')[0] || null,
          source: 'contact-form',
          is_active: true,
          unsubscribed_at: null,
        },
        { onConflict: 'email' }
      );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Invalid request.' },
      { status: 400 }
    );
  }
}
