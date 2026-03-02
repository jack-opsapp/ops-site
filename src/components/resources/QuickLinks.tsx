/**
 * QuickLinks — Grid of four navigational cards
 */

import Link from 'next/link';
import { Card, FadeInUp } from '@/components/ui';
import { getTDict } from '@/i18n/server';

export default async function QuickLinks() {
  const dict = await getTDict('resources');
  const t = (key: string) => {
    const value = dict[key];
    return typeof value === 'string' ? value : key;
  };

  const links = [
    {
      title: t('quickLinks.gettingStarted.title'),
      description: t('quickLinks.gettingStarted.description'),
      href: 'https://apps.apple.com/us/app/ops-job-crew-management/id6746662078',
      external: true,
    },
    {
      title: t('quickLinks.faq.title'),
      description: t('quickLinks.faq.description'),
      href: '#faq',
      external: false,
    },
    {
      title: t('quickLinks.journal.title'),
      description: t('quickLinks.journal.description'),
      href: '/journal',
      external: false,
    },
    {
      title: t('quickLinks.contact.title'),
      description: t('quickLinks.contact.description'),
      href: '#contact',
      external: false,
    },
  ];

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
