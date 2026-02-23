import Hero from '@/components/home/Hero';
import PainPoints from '@/components/home/PainPoints';
import PlatformShowcase from '@/components/home/PlatformShowcase';
import Starburst from '@/components/home/Starburst';
import SocialProof from '@/components/home/SocialProof';
import JournalPreview from '@/components/home/JournalPreview';
import FinalCTA from '@/components/home/FinalCTA';

export const revalidate = 300; // ISR: 5 min for blog data

export default function HomePage() {
  return (
    <>
      <Hero />
      <PainPoints />
      <PlatformShowcase />
      <Starburst />
      <SocialProof />
      <JournalPreview />
      <FinalCTA />
    </>
  );
}
