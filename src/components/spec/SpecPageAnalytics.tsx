'use client';

import { useEffect } from 'react';
import { trackSpecMarketingEvent } from '@/lib/marketing-analytics';

export function SpecPageAnalytics() {
  useEffect(() => {
    trackSpecMarketingEvent('page_view', { spec_surface: 'landing' });
  }, []);

  return null;
}
