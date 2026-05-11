'use client'

import { FaqSection } from '@/components/landing/faq-section'
import { features, FeatureSection } from '@/components/landing/feature-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import {
  BottomCtaSection,
  Footer,
  HeroSection,
  Navigation,
  SecuritySection,
} from '@/components/landing/landing-sections'
import { SocialProofSection } from '@/components/landing/social-proof-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { t } from '@/lib/i18n/t'

export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col overflow-hidden bg-background text-foreground'>
      <Navigation />
      <main className='flex-1'>
        <HeroSection />
        <FeatureSection items={features} title={t('landing.features.title')} />
        <HowItWorksSection
          steps={[
            {
              description: t('landing.howItWorks.steps.step1.description'),
              title: t('landing.howItWorks.steps.step1.title'),
            },
            {
              description: t('landing.howItWorks.steps.step2.description'),
              title: t('landing.howItWorks.steps.step2.title'),
            },
            {
              description: t('landing.howItWorks.steps.step3.description'),
              title: t('landing.howItWorks.steps.step3.title'),
            },
          ]}
          title={t('landing.howItWorks.title')}
        />
        <SecuritySection />
        <TestimonialsSection
          items={[
            {
              author: t('landing.testimonials.items.user1.author'),
              quote: t('landing.testimonials.items.user1.quote'),
            },
            {
              author: t('landing.testimonials.items.user2.author'),
              quote: t('landing.testimonials.items.user2.quote'),
            },
            {
              author: t('landing.testimonials.items.user3.author'),
              quote: t('landing.testimonials.items.user3.quote'),
            },
          ]}
          title={t('landing.testimonials.title')}
        />
        <FaqSection
          items={[
            {
              answer: t('landing.faq.items.q1.answer'),
              question: t('landing.faq.items.q1.question'),
            },
            {
              answer: t('landing.faq.items.q2.answer'),
              question: t('landing.faq.items.q2.question'),
            },
            {
              answer: t('landing.faq.items.q3.answer'),
              question: t('landing.faq.items.q3.question'),
            },
          ]}
          title={t('landing.faq.title')}
        />
        <SocialProofSection
          stats={[
            t('landing.socialProof.stat1'),
            t('landing.socialProof.stat2'),
            t('landing.socialProof.stat3'),
          ]}
          title={t('landing.socialProof.title')}
        />
        <BottomCtaSection />
      </main>
      <Footer />
    </div>
  )
}
