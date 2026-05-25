/**
 * Early Access Request — POST /api/early-access
 *
 * Accepts { name, email, companyName, industry, teamSize, feature }
 * and inserts into contact_messages with source metadata.
 * Also adds to newsletter_subscribers.
 */

import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, companyName, industry, teamSize, feature } = body as {
      name?: string;
      email?: string;
      companyName?: string;
      industry?: string;
      teamSize?: string;
      feature?: string;
    };

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required.' },
        { status: 400 }
      );
    }

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'Name is required.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const supabase = getSupabaseAdmin();

    // Store as a contact message with early-access metadata in the message field
    const message = [
      `[EARLY ACCESS REQUEST — ${feature || 'Unknown Feature'}]`,
      `Company: ${companyName || 'Not provided'}`,
      `Industry: ${industry || 'Not provided'}`,
      `Team size: ${teamSize || 'Not provided'}`,
    ].join('\n');

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name: name.trim(),
        email: normalizedEmail,
        message,
      });

    if (error) {
      console.error('Early access form error:', error);
      return NextResponse.json(
        { error: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }

    // Also add to newsletter subscribers
    await supabase
      .from('newsletter_subscribers')
      .upsert(
        {
          email: normalizedEmail,
          first_name: name.trim().split(' ')[0] || null,
          source: `early-access-${feature || 'unknown'}`,
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
