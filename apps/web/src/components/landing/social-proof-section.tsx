interface StatItemProps {
  label: string
}

export function StatItem({ label }: StatItemProps) {
  const parts = label.split(' ')
  const number = parts[0]
  const text = parts.slice(1).join(' ')

  return (
    <div className='flex flex-col items-center'>
      <span className='text-3xl font-bold tracking-tight md:text-4xl'>
        {number}
      </span>
      <span className='mt-2 text-center text-sm text-muted-foreground'>
        {text}
      </span>
    </div>
  )
}

interface SocialProofSectionProps {
  stats: string[]
  title: string
}

export function SocialProofSection({ stats, title }: SocialProofSectionProps) {
  return (
    <section className='py-20 md:py-32'>
      <div className='container mx-auto px-6 text-center'>
        <p className='mb-12 text-sm font-semibold tracking-widest text-primary uppercase'>
          {title}
        </p>
        <div className='grid grid-cols-1 gap-8 sm:grid-cols-3 md:gap-24'>
          {stats.map((stat) => (
            <StatItem key={stat} label={stat} />
          ))}
        </div>
      </div>
    </section>
  )
}
