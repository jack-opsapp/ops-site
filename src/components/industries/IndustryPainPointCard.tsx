import { Card } from '@/components/ui';

interface IndustryPainPointCardProps {
  title: string;
  bullets: string[];
  forLine: string;
}

export default function IndustryPainPointCard({ title, bullets, forLine }: IndustryPainPointCardProps) {
  return (
    <Card hoverable={false} className="p-8 h-full">
      <p className="font-heading font-bold text-ops-text-primary uppercase text-lg tracking-tight">{title}</p>
      <ul className="mt-3 space-y-1">
        {bullets.map((bullet, i) => (
          <li key={i} className="font-heading font-light text-ops-text-secondary text-sm leading-relaxed">&bull; {bullet}</li>
        ))}
      </ul>
      <p className="mt-4 font-caption text-[11px] text-ops-text-secondary italic">{forLine}</p>
    </Card>
  );
}
