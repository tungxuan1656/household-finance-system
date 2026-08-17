import type { ReactNode } from 'react'

export const TmaPageHeader = ({
  title,
  eyebrow,
  subtitle,
  leading,
  trailing,
}: {
  title: string
  eyebrow?: string
  subtitle?: ReactNode
  leading?: ReactNode
  trailing?: ReactNode
}) => (
  <section className='flex items-start justify-between gap-3 px-1 py-3 md:px-6'>
    <div className='flex min-w-0 items-center gap-3'>
      {leading ? (
        <div className='grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-primary/20 to-emerald-500/30 text-sm font-bold text-foreground shadow-[inset_0_0_0_1px_rgba(255,255,255,0.5)]'>
          {leading}
        </div>
      ) : null}
      <div className='min-w-0'>
        {eyebrow ? (
          <p className='m-0 text-[11px] font-bold tracking-[0.04em] text-muted-foreground uppercase'>
            {eyebrow}
          </p>
        ) : null}
        <h2 className='m-0 mt-1 text-xl leading-tight font-bold text-foreground'>
          {title}
        </h2>
        {subtitle ? (
          <p className='m-0 mt-1 text-sm leading-normal text-muted-foreground'>
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>

    {trailing ? (
      <div className='flex shrink-0 items-center gap-2'>{trailing}</div>
    ) : null}
  </section>
)

export const TmaPageTitleBar = ({ title }: { title: string }) => (
  <header className='grid min-h-11 place-items-center'>
    <h1 className='m-0 text-base leading-tight font-bold text-foreground'>
      {title}
    </h1>
  </header>
)
