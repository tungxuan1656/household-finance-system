'use client'

import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Group,
  Home,
  LogOut,
  Settings,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import { useRef } from 'react'
import { toast } from 'sonner'

import {
  ConfirmDialog,
  type ConfirmDialogHandle,
} from '@/components/shared/confirm-dialog'
import {
  PageContainer,
  PageContent,
  PageHeader,
} from '@/components/shared/page'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '@/components/ui/item'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { signOutCurrentSession } from '@/lib/auth/session-service'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

const ACCOUNT_NAV_ITEMS = [
  {
    Icon: Group,
    label: t('app.account.nav.groups'),
    description: t('app.account.nav.groupsDescription'),
    href: PATHS.GROUPS,
  },
  {
    Icon: Home,
    label: t('app.account.nav.households'),
    description: t('app.account.nav.householdsDescription'),
    href: PATHS.HOUSEHOLDS,
  },
  {
    Icon: Wallet,
    label: t('app.account.nav.budgets'),
    description: t('app.account.nav.budgetsDescription'),
    href: PATHS.BUDGETS,
  },
]

const PERSONAL_NAV_ITEMS = [
  {
    Icon: Settings,
    label: t('app.account.nav.accountInfo'),
    description: t('app.account.nav.accountInfoDescription'),
    href: PATHS.SETTINGS,
  },
]

const getAvatarFallback = (displayName: string | null, email: string | null) =>
  (displayName?.trim() || email?.trim() || 'U').slice(0, 2).toUpperCase()

function AccountNavItem({
  Icon,
  label,
  description,
  href,
}: (typeof ACCOUNT_NAV_ITEMS)[number]) {
  return (
    <Item asChild variant='default'>
      <Link href={href}>
        <ItemMedia
          aria-hidden='true'
          className='shrink-0 text-primary'
          variant='icon'>
          <Icon className='size-5' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{label}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
        <ItemActions className='text-muted-foreground'>
          <ArrowRight aria-hidden='true' className='size-4' />
        </ItemActions>
      </Link>
    </Item>
  )
}

function PersonalNavItem({
  Icon,
  label,
  description,
  href,
}: (typeof PERSONAL_NAV_ITEMS)[number]) {
  return (
    <Item asChild variant='default'>
      <Link href={href}>
        <ItemMedia
          aria-hidden='true'
          className='shrink-0 text-primary'
          variant='icon'>
          <Icon className='size-5' />
        </ItemMedia>
        <ItemContent>
          <ItemTitle>{label}</ItemTitle>
          <ItemDescription>{description}</ItemDescription>
        </ItemContent>
        <ItemActions className='text-muted-foreground'>
          <ArrowRight aria-hidden='true' className='size-4' />
        </ItemActions>
      </Link>
    </Item>
  )
}

const { version } = require('@/../package.json') as { version: string }

function AccountPage() {
  const signOutDialogRef = useRef<ConfirmDialogHandle>(null)
  const profileQuery = useCurrentUserProfileQuery()

  const handleSignOutConfirm = async () => {
    await signOutCurrentSession()
    toast.success(t('app.settings.accountActions.signOut.done'))
  }

  return (
    <PageContainer>
      <PageHeader title={t('app.account.title')} />
      <PageContent>
        <div className='flex flex-col gap-5'>
          {/* Profile Section */}
          <div className='flex flex-col items-center gap-4 rounded-3xl bg-card p-8'>
            <div className='relative'>
              <Avatar className='size-28!' size='lg'>
                <AvatarImage src={profileQuery.data?.avatarUrl ?? undefined} />
                <AvatarFallback className='text-3xl'>
                  {getAvatarFallback(
                    profileQuery.data?.displayName ?? null,
                    profileQuery.data?.email ?? null,
                  )}
                </AvatarFallback>
              </Avatar>
              <Link
                className='absolute -right-1 -bottom-1 rounded-full bg-primary p-2 text-primary-foreground shadow-sm transition-colors hover:bg-primary/90'
                href={PATHS.SETTINGS}>
                <Camera aria-hidden='true' className='size-4' />
              </Link>
            </div>
            <div className='flex flex-col items-center gap-2 text-center'>
              <div className='flex items-center gap-2'>
                <span className='text-xl font-semibold'>
                  {profileQuery.data?.displayName ?? '-'}
                </span>
                <BadgeCheck
                  aria-label='Verified'
                  className='size-6 shrink-0 fill-primary text-primary'
                />
              </div>
              <span className='text-sm text-muted-foreground'>
                {profileQuery.data?.email ?? '-'}
              </span>
              <span className='mt-1 rounded-full bg-primary/10 px-4 py-1 text-xs font-medium tracking-wide text-primary uppercase'>
                {t('app.account.proBadge')}
              </span>
            </div>
          </div>

          {/* Account & Management Section */}
          <div className='flex flex-col gap-2'>
            <h2 className='px-1 text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              {t('app.account.section.accountManagement')}
            </h2>
            <div className='flex flex-col rounded-2xl bg-card'>
              {ACCOUNT_NAV_ITEMS.map((item, index) => (
                <div key={item.label}>
                  {index > 0 ? (
                    <ItemSeparator className='mx-4 w-auto!' />
                  ) : null}
                  <AccountNavItem {...item} />
                </div>
              ))}
            </div>
          </div>

          {/* Personal Section */}
          <div className='flex flex-col gap-2'>
            <h2 className='px-1 text-xs font-medium tracking-wider text-muted-foreground uppercase'>
              {t('app.account.section.personal')}
            </h2>
            <div className='flex flex-col rounded-2xl bg-card'>
              {PERSONAL_NAV_ITEMS.map((item) => (
                <div key={item.label}>
                  <PersonalNavItem {...item} />
                </div>
              ))}
              <ItemSeparator className='mx-4 w-auto!' />
              <Button
                className='h-auto w-full justify-start gap-4 rounded-none px-4 py-3.5 text-left'
                type='button'
                variant='ghost'
                onClick={() => signOutDialogRef.current?.open()}>
                <LogOut
                  aria-hidden='true'
                  className='mt-0.5 size-5 shrink-0 text-destructive'
                />
                <span className='flex flex-col gap-1'>
                  <span className='font-medium text-destructive'>
                    {t('common.actions.signOut')}
                  </span>
                </span>
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className='flex flex-col items-center gap-1 pt-4 pb-2'>
            <p className='text-sm text-muted-foreground'>
              {t('app.account.version', { version })}
            </p>
            <p className='text-xs text-muted-foreground'>
              {t('app.account.copyright')}
            </p>
          </div>
        </div>

        <ConfirmDialog
          ref={signOutDialogRef}
          cancelLabel={t('common.actions.cancel')}
          confirmLabel={t('common.actions.signOut')}
          description={t('app.settings.accountActions.signOut.description')}
          title={t('app.settings.accountActions.signOut.title')}
          onConfirm={handleSignOutConfirm}
        />
      </PageContent>
    </PageContainer>
  )
}

export { AccountPage }
