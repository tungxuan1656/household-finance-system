'use client'

import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import rootPackage from '@/../package.json'
import { PageShell } from '@/components/ui/page-shell'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { t } from '@/lib/i18n/t'
import { MoreShortcutsCard } from '@/views/app/more/more-shortcuts-card'

const { version } = rootPackage

function ThemeTab() {
  const { theme, setTheme } = useTheme()

  return (
    <Tabs value={theme ?? 'system'} onValueChange={setTheme}>
      <TabsList>
        <TabsTrigger value='light'>
          <Sun className='size-4' data-icon='inline-start' />
          Light
        </TabsTrigger>
        <TabsTrigger value='dark'>
          <Moon className='size-4' data-icon='inline-start' />
          Dark
        </TabsTrigger>
        <TabsTrigger value='system'>
          <Monitor className='size-4' data-icon='inline-start' />
          System
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

function MorePage() {
  return (
    <PageShell title={t('app.more.title')}>
      <div className='flex flex-col'>
        <MoreShortcutsCard />
        <div className='mt-6 flex justify-center'>
          <ThemeTab />
        </div>
        <p className='mt-4 text-center text-sm text-muted-foreground'>
          {t('app.more.version', { version })}
        </p>
      </div>
    </PageShell>
  )
}

export { MorePage }
