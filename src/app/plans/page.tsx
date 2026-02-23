/**
 * Plans page — Pricing tiers, FAQ, and bottom CTA
 *
 * Three pricing cards (Starter, Team, Business) with FAQ section.
 */

import type { Metadata } from 'next';
import { FadeInUp } from '@/components/ui';
import PlansHero from '@/components/plans/PlansHero';
import PricingCard from '@/components/plans/PricingCard';
import FAQ from '@/components/shared/FAQ';
import BottomCTA from '@/components/shared/BottomCTA';

export const metadata: Metadata = {
  title: 'Plans',
  description:
    'Honest pricing for OPS. Every feature included on every plan. No hidden fees, no feature gates. Pick your crew size.',
};

const pricingTiers = [
  {
    name: 'Starter',
    price: '$90',
    interval: '/month',
    features: [
      'Up to 5 team members',
      'Unlimited projects',
      'Scheduling & calendar',
      'Invoicing & estimates',
      'Photo documentation',
      'Client management',
      'Job board pipeline',
    ],
    ctaText: 'GET STARTED',
    ctaHref: 'https://app.opsapp.co',
  },
  {
    name: 'Team',
    price: '$140',
    interval: '/month',
    features: [
      'Up to 15 team members',
      'Everything in Starter',
      'Priority support',
      'Advanced reporting',
      'Custom fields',
      'Team analytics',
      'Data setup assistance',
    ],
    recommended: true,
    ctaText: 'GET OPS',
    ctaHref: 'https://app.opsapp.co',
  },
  {
    name: 'Business',
    price: '$190',
    interval: '/month',
    features: [
      'Unlimited team members',
      'Everything in Team',
      'Dedicated account manager',
      'Custom onboarding',
      'API access',
      'White-label reports',
      'Priority feature requests',
    ],
    ctaText: 'CONTACT US',
    ctaHref: '/resources#contact',
  },
];

const faqItems = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes. Every plan starts with a 14-day free trial. No credit card required. Your crew can start using OPS today.',
  },
  {
    question: 'Can I switch plans?',
    answer:
      'Anytime. Upgrade or downgrade with one click. Changes take effect at your next billing cycle.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'All major credit cards through Stripe. Invoicing available for annual Business plans.',
  },
  {
    question: 'Is there a contract?',
    answer:
      'No. Month-to-month. Cancel anytime. We keep your business by earning it, not locking you in.',
  },
  {
    question: 'Do all plans include every feature?',
    answer:
      'Yes. Every feature is available on every plan. The only difference is team size. We don\u2019t believe in feature gates.',
  },
  {
    question: 'What happens to my data if I cancel?',
    answer:
      'Your data is yours. Export everything before you go. We keep it available for 90 days after cancellation.',
  },
];

export default function PlansPage() {
  return (
    <>
      <PlansHero />

      {/* Pricing cards */}
      <section className="py-16 md:py-24 bg-ops-background">
        <div className="max-w-[1400px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <FadeInUp key={tier.name} delay={index * 0.08}>
                <PricingCard
                  name={tier.name}
                  price={tier.price}
                  interval={tier.interval}
                  features={tier.features}
                  recommended={tier.recommended}
                  ctaText={tier.ctaText}
                  ctaHref={tier.ctaHref}
                />
              </FadeInUp>
            ))}
          </div>
        </div>
      </section>

      <FAQ label="COMMON QUESTIONS" items={faqItems} />

      <BottomCTA
        heading="STILL HAVE QUESTIONS?"
        subtext="Talk to the founder. Seriously."
        buttonText="GET IN TOUCH"
        buttonHref="/resources#contact"
      />
    </>
  );
}
