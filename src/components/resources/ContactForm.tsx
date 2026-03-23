'use client';

/**
 * ContactForm — Full contact form with name, email, message
 * Client component for form state management.
 */

import { useState } from 'react';

interface ContactFormProps {
  labels: {
    name: string;
    email: string;
    message: string;
    submit: string;
    sending: string;
    success: string;
    error: string;
  };
}

export default function ContactForm({ labels }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !message) return;

    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (res.ok) {
        setStatus('success');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="border border-ops-border rounded-[4px] p-8">
        <p className="font-heading font-bold uppercase text-ops-text-primary text-lg">
          {labels.success}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="contact-name"
            className="block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mb-2"
          >
            {labels.name}
          </label>
          <input
            id="contact-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-transparent border border-ops-border rounded-[4px] px-4 py-3 font-body text-sm text-ops-text-primary placeholder:text-ops-text-secondary/40 focus:border-ops-border-hover focus:outline-none transition-colors"
            placeholder="Jack"
          />
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mb-2"
          >
            {labels.email} *
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full bg-transparent border border-ops-border rounded-[4px] px-4 py-3 font-body text-sm text-ops-text-primary placeholder:text-ops-text-secondary/40 focus:border-ops-border-hover focus:outline-none transition-colors"
            placeholder="you@company.com"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mb-2"
        >
          {labels.message} *
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          className="w-full bg-transparent border border-ops-border rounded-[4px] px-4 py-3 font-body text-sm text-ops-text-primary placeholder:text-ops-text-secondary/40 focus:border-ops-border-hover focus:outline-none transition-colors resize-none"
          placeholder="Tell us how we can help..."
        />
      </div>

      {status === 'error' && (
        <p className="font-caption text-xs text-red-400">{labels.error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] transition-all duration-200 cursor-pointer bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover active:border-white/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'sending' ? labels.sending : labels.submit}
      </button>
    </form>
  );
}
