'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import { APP_MENU_ITEMS } from '@/lib/constants/navigation'
import { PATHS } from '@/lib/constants/paths'
import { t } from '@/lib/i18n/t'

interface AppSidebarProps {
  onSignOut: () => void
}

export function AppSidebar({ onSignOut }: AppSidebarProps) {
  const pathname = usePathname()
  const { data: profile } = useCurrentUserProfileQuery()

  return (
    <aside className='flex h-full flex-col gap-6 rounded-lg bg-background p-4 shadow-sm'>
      {/* Header */}
      <div className='space-y-1'>
        <h2 className='font-heading text-lg font-semibold'>
          {t('shell.protected.title')}
        </h2>
        <p className='text-xs text-muted-foreground'>
          {t('shell.protected.description')}
        </p>
      </div>

      {/* Navigation */}
      <nav
        aria-label={t('shell.protected.nav.ariaLabel')}
        className='flex flex-1 flex-col gap-2'>
        {APP_MENU_ITEMS.map((item) => {
          const isActive =
            item.to === PATHS.APP_ROOT
              ? pathname === item.to
              : pathname === item.to || pathname.startsWith(`${item.to}/`)

          return (
            <Link
              key={item.to}
              className={[
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150',
                isActive
                  ? 'relative bg-primary text-primary-foreground before:absolute before:top-1/2 before:left-0 before:h-5 before:w-0.5 before:-translate-y-1/2 before:rounded-full before:bg-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              ].join(' ')}
              href={item.to}>
              <item.icon className='h-5 w-5 shrink-0' />
              {t(item.labelKey)}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className='flex flex-col gap-3 border-t border-border/50 pt-4'>
        <div className='flex items-center gap-3'>
          <Avatar size='sm'>
            <AvatarImage
              alt={profile?.displayName ?? ''}
              src={profile?.avatarUrl ?? undefined}
            />
            <AvatarFallback>
              {(profile?.displayName ?? 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='flex min-w-0 flex-col'>
            <span className='truncate text-sm font-medium'>
              {profile?.displayName ?? t('shell.protected.title')}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {profile?.email ?? ''}
            </span>
          </div>
        </div>
        <Button
          className='w-full justify-start gap-2 text-muted-foreground hover:text-foreground'
          size='sm'
          variant='ghost'
          onClick={onSignOut}>
          <LogOut className='h-4 w-4' />
          {t('common.actions.signOut')}
        </Button>
      </div>
    </aside>
  )
}
