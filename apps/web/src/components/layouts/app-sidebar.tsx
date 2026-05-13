'use client'

import { LogOut } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
    <aside className='h-full'>
      <Card className='flex h-full flex-col'>
        <CardHeader>
          <CardTitle>{t('shell.protected.title')}</CardTitle>
          <CardDescription>{t('shell.protected.description')}</CardDescription>
        </CardHeader>

        <CardContent className='flex flex-1 flex-col'>
          <nav
            aria-label={t('shell.protected.nav.ariaLabel')}
            className='flex flex-1 flex-col gap-2'>
            {APP_MENU_ITEMS.map((item) => {
              const isActive =
                item.to === PATHS.APP_ROOT
                  ? pathname === item.to
                  : pathname === item.to || pathname.startsWith(`${item.to}/`)

              return (
                <Button
                  key={item.to}
                  asChild
                  className='w-full justify-start gap-3'
                  variant={isActive ? 'default' : 'ghost'}>
                  <Link href={item.to}>
                    <item.icon data-icon='inline-start' />
                    {t(item.labelKey)}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </CardContent>

        <CardFooter className='flex flex-col gap-3'>
          <div className='flex items-center gap-3'>
            <Avatar>
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
            className='w-full gap-2'
            variant={'ghost'}
            onClick={onSignOut}>
            <LogOut data-icon='inline-start' />
            {t('common.actions.signOut')}
          </Button>
        </CardFooter>
      </Card>
    </aside>
  )
}
