import { TmaPageHeader, TmaPageShell } from '@/components/shared/tma-page-shell'
import { useAuth } from '@/features/auth/auth-provider'
import { HomeHouseholdsSection } from '@/features/home/components/home-households-section'
import { HomeOverviewSection } from '@/features/home/components/home-overview-section'
import { HomeRecentExpensesSection } from '@/features/home/components/home-recent-expenses-section'
import { HomeShortcutsSection } from '@/features/home/components/home-shortcuts-section'
import { resolveUserName } from '@/features/home/presentation'
import { formatMonthLabel } from '@/lib/formatters'

export const HomePage = () => {
  const { user } = useAuth()
  const userName = resolveUserName(
    user?.displayName ?? null,
    user?.email ?? null,
  )

  return (
    <TmaPageShell title='Trang chủ'>
      <TmaPageHeader
        leading={
          <img
            alt={userName}
            className='tma-avatar-image'
            src={user?.avatarUrl ?? undefined}
          />
        }
        title={userName}
        trailing={
          <span className='tma-chip tma-chip--strong'>
            {formatMonthLabel(new Date())}
          </span>
        }
      />

      <HomeOverviewSection />
      <HomeShortcutsSection />
      <HomeHouseholdsSection />
      <HomeRecentExpensesSection />
    </TmaPageShell>
  )
}
