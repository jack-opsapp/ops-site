/**
 * PageLayout — Wraps every page with Navigation + Footer
 */

import Navigation from './Navigation';
import Footer from './Footer';

export default function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      <main>{children}</main>
      <Footer />
    </>
  );
}
