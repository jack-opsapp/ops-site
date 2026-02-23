import type { Metadata } from 'next';
import ResourcesHero from '@/components/resources/ResourcesHero';
import QuickLinks from '@/components/resources/QuickLinks';
import ContactBlock from '@/components/resources/ContactBlock';
import FAQ from '@/components/shared/FAQ';
import BottomCTA from '@/components/shared/BottomCTA';

export const metadata: Metadata = {
  title: 'Resources',
  description:
    'Get help with OPS. Download the app, read the FAQ, explore guides, or reach out to the team directly.',
};

const faqItems = [
  {
    question: 'How do I get started?',
    answer:
      'Download OPS from the App Store or sign up at app.opsapp.co. Create your company, invite your crew, and you\'re running in minutes. No setup call required.',
  },
  {
    question: 'Does OPS work offline?',
    answer:
      'Yes. Your crew can view schedules, update projects, and take photos without cell service. Everything syncs automatically when connectivity returns.',
  },
  {
    question: 'Can I import existing data?',
    answer:
      'We offer free data migration for all plans. Our team will help move your projects, clients, and crew data from your current system.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Your data is encrypted in transit and at rest. We use industry-standard security practices and never share your information with third parties.',
  },
  {
    question: 'What devices does OPS support?',
    answer:
      'OPS is available on iPhone and iPad via the App Store, and on any device through the web app at app.opsapp.co.',
  },
  {
    question: 'How do I get help?',
    answer:
      'Email hello@opsapp.co or use the in-app feedback button. We respond within 24 hours — usually much faster.',
  },
];

export default function ResourcesPage() {
  return (
    <>
      <ResourcesHero />

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
        <QuickLinks />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <ContactBlock id="contact" />
      </div>

      <FAQ label="COMMON QUESTIONS" items={faqItems} id="faq" />

      <BottomCTA
        heading="START RUNNING YOUR OPERATION"
        subtext="Download OPS today."
        buttonText="GET OPS"
        buttonHref="https://apps.apple.com/app/ops-app/id6504890498"
        external
      />
    </>
  );
}
