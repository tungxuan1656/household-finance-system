'use client'

import {
  ArrowRight,
  CheckCircle2,
  Lock,
  ShieldCheck,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

export function Navigation() {
  return (
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
          className='rounded-full shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95'
          size='lg'>
          <Link href={PATHS.APP_ROOT}>{t('landing.hero.cta')}</Link>
        </Button>
      </div>
    </header>
  )
}

export function HeroSection() {
  return (
    <section className='relative overflow-hidden px-6 pt-32 pb-20 md:pt-48 md:pb-32'>
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
  )
}

export function BottomCtaSection() {
  return (
    <section className='pb-24 md:pb-32'>
      <div className='container mx-auto px-6'>
        <div className='relative overflow-hidden rounded-[2rem] bg-primary px-8 py-16 text-center text-primary-foreground shadow-2xl md:px-16 md:py-24'>
          <div className='absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
          <div className='absolute bottom-0 left-0 -mb-20 -ml-20 h-64 w-64 rounded-full bg-white/10 blur-3xl' />
          <h2 className='relative mb-6 text-3xl font-bold md:text-5xl lg:text-6xl'>
            {t('landing.bottomCta.title')}
          </h2>
          <p className='relative mx-auto mb-10 max-w-xl text-lg opacity-90 md:text-xl'>
            {t('landing.bottomCta.subtitle')}
          </p>
          <Button
            asChild
            className='relative h-14 w-full rounded-full bg-primary-foreground px-10 text-lg font-bold text-primary transition-transform hover:scale-105 hover:bg-primary-foreground/90 active:scale-95 sm:w-auto'
            size='lg'>
            <Link href={PATHS.APP_ROOT}>{t('landing.bottomCta.cta')}</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
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
  )
}

export function SecuritySection() {
  return (
    <section className='bg-primary/5 py-20 md:py-32'>
      <div className='container mx-auto px-6'>
        <div className='flex flex-col items-center gap-16 lg:flex-row lg:items-start lg:gap-12'>
          <div className='w-full flex-1 text-center lg:text-left'>
            <Badge className='mb-4' variant='outline'>
              <Lock className='mr-2 h-3 w-3' />
              Security First
            </Badge>
            <h2 className='mb-6 text-3xl font-bold md:text-4xl lg:text-5xl'>
              {t('landing.security.title')}
            </h2>
            <p className='mx-auto mb-8 max-w-lg text-lg text-muted-foreground lg:mx-0'>
              {t('landing.security.subtitle')}
            </p>
            <div className='mx-auto max-w-md space-y-6 text-left lg:mx-0'>
              <div className='flex items-start gap-4'>
                <div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary'>
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
                <div className='mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary'>
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
          <div className='w-full flex-1 md:max-w-xl lg:pl-12'>
            <SecurityCard />
          </div>
        </div>
      </div>
    </section>
  )
}

export function SecurityCard() {
  return (
    <div className='relative rounded-3xl border border-border/50 bg-background p-6 shadow-2xl md:p-8'>
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
            <span className='text-xs font-medium'>Encryption Status</span>
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
  )
}
