'use client';

import { useEffect } from 'react';
import { sanitizeMarketingUrl, trackMarketingEvent } from '@/lib/marketing-analytics';

const SCROLL_THRESHOLDS = [25, 50, 75, 90] as const;

function getLinkEventName(url: URL): string | null {
  if (url.hostname === 'apps.apple.com') return 'app_store_click';
  if (url.hostname === 'app.opsapp.co') return 'web_app_click';
  if (url.hostname === 'try.opsapp.co') return 'tutorial_click';
  if (url.origin !== window.location.origin) return 'outbound_click';
  return null;
}

function getLinkContext(anchor: HTMLAnchorElement): string {
  const region = anchor.closest('nav, header, main, section, footer');
  if (!region) return 'unknown';
  if (region instanceof HTMLElement && region.getAttribute('aria-label')) {
    return region.getAttribute('aria-label') ?? 'unknown';
  }
  return region.tagName.toLowerCase();
}

export default function MarketingAnalytics() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest('a[href]');
      if (!(anchor instanceof HTMLAnchorElement)) return;

      const url = new URL(anchor.href, window.location.href);
      const eventName = getLinkEventName(url);
      if (!eventName) return;

      trackMarketingEvent(eventName, {
        link_url: sanitizeMarketingUrl(url.toString(), window.location.href),
        link_domain: url.hostname,
        link_text: anchor.innerText.trim().replace(/\s+/g, ' '),
        link_context: getLinkContext(anchor),
      });
    };

    document.addEventListener('click', handleClick, { capture: true });
    return () => document.removeEventListener('click', handleClick, { capture: true });
  }, []);

  useEffect(() => {
    const fired = new Set<number>();

    const handleScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable <= 0) return;

      const percent = Math.round((window.scrollY / scrollable) * 100);
      for (const threshold of SCROLL_THRESHOLDS) {
        if (percent >= threshold && !fired.has(threshold)) {
          fired.add(threshold);
          trackMarketingEvent('scroll_depth', { percent: threshold });
        }
      }
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
}
