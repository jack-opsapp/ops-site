/**
 * PageLayout — Wraps every page with Navigation + Footer + ambient edge glows
 */

import Navigation from './Navigation';
import Footer from './Footer';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />

      {/* Ambient page-edge glows — absolute, pointer-events-none */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Left edge — blue, upper area */}
        <div
          className="absolute"
          style={{
            left: '-300px',
            top: '8%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(89, 119, 148, 0.04) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — orange, upper-mid */}
        <div
          className="absolute"
          style={{
            right: '-250px',
            top: '18%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.025) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — orange, mid section */}
        <div
          className="absolute"
          style={{
            left: '-200px',
            top: '35%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.03) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — blue, mid section */}
        <div
          className="absolute"
          style={{
            right: '-280px',
            top: '45%',
            width: '650px',
            height: '650px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(89, 119, 148, 0.035) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — blue, lower-mid */}
        <div
          className="absolute"
          style={{
            left: '-250px',
            top: '60%',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(89, 119, 148, 0.03) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — orange, lower section */}
        <div
          className="absolute"
          style={{
            right: '-200px',
            top: '72%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.025) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — orange, bottom */}
        <div
          className="absolute"
          style={{
            left: '-220px',
            top: '85%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.02) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — blue, bottom */}
        <div
          className="absolute"
          style={{
            right: '-300px',
            top: '90%',
            width: '700px',
            height: '700px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(89, 119, 148, 0.035) 0%, transparent 70%)',
          }}
        />
      </div>
    </>
  );
}
