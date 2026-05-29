'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useCurrentUserProfileQuery } from '@/hooks/api/use-profile'
import {
  BOTTOM_TAB_ITEMS,
  isProtectedNavItemActive,
} from '@/lib/constants/navigation'
import { t } from '@/lib/i18n/t'

interface AppTopNavProps {
  onSignOut: () => void
}

export function AppTopNav({ onSignOut }: AppTopNavProps) {
  const pathname = usePathname()
  const { data: profile } = useCurrentUserProfileQuery()

  return (
    <header className='sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports---height:bg-background'>
      <div className='flex h-14 items-center gap-4 px-4'>
        {/* User Profile - LEFT */}
        <div className='flex items-center gap-2'>
          <Avatar>
            <AvatarImage
              alt={profile?.displayName ?? ''}
              src={profile?.avatarUrl ?? undefined}
            />
            <AvatarFallback>
              {(profile?.displayName ?? 'U').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='hidden flex-col sm:flex'>
            <span className='truncate text-sm font-medium'>
              {profile?.displayName ?? t('shell.protected.title')}
            </span>
            <span className='truncate text-xs text-muted-foreground'>
              {profile?.email ?? ''}
            </span>
          </div>
        </div>

        {/* Nav Items - centered */}
        <nav
          aria-label={t('shell.protected.nav.ariaLabel')}
          className='flex flex-1 items-center justify-center gap-1'>
          {BOTTOM_TAB_ITEMS.map((item) => {
            const isActive = isProtectedNavItemActive(pathname, item.to)

            return (
              <Button
                key={item.to}
                asChild
                className='gap-2 rounded-3xl px-4'
                size='sm'
                variant={isActive ? 'default' : 'ghost'}>
                <Link href={item.to}>
                  <item.icon data-icon='inline-start' />
                  {t(item.labelKey)}
                </Link>
              </Button>
            )
          })}
        </nav>

        {/* Sign Out - RIGHT */}
        <Button
          className='gap-2 rounded-3xl'
          size='sm'
          variant='ghost'
          onClick={onSignOut}>
          <LogOut data-icon='inline-start' />
          <span className='hidden sm:inline'>
            {t('common.actions.signOut')}
          </span>
        </Button>
      </div>
    </header>
  )
}
