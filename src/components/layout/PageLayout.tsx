/**
 * PageLayout — Wraps every page with Navigation + Footer + ambient edge glows.
 *
 * The orbs container uses `relative` on a wrapping div so the orbs are
 * positioned relative to the full page height (not just the viewport).
 * All orbs use pixel-based offsets starting well below the hero fold.
 */

import Navigation from './Navigation';
import Footer from './Footer';
import LanguageBanner from './LanguageBanner';
import { getTDict } from '@/i18n/server';
import { isStoreLive } from '@/lib/shop/queries';
import type { Dictionary } from '@/i18n/types';

export default async function PageLayout({ children }: { children: React.ReactNode }) {
  const [commonDict, shopLive] = await Promise.all([
    getTDict('common') as Promise<Dictionary>,
    isStoreLive(),
  ]);

  return (
    <div className="relative">
      <Navigation commonDict={commonDict} shopLive={shopLive} />
      <LanguageBanner commonDict={commonDict} />
      <main>{children}</main>
      <Footer commonDict={commonDict} shopLive={shopLive} />

      {/* Ambient page-edge glows — spans the full page via the relative parent.
          All orbs positioned with calc(100vh + offset) so they never touch the hero. */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Left edge — blue */}
        <div
          className="absolute"
          style={{
            left: '-300px',
            top: 'calc(100vh + 400px)',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(111, 148, 176, 0.04) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — orange */}
        <div
          className="absolute"
          style={{
            right: '-250px',
            top: 'calc(100vh + 800px)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.025) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — orange */}
        <div
          className="absolute"
          style={{
            left: '-200px',
            top: 'calc(100vh + 1400px)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.03) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — blue */}
        <div
          className="absolute"
          style={{
            right: '-280px',
            top: 'calc(100vh + 2000px)',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(111, 148, 176, 0.035) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — blue */}
        <div
          className="absolute"
          style={{
            left: '-250px',
            top: 'calc(100vh + 2800px)',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(111, 148, 176, 0.03) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — orange */}
        <div
          className="absolute"
          style={{
            right: '-200px',
            top: 'calc(100vh + 3600px)',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.025) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — orange */}
        <div
          className="absolute"
          style={{
            left: '-220px',
            top: 'calc(100vh + 4400px)',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.02) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — blue */}
        <div
          className="absolute"
          style={{
            right: '-300px',
            top: 'calc(100vh + 5200px)',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(111, 148, 176, 0.035) 0%, transparent 70%)',
          }}
        />
      </div>
    </div>
  );
}
