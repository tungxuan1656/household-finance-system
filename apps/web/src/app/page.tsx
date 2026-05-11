'use client'

import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Lock,
  MessageSquare,
  ShieldCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

export default function LandingPage() {
  return (
    <div className='flex min-h-screen flex-col overflow-hidden bg-background text-foreground'>
      {/* Navigation */}
      <header className='fixed top-0 right-0 left-0 z-50 flex h-16 items-center justify-between border-b border-border/40 bg-background/70 px-6 backdrop-blur-md md:px-12'>
        <div className='flex items-center gap-2'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20'>
            <Wallet className='h-6 w-6 text-primary-foreground' />
          </div>
          <span className='bg-gradient-to-r from-primary to-sky-400 bg-clip-text text-xl font-bold tracking-tight text-transparent'>
            Household Finance
          </span>
        </div>
        <div className='flex items-center gap-4'>
          <Button asChild className='hidden sm:flex' variant='ghost'>
            <Link href={PATHS.SIGN_IN}>{t('common.actions.signIn')}</Link>
          </Button>
          <Button
            asChild
            className='rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'>
            <Link href={PATHS.APP_ROOT}>{t('landing.hero.cta')}</Link>
          </Button>
        </div>
      </header>

      <main className='flex-1'>
        {/* Hero Section */}
        <section className='relative overflow-hidden px-6 pt-32 pb-20 md:pt-48 md:pb-32'>
          {/* Background Blobs */}
          <div className='absolute top-1/4 -left-20 -z-10 h-72 w-72 animate-pulse rounded-full bg-primary/20 blur-[100px]' />
          <div className='absolute top-1/3 -right-20 -z-10 h-80 w-80 animate-pulse rounded-full bg-sky-400/20 blur-[120px] delay-700' />

          <div className='container mx-auto max-w-4xl text-center'>
            <Badge className='mb-6 rounded-full px-4 py-1' variant='secondary'>
              New: {t('landing.hero.title')}
            </Badge>
            <h1 className='mb-6 text-4xl leading-tight font-extrabold tracking-tight md:text-6xl lg:text-7xl'>
              {t('landing.hero.title')}
            </h1>
            <p className='mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl'>
              {t('landing.hero.subtitle')}
            </p>
            <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
              <Button
                asChild
                className='h-14 w-full rounded-full px-8 text-lg shadow-xl shadow-primary/25 transition-all hover:scale-105 active:scale-95 sm:w-auto'
                size='lg'>
                <Link className='flex items-center gap-2' href={PATHS.APP_ROOT}>
                  {t('landing.hero.cta')}
                  <ArrowRight className='h-5 w-5' />
                </Link>
              </Button>
              <Button
                className='h-14 w-full rounded-full backdrop-blur-sm transition-all hover:bg-secondary/50 sm:w-auto'
                size='lg'
                variant='outline'>
                {t('landing.hero.secondaryCta')}
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className='relative bg-secondary/10 py-24'>
          <div className='container mx-auto px-6'>
            <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
              {t('landing.features.title')}
            </h2>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
              <FeatureCard
                description={t(
                  'landing.features.items.familyFirst.description',
                )}
                icon={Users}
                title={t('landing.features.items.familyFirst.title')}
              />
              <FeatureCard
                description={t(
                  'landing.features.items.simpleTracking.description',
                )}
                icon={Zap}
                title={t('landing.features.items.simpleTracking.title')}
              />
              <FeatureCard
                description={t(
                  'landing.features.items.budgetControl.description',
                )}
                icon={ShieldCheck}
                title={t('landing.features.items.budgetControl.title')}
              />
              <FeatureCard
                description={t(
                  'landing.features.items.actionableInsights.description',
                )}
                icon={BarChart3}
                title={t('landing.features.items.actionableInsights.title')}
              />
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className='py-24'>
          <div className='container mx-auto px-6'>
            <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
              {t('landing.howItWorks.title')}
            </h2>
            <div className='grid grid-cols-1 gap-12 md:grid-cols-3'>
              <StepItem
                description={t('landing.howItWorks.steps.step1.description')}
                number={1}
                title={t('landing.howItWorks.steps.step1.title')}
              />
              <StepItem
                description={t('landing.howItWorks.steps.step2.description')}
                number={2}
                title={t('landing.howItWorks.steps.step2.title')}
              />
              <StepItem
                description={t('landing.howItWorks.steps.step3.description')}
                number={3}
                title={t('landing.howItWorks.steps.step3.title')}
              />
            </div>
          </div>
        </section>

        {/* Security Section */}
        <section className='bg-primary/5 py-24'>
          <div className='container mx-auto px-6'>
            <div className='flex flex-col items-center gap-12 lg:flex-row lg:items-start'>
              <div className='flex-1'>
                <Badge className='mb-4' variant='outline'>
                  <Lock className='mr-2 h-3 w-3' />
                  Security First
                </Badge>
                <h2 className='mb-6 text-3xl font-bold md:text-4xl'>
                  {t('landing.security.title')}
                </h2>
                <p className='mb-8 text-lg text-muted-foreground'>
                  {t('landing.security.subtitle')}
                </p>
                <div className='space-y-6'>
                  <div className='flex items-start gap-4'>
                    <div className='mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary'>
                      <CheckCircle2 className='h-5 w-5' />
                    </div>
                    <div>
                      <h4 className='font-bold'>
                        {t('landing.security.features.encryption.title')}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {t('landing.security.features.encryption.description')}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-start gap-4'>
                    <div className='mt-1 flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-primary'>
                      <CheckCircle2 className='h-5 w-5' />
                    </div>
                    <div>
                      <h4 className='font-bold'>
                        {t('landing.security.features.privacy.title')}
                      </h4>
                      <p className='text-sm text-muted-foreground'>
                        {t('landing.security.features.privacy.description')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex-1 lg:pl-12'>
                <div className='relative rounded-3xl border border-border/50 bg-background p-8 shadow-2xl'>
                  <div className='mb-8 flex items-center gap-4'>
                    <div className='flex h-12 w-12 items-center justify-center rounded-full bg-primary/10'>
                      <ShieldCheck className='h-6 w-6 text-primary' />
                    </div>
                    <div>
                      <h3 className='font-bold'>Privacy Protection</h3>
                      <p className='text-xs text-muted-foreground'>
                        Enterprise grade security
                      </p>
                    </div>
                  </div>
                  <div className='space-y-4'>
                    <div className='h-2 w-3/4 rounded bg-muted' />
                    <div className='h-2 w-full rounded bg-muted' />
                    <div className='h-2 w-5/6 rounded bg-muted' />
                    <div className='pt-4'>
                      <div className='mb-2 flex items-center justify-between'>
                        <span className='text-xs font-medium'>
                          Encryption Status
                        </span>
                        <span className='rounded-full bg-green-500/10 px-2 py-0.5 text-[10px] font-bold text-green-600'>
                          Active
                        </span>
                      </div>
                      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
                        <div className='h-full w-full animate-pulse bg-green-500' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className='py-24'>
          <div className='container mx-auto px-6'>
            <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
              {t('landing.testimonials.title')}
            </h2>
            <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
              <TestimonialCard
                author={t('landing.testimonials.items.user1.author')}
                quote={t('landing.testimonials.items.user1.quote')}
              />
              <TestimonialCard
                author={t('landing.testimonials.items.user2.author')}
                quote={t('landing.testimonials.items.user2.quote')}
              />
              <TestimonialCard
                author={t('landing.testimonials.items.user3.author')}
                quote={t('landing.testimonials.items.user3.quote')}
              />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className='bg-secondary/5 py-24'>
          <div className='container mx-auto max-w-3xl px-6'>
            <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
              {t('landing.faq.title')}
            </h2>
            <div className='space-y-4'>
              <FaqItem
                answer={t('landing.faq.items.q1.answer')}
                question={t('landing.faq.items.q1.question')}
              />
              <FaqItem
                answer={t('landing.faq.items.q2.answer')}
                question={t('landing.faq.items.q2.question')}
              />
              <FaqItem
                answer={t('landing.faq.items.q3.answer')}
                question={t('landing.faq.items.q3.question')}
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className='py-24'>
          <div className='container mx-auto px-6 text-center'>
            <p className='mb-8 text-sm font-semibold tracking-widest text-primary uppercase'>
              {t('landing.socialProof.title')}
            </p>
            <div className='flex flex-wrap justify-center gap-12 md:gap-24'>
              <StatItem label={t('landing.socialProof.stat1')} />
              <StatItem label={t('landing.socialProof.stat2')} />
              <StatItem label={t('landing.socialProof.stat3')} />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className='py-24'>
          <div className='container mx-auto px-6'>
            <div className='relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl'>
              <div className='absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
              <div className='absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/10 blur-3xl' />

              <h2 className='relative mb-6 text-3xl font-bold md:text-5xl'>
                Ready to take control?
              </h2>
              <p className='relative mx-auto mb-10 max-w-xl text-lg opacity-90 md:text-xl'>
                Join thousands of families managing their finances together.
              </p>
              <Button
                asChild
                className='relative h-14 rounded-full bg-white px-10 text-lg font-bold text-primary hover:bg-white/90 active:scale-95'
                size='lg'>
                <Link href={PATHS.APP_ROOT}>Get Started for Free</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='border-t border-border/40 bg-secondary/5 px-6 py-12'>
        <div className='container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row'>
          <div className='flex items-center gap-2 opacity-70'>
            <Wallet className='h-5 w-5' />
            <span className='font-bold tracking-tight'>Household Finance</span>
          </div>
          <p className='text-sm text-muted-foreground'>
            {t('landing.footer.rights')}
          </p>
          <div className='flex items-center gap-6'>
            <Link
              className='text-sm text-muted-foreground transition-colors hover:text-primary'
              href='#'>
              Terms
            </Link>
            <Link
              className='text-sm text-muted-foreground transition-colors hover:text-primary'
              href='#'>
              Privacy
            </Link>
            <Link
              className='text-sm text-muted-foreground transition-colors hover:text-primary'
              href='#'>
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className='group rounded-3xl border border-border/50 bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl'>
      <div className='mb-6 w-fit rounded-2xl bg-primary/5 p-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
        <Icon className='h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground' />
      </div>
      <h3 className='mb-3 text-xl font-bold'>{title}</h3>
      <p className='leading-relaxed text-muted-foreground'>{description}</p>
    </div>
  )
}

function StepItem({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <div className='relative flex flex-col items-center text-center'>
      <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/10 bg-primary/5 text-2xl font-black text-primary'>
        {number}
      </div>
      <h3 className='mb-3 text-xl font-bold'>{title}</h3>
      <p className='leading-relaxed text-muted-foreground'>{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author }: { quote: string; author: string }) {
  return (
    <div className='rounded-3xl border border-border/50 bg-background p-8 shadow-sm'>
      <div className='mb-6 text-primary'>
        <MessageSquare className='h-8 w-8 fill-primary/10' />
      </div>
      <p className='mb-6 leading-relaxed text-muted-foreground italic'>
        &quot;{quote}&quot;
      </p>
      <div className='flex items-center gap-4'>
        <div className='h-10 w-10 rounded-full bg-secondary' />
        <span className='font-bold'>{author}</span>
      </div>
    </div>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='overflow-hidden rounded-2xl border border-border/50 bg-background transition-all'>
      <button
        className='flex w-full items-center justify-between p-6 text-left hover:bg-muted/50'
        onClick={() => setIsOpen(!isOpen)}>
        <span className='font-bold'>{question}</span>
        <ChevronDown
          className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      {isOpen && (
        <div className='animate-in border-t border-border/50 p-6 pt-4 text-muted-foreground duration-200 slide-in-from-top-2'>
          {answer}
        </div>
      )}
    </div>
  )
}

function StatItem({ label }: { label: string }) {
  const parts = label.split(' ')
  const number = parts[0]
  const text = parts.slice(1).join(' ')

  return (
    <div className='flex flex-col items-center'>
      <span className='text-3xl font-bold tracking-tight md:text-4xl'>
        {number}
      </span>
      <span className='mt-2 text-center text-sm text-muted-foreground'>
        {text}
      </span>
    </div>
  )
}
