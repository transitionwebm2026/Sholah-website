import {BadgeCheck} from 'lucide-react';
import {ButtonLink} from '@/components/ui/ButtonLink';
import {Container} from '@/components/ui/Container';
import {DirectionalArrow} from '@/components/ui/DirectionalArrow';
import {Section} from '@/components/ui/Section';
import {SectionHeading} from '@/components/ui/SectionHeading';
import {VideoFacade} from '@/components/ui/VideoFacade';
import type {HomeViewData} from '@/lib/cms/views';

/** Section 2: landscape video (start side, right in Arabic) + biography (end side). */
export function AboutPreview({about}: {about: HomeViewData['about']}) {
  if (!about.title) return null;

  return (
    <Section id="about" labelledBy="about-title" tone="deep">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div data-reveal>
          <div className="rounded-[2.25rem] bg-linear-to-br from-gold-400/40 via-white/5 to-navy-600/40 p-px shadow-luxe">
            <VideoFacade
              url={about.video.url}
              poster={about.video.thumbnail}
              title={about.video.title || about.title}
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 50vw, 100vw"
              pulse
              className="rounded-[2.2rem]"
            />
          </div>
        </div>

        <div>
          <SectionHeading id="about-title" eyebrow={about.eyebrow} title={about.title} align="start" />
          <div className="mt-6 space-y-4 text-lg leading-relaxed text-white/80">
            {about.paragraphs.map((paragraph, i) => (
              <p key={i} data-reveal="up">
                {paragraph}
              </p>
            ))}
          </div>
          {about.points.length > 0 && (
            <ul className="mt-8 space-y-3">
              {about.points.map((point, i) => (
                <li key={i} data-reveal="up" className="flex items-center gap-3 font-medium">
                  <BadgeCheck aria-hidden className="size-5 shrink-0 text-gold-400" />
                  {point}
                </li>
              ))}
            </ul>
          )}
          {about.cta && (
            <ButtonLink href="/about" variant="outline" className="mt-10" data-reveal="up">
              {about.cta}
              <DirectionalArrow />
            </ButtonLink>
          )}
        </div>
      </Container>
    </Section>
  );
}
