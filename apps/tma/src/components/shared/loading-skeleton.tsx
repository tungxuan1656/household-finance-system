import { cn } from '@/lib/utils'

/** Pulse block used inside the skeleton to indicate loading content. */
const Pulse = ({ className }: { className?: string }) => (
  <div
    aria-hidden
    className={cn('animate-pulse rounded-md bg-tma-base-bg/60', className)}
  />
)

/**
 * Layout-shaped loading skeleton that mirrors the AppShell / TmaPageShell
 * structure.  Shown as a Suspense fallback during lazy route chunk loading so
 * users see a familiar scaffold instead of a bare spinner.
 *
 * Hierarchy:
 *  - Header / title bar area (top)
 *  - Content summary card (e.g. FinanceSummaryCard)
 *  - Shortcut grid row (e.g. HomeShortcutsSection)
 *  - Horizontal carousel / list block (e.g. HouseholdPreviewCarousel)
 *  - Bottom safe-area padding matching tab bar height
 */
export const LoadingSkeleton = () => (
  <div
    aria-live='polite'
    className='flex h-dvh flex-col overflow-hidden bg-tma-base-bg pt-(--tma-safe-top) pr-(--tma-safe-right) pl-(--tma-safe-left) text-tma-text-strong'
    data-testid='loading-skeleton'
    role='status'>
    <div className='relative flex min-h-0 flex-1 flex-col overflow-hidden'>
      {/* Title bar area */}
      <div className='flex items-center justify-between px-4 pt-3 pb-2'>
        <Pulse className='h-5 w-32' />
        <Pulse className='h-6 w-20 rounded-full' />
      </div>

      {/* Scrollable content area */}
      <div className='relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-[calc(96px+var(--tma-content-safe-bottom))] [-webkit-overflow-scrolling:touch]'>
        {/* Summary card placeholder */}
        <div className='mb-4 rounded-xl bg-white/60 p-4 shadow-sm'>
          <Pulse className='mb-3 h-4 w-24' />
          <Pulse className='mb-2 h-8 w-36' />
          <Pulse className='h-3 w-48' />
        </div>

        {/* Shortcut grid placeholder (4 items) */}
        <div className='mb-6 grid grid-cols-4 gap-3'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='flex flex-col items-center gap-1.5'>
              <Pulse className='size-12 rounded-full' />
              <Pulse className='h-3 w-14' />
            </div>
          ))}
        </div>

        {/* Horizontal carousel / list block placeholder */}
        <div className='mb-4 space-y-3'>
          <Pulse className='h-5 w-28' />
          <div className='flex gap-3 overflow-hidden'>
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className='flex min-w-48 flex-col gap-2 rounded-xl bg-white/60 p-4 shadow-sm'>
                <Pulse className='h-4 w-20' />
                <Pulse className='h-6 w-32' />
                <Pulse className='h-3 w-24' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <span className='sr-only'>Loading page content</span>
  </div>
)
