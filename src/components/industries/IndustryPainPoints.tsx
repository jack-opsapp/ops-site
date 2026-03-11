import { SectionLabel, FadeInUp } from '@/components/ui';
import IndustryPainPointCard from './IndustryPainPointCard';

interface PainPointItem {
  title: string;
  bullets: string[];
  forLine: string;
}

interface IndustryPainPointsProps {
  painPoints: PainPointItem[];
}

export default function IndustryPainPoints({ painPoints }: IndustryPainPointsProps) {
  return (
    <section className="py-24 md:py-32 bg-ops-background">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <FadeInUp>
          <SectionLabel label="THE PROBLEM" />
        </FadeInUp>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {painPoints.map((point, i) => (
            <FadeInUp key={i} delay={i * 0.1}>
              <IndustryPainPointCard
                title={point.title}
                bullets={point.bullets}
                forLine={point.forLine}
              />
            </FadeInUp>
          ))}
        </div>
      </div>
    </section>
  );
}
