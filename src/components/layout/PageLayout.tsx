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

      {/* Ambient page-edge glows — fixed, pointer-events-none */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
        {/* Left edge — blue, upper third */}
        <div
          className="absolute"
          style={{
            left: '-200px',
            top: '15%',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(89, 119, 148, 0.05) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — orange, mid section */}
        <div
          className="absolute"
          style={{
            right: '-200px',
            top: '40%',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.035) 0%, transparent 70%)',
          }}
        />

        {/* Left edge — orange, lower section */}
        <div
          className="absolute"
          style={{
            left: '-180px',
            top: '65%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212, 98, 43, 0.03) 0%, transparent 70%)',
          }}
        />

        {/* Right edge — blue, lower third */}
        <div
          className="absolute"
          style={{
            right: '-220px',
            top: '80%',
            width: '550px',
            height: '550px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(89, 119, 148, 0.045) 0%, transparent 70%)',
          }}
        />
      </div>
    </>
  );
}
