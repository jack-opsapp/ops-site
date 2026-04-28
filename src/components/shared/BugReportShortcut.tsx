/**
 * BugReportShortcut — Hidden keyboard-triggered bug report popover.
 *
 * Trigger: Cmd+Shift+\ (macOS) / Ctrl+Shift+\ (Windows/Linux). Captures a
 * screenshot of the page (best-effort), shows a small fixed-position popover
 * with a description textarea + optional email, and POSTs to /api/bug-report.
 *
 * The shortcut is intentionally undiscoverable. Anyone can fire it, but it's
 * only meant for the developer to use during dogfooding. Reports land in the
 * `bug_reports` table under the sentinel ANONYMOUS USER company.
 */

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

interface BugContext {
  url: string;
  pathname: string;
  referrer: string;
  userAgent: string;
  language: string;
  timezone: string;
  online: boolean;
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  browser: string | null;
  browserVersion: string | null;
  osName: string | null;
  osVersion: string | null;
  deviceModel: string | null;
}

function detectBrowser(ua: string): { browser: string | null; version: string | null } {
  if (!ua) return { browser: null, version: null };
  const matchers: { name: string; pattern: RegExp }[] = [
    { name: 'Edge', pattern: /Edg\/(\d+\.\d+)/ },
    { name: 'Chrome', pattern: /Chrome\/(\d+\.\d+)/ },
    { name: 'Firefox', pattern: /Firefox\/(\d+\.\d+)/ },
    { name: 'Safari', pattern: /Version\/(\d+\.\d+).*Safari/ },
  ];
  for (const m of matchers) {
    const hit = ua.match(m.pattern);
    if (hit) return { browser: m.name, version: hit[1] };
  }
  return { browser: null, version: null };
}

function detectOS(ua: string): { osName: string | null; osVersion: string | null; deviceModel: string | null } {
  if (!ua) return { osName: null, osVersion: null, deviceModel: null };
  if (/iPhone|iPad|iPod/.test(ua)) {
    const v = ua.match(/OS (\d+[._]\d+)/);
    return {
      osName: 'iOS',
      osVersion: v ? v[1].replace('_', '.') : null,
      deviceModel: /iPad/.test(ua) ? 'iPad' : 'iPhone',
    };
  }
  if (/Android/.test(ua)) {
    const v = ua.match(/Android (\d+(?:\.\d+)?)/);
    return { osName: 'Android', osVersion: v ? v[1] : null, deviceModel: null };
  }
  if (/Mac OS X/.test(ua)) {
    const v = ua.match(/Mac OS X (\d+[._]\d+)/);
    return { osName: 'macOS', osVersion: v ? v[1].replace('_', '.') : null, deviceModel: 'Mac' };
  }
  if (/Windows NT/.test(ua)) {
    const v = ua.match(/Windows NT (\d+\.\d+)/);
    return { osName: 'Windows', osVersion: v ? v[1] : null, deviceModel: 'PC' };
  }
  if (/Linux/.test(ua)) {
    return { osName: 'Linux', osVersion: null, deviceModel: null };
  }
  return { osName: null, osVersion: null, deviceModel: null };
}

function gatherContext(): BugContext {
  const ua = navigator.userAgent || '';
  const { browser, version } = detectBrowser(ua);
  const { osName, osVersion, deviceModel } = detectOS(ua);
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer || '',
    userAgent: ua,
    language: navigator.language || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    online: navigator.onLine,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    browser,
    browserVersion: version,
    osName,
    osVersion,
    deviceModel,
  };
}

export default function BugReportShortcut() {
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState('');
  const [needsOversight, setNeedsOversight] = useState(true);
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [screenshotBlob, setScreenshotBlob] = useState<Blob | null>(null);
  const [capturing, setCapturing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const handleClose = useCallback(() => {
    if (formState === 'submitting') return;
    setOpen(false);
    setTimeout(() => {
      setDescription('');
      setEmail('');
      setNeedsOversight(true);
      setFormState('idle');
      setErrorMessage(null);
      setScreenshotBlob(null);
    }, 200);
  }, [formState]);

  const handleOpen = useCallback(async () => {
    if (open) return;
    setCapturing(true);
    try {
      // Capture BEFORE the popover renders so the screenshot reflects the
      // page the user was looking at when they triggered the shortcut.
      const { domToBlob } = await import('modern-screenshot');
      const blob = await domToBlob(document.body, {
        type: 'image/png',
        quality: 0.85,
        scale: Math.min(window.devicePixelRatio || 1, 2),
        backgroundColor: '#0A0A0A',
        filter: (node) => {
          if (!(node instanceof HTMLElement)) return true;
          if (node.dataset?.bugReportIgnore === 'true') return false;
          return true;
        },
      });
      setScreenshotBlob(blob);
    } catch (err) {
      console.warn('Bug report screenshot capture failed:', err);
      setScreenshotBlob(null);
    } finally {
      setCapturing(false);
      setOpen(true);
    }
  }, [open]);

  // Global shortcut: Cmd/Ctrl + Shift + \
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      // Shift+\ produces '|' in most layouts, so match both forms plus the
      // physical Backslash code for non-US layouts.
      const isBackslash = e.code === 'Backslash' || e.key === '\\' || e.key === '|';
      if (mod && e.shiftKey && isBackslash) {
        e.preventDefault();
        if (open) {
          handleClose();
        } else {
          handleOpen();
        }
      } else if (e.key === 'Escape' && open) {
        handleClose();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, handleOpen, handleClose]);

  // Outside click
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        handleClose();
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open, handleClose]);

  // Autofocus textarea once open
  useEffect(() => {
    if (open && formState === 'idle') {
      textareaRef.current?.focus();
    }
  }, [open, formState]);

  const handleSubmit = useCallback(async () => {
    const trimmed = description.trim();
    if (!trimmed || formState === 'submitting') return;

    setFormState('submitting');
    setErrorMessage(null);

    try {
      const ctx = gatherContext();
      const res = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: trimmed,
          reporterEmail: email.trim() || null,
          requiresHumanReview: needsOversight,
          ...ctx,
        }),
      });

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(errBody.error ?? `Submit failed (${res.status})`);
      }

      const { id } = (await res.json()) as { id: string };

      if (screenshotBlob) {
        try {
          const form = new FormData();
          form.append('file', screenshotBlob, 'screenshot.png');
          form.append('reportId', id);
          const upload = await fetch('/api/bug-report/screenshot', {
            method: 'POST',
            body: form,
          });
          if (!upload.ok) {
            // Best-effort — don't fail the report if screenshot upload trips.
            console.warn('Screenshot upload failed:', upload.status);
          }
        } catch (uploadErr) {
          console.warn('Screenshot upload error:', uploadErr);
        }
      }

      setFormState('success');
      setTimeout(() => handleClose(), 1200);
    } catch (err) {
      setFormState('error');
      setErrorMessage(err instanceof Error ? err.message : 'Submit failed.');
    }
  }, [description, email, needsOversight, formState, screenshotBlob, handleClose]);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-4 right-4 z-[1500]"
      data-bug-report-ignore="true"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 0.2, ease: [0.22, 1, 0.36, 1] }
            }
            className="w-[340px] rounded-[3px] overflow-hidden"
            style={{
              background: 'rgba(13, 13, 13, 0.92)',
              backdropFilter: 'blur(24px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
              border: '1px solid rgba(255, 255, 255, 0.10)',
            }}
            role="dialog"
            aria-label="Bug report"
          >
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.08]">
              <span className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary">
                {'// BUG REPORT'}
              </span>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="text-ops-text-secondary hover:text-white transition-colors text-xs leading-none px-1"
              >
                ✕
              </button>
            </div>

            <div className="p-3 space-y-2.5">
              {formState === 'success' ? (
                <div className="py-3">
                  <p className="font-caption text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                    SUBMITTED.
                  </p>
                  <p className="font-body text-xs text-ops-text-secondary mt-1">
                    Thanks — logged for review.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-1 block">
                      WHAT HAPPENED
                    </label>
                    <textarea
                      ref={textareaRef}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Steps, expected vs actual, anything weird."
                      rows={4}
                      maxLength={5000}
                      className="w-full px-2.5 py-2 rounded-[2px] font-body text-sm text-white resize-none bg-white/[0.04] border border-white/[0.10] placeholder:text-ops-text-secondary/50 focus:outline-none focus:border-ops-accent/60 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="font-caption text-[10px] uppercase tracking-[0.2em] text-ops-text-secondary mb-1 block">
                      EMAIL [OPTIONAL]
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="for follow-up"
                      maxLength={320}
                      className="w-full px-2.5 py-2 rounded-[2px] font-body text-sm text-white bg-white/[0.04] border border-white/[0.10] placeholder:text-ops-text-secondary/50 focus:outline-none focus:border-ops-accent/60 transition-colors"
                    />
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={needsOversight}
                    onClick={() => setNeedsOversight((v) => !v)}
                    className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-[2px] border transition-colors ${
                      needsOversight
                        ? 'border-white/[0.18] bg-white/[0.06]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.14]'
                    }`}
                  >
                    <span
                      className={`font-caption text-[10px] uppercase tracking-[0.2em] text-left ${
                        needsOversight ? 'text-white/80' : 'text-ops-text-secondary/70'
                      }`}
                    >
                      {needsOversight ? '[NEEDS HUMAN OVERSIGHT]' : 'AGENT CAN HANDLE'}
                    </span>
                    <span
                      className={`relative inline-block w-6 h-3 rounded-full transition-colors flex-shrink-0 ${
                        needsOversight ? 'bg-white/[0.2]' : 'bg-white/[0.08]'
                      }`}
                    >
                      <span
                        className={`absolute top-[1px] w-[10px] h-[10px] rounded-full transition-all ${
                          needsOversight ? 'left-[13px] bg-white/80' : 'left-[1px] bg-white/30'
                        }`}
                      />
                    </span>
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-caption text-[9px] uppercase tracking-[0.2em] text-ops-text-secondary/70">
                      AUTO-CAPTURED:
                    </span>
                    <span className="font-caption text-[9px] tracking-wider text-ops-text-secondary/70">
                      url · browser · viewport{screenshotBlob ? ' · screenshot' : ''}
                    </span>
                  </div>

                  {formState === 'error' && errorMessage && (
                    <div className="px-2 py-1.5 rounded-[2px] border border-red-500/30 bg-red-500/[0.08]">
                      <p className="font-caption text-[10px] tracking-wider text-red-300 break-words">
                        {errorMessage}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!description.trim() || formState === 'submitting'}
                    className={`w-full px-3 py-2 rounded-[2px] font-caption text-[10px] uppercase tracking-[0.2em] transition-colors ${
                      description.trim() && formState !== 'submitting'
                        ? 'bg-ops-accent/20 text-ops-accent border border-ops-accent/40 hover:bg-ops-accent/30'
                        : 'bg-white/[0.03] text-ops-text-secondary/50 border border-white/[0.06] cursor-not-allowed'
                    }`}
                  >
                    {formState === 'submitting' ? 'SUBMITTING...' : 'SUBMIT'}
                  </button>

                  <p className="font-caption text-[9px] tracking-[0.15em] text-ops-text-secondary/50 text-center pt-0.5">
                    {capturing ? 'CAPTURING...' : 'CMD+SHIFT+\\ TO TOGGLE · ESC TO CLOSE'}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
