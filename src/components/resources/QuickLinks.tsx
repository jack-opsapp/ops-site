/**
 * QuickLinks — Grid of four navigational cards
 *
 * Server component. Each card links to a key resource.
 * External links open in new tab; internal links use Next.js routing.
 */

import Link from 'next/link';
import { Card, FadeInUp } from '@/components/ui';

const links = [
  {
    title: 'GETTING STARTED',
    description: 'Download OPS and set up your crew in minutes.',
    href: 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078',
    external: true,
  },
  {
    title: 'FAQ',
    description: 'Answers to common questions about OPS.',
    href: '#faq',
    external: false,
  },
  {
    title: 'JOURNAL',
    description: 'Tips, guides, and stories from the trades.',
    href: '/journal',
    external: false,
  },
  {
    title: 'CONTACT',
    description: 'Reach out to the team directly.',
    href: '#contact',
    external: false,
  },
] as const;

export default function QuickLinks() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {links.map((link, index) => {
        const cardContent = (
          <Card hoverable className="p-6 h-full flex flex-col">
            <p className="font-caption uppercase text-[11px] tracking-[0.15em] text-ops-text-secondary mb-2">
              {link.title}
            </p>
            <p className="font-heading text-sm text-ops-text-primary flex-1">
              {link.description}
            </p>
            <p className="mt-4 text-ops-text-secondary text-right" aria-hidden="true">
              -&gt;
            </p>
          </Card>
        );

        return (
          <FadeInUp key={link.title} delay={index * 0.06}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                {cardContent}
              </a>
            ) : link.href.startsWith('#') ? (
              <a href={link.href} className="block h-full">
                {cardContent}
              </a>
            ) : (
              <Link href={link.href} className="block h-full">
                {cardContent}
              </Link>
            )}
          </FadeInUp>
        );
      })}
    </div>
  );
}
