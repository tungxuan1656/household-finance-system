'use client'

import {
  ArrowRight,
  BarChart3,
  ShieldCheck,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

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
                icon={<Users className='h-8 w-8 text-primary' />}
                title={t('landing.features.items.familyFirst.title')}
              />
              <FeatureCard
                description={t(
                  'landing.features.items.simpleTracking.description',
                )}
                icon={<Zap className='h-8 w-8 text-primary' />}
                title={t('landing.features.items.simpleTracking.title')}
              />
              <FeatureCard
                description={t(
                  'landing.features.items.budgetControl.description',
                )}
                icon={<ShieldCheck className='h-8 w-8 text-primary' />}
                title={t('landing.features.items.budgetControl.title')}
              />
              <FeatureCard
                description={t(
                  'landing.features.items.actionableInsights.description',
                )}
                icon={<BarChart3 className='h-8 w-8 text-primary' />}
                title={t('landing.features.items.actionableInsights.title')}
              />
            </div>
          </div>
        </section>

        {/* Social Proof / Stats */}
        <section className='py-20'>
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
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode
  title: string
  description: string
}) {
  return (
    <div className='group rounded-3xl border border-border/50 bg-background p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl'>
      <div className='mb-6 w-fit rounded-2xl bg-primary/5 p-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
        {icon}
      </div>
      <h3 className='mb-3 text-xl font-bold'>{title}</h3>
      <p className='leading-relaxed text-muted-foreground'>{description}</p>
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
      <span className='mt-2 text-sm text-muted-foreground'>{text}</span>
    </div>
  )
}
