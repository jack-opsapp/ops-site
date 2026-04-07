'use client';

/**
 * EarlyAccessModal — Overlay form for requesting early access to
 * in-development features. Collects name, email, company name,
 * industry, and team size. Posts to /api/early-access.
 */

import { useState, useEffect, useCallback } from 'react';

interface EarlyAccessModalProps {
  feature: string;
  onClose: () => void;
}

const INDUSTRIES = [
  'General Contracting',
  'Electrical',
  'Plumbing',
  'HVAC',
  'Roofing',
  'Landscaping',
  'Painting',
  'Fencing',
  'Concrete / Masonry',
  'Flooring',
  'Renovation / Remodeling',
  'Cleaning / Janitorial',
  'Other',
];

const TEAM_SIZES = [
  '1 (just me)',
  '2–5',
  '6–15',
  '16–50',
  '50+',
];

export default function EarlyAccessModal({ feature, onClose }: EarlyAccessModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [teamSize, setTeamSize] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !name) return;

    setStatus('sending');

    try {
      const res = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, companyName, industry, teamSize, feature }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  const inputClass =
    'w-full bg-transparent border border-ops-border rounded-[4px] px-4 py-3 font-body text-sm text-ops-text-primary placeholder:text-ops-text-secondary/40 focus:border-ops-border-hover focus:outline-none transition-colors';

  const labelClass =
    'block font-caption uppercase tracking-[0.15em] text-[11px] text-ops-text-secondary mb-2';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg bg-ops-bg border border-ops-border rounded-[4px] p-8 md:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ops-text-secondary hover:text-ops-text-primary transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>

        {status === 'success' ? (
          <div className="text-center py-8">
            <p className="font-heading font-bold uppercase text-ops-text-primary text-lg">
              YOU&apos;RE ON THE LIST.
            </p>
            <p className="mt-3 font-heading font-light text-sm text-ops-text-secondary">
              We&apos;ll reach out when early access opens.
            </p>
            <button
              onClick={onClose}
              className="mt-8 inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3 rounded-[3px] bg-transparent text-ops-text-primary border border-ops-border hover:border-ops-border-hover transition-colors cursor-pointer"
            >
              CLOSE
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="font-caption uppercase tracking-[0.15em] text-[10px] text-ops-text-secondary">
                EARLY ACCESS
              </p>
              <h3 className="font-heading font-bold uppercase text-ops-text-primary text-xl mt-1">
                GET IN BEFORE LAUNCH.
              </h3>
              <p className="mt-2 font-heading font-light text-sm text-ops-text-secondary">
                Fill in your details and we&apos;ll give you free early access to {feature}.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ea-name" className={labelClass}>NAME *</label>
                  <input
                    id="ea-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="ea-email" className={labelClass}>EMAIL *</label>
                  <input
                    id="ea-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={inputClass}
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="ea-company" className={labelClass}>COMPANY NAME</label>
                <input
                  id="ea-company"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className={inputClass}
                  placeholder="Your company"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="ea-industry" className={labelClass}>INDUSTRY</label>
                  <select
                    id="ea-industry"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className={`${inputClass} ${!industry ? 'text-ops-text-secondary/40' : ''}`}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>{ind}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ea-size" className={labelClass}>TEAM SIZE</label>
                  <select
                    id="ea-size"
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className={`${inputClass} ${!teamSize ? 'text-ops-text-secondary/40' : ''}`}
                  >
                    <option value="">Select size</option>
                    {TEAM_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              {status === 'error' && (
                <p className="font-caption text-xs text-red-400">Something went wrong. Please try again.</p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full inline-flex items-center justify-center font-caption uppercase tracking-[0.15em] text-xs px-6 py-3.5 rounded-[3px] transition-all duration-200 cursor-pointer bg-white text-black hover:bg-white/90 active:bg-white/80 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'SUBMITTING...' : 'REQUEST EARLY ACCESS'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
