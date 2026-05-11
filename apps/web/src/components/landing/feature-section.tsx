'use client'

import { BarChart3, ShieldCheck, Users, Zap } from 'lucide-react'

interface FeatureCardProps {
  description: string
  icon: React.ComponentType<{ className?: string }>
  title: string
}

export function FeatureCard({
  description,
  icon: Icon,
  title,
}: FeatureCardProps) {
  return (
    <div className='group rounded-3xl border border-border/50 bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl md:p-8'>
      <div className='mb-6 w-fit rounded-2xl bg-primary/5 p-4 transition-colors group-hover:bg-primary group-hover:text-primary-foreground'>
        <Icon className='h-8 w-8 text-primary transition-colors group-hover:text-primary-foreground' />
      </div>
      <h3 className='mb-3 text-xl font-bold'>{title}</h3>
      <p className='leading-relaxed text-muted-foreground'>{description}</p>
    </div>
  )
}

interface FeatureSectionProps {
  items: Array<{
    description: string
    icon: React.ComponentType<{ className?: string }>
    title: string
  }>
  title: string
}

export function FeatureSection({ items, title }: FeatureSectionProps) {
  return (
    <section className='relative bg-secondary/10 py-24'>
      <div className='container mx-auto px-6'>
        <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
          {title}
        </h2>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4'>
          {items.map((item) => (
            <FeatureCard
              key={item.title}
              description={item.description}
              icon={item.icon}
              title={item.title}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export const features = [
  {
    description: 'Track expenses together with family members',
    icon: Users,
    title: 'Family First',
  },
  {
    description: 'Add expenses in seconds with smart categorization',
    icon: Zap,
    title: 'Simple Tracking',
  },
  {
    description: 'Set budgets and stay in control of spending',
    icon: ShieldCheck,
    title: 'Budget Control',
  },
  {
    description: 'Visualize spending patterns and trends',
    icon: BarChart3,
    title: 'Actionable Insights',
  },
]
