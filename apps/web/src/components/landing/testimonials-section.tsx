'use client'

import { MessageSquare } from 'lucide-react'

interface TestimonialCardProps {
  author: string
  quote: string
}

export function TestimonialCard({ author, quote }: TestimonialCardProps) {
  return (
    <div className='rounded-3xl border border-border/50 bg-background p-6 shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md md:p-8'>
      <div className='mb-6 text-primary'>
        <MessageSquare className='h-8 w-8 fill-primary/10' />
      </div>
      <p className='mb-6 leading-relaxed text-muted-foreground italic'>
        &quot;{quote}&quot;
      </p>
      <div className='flex items-center gap-4'>
        <div className='h-10 w-10 rounded-full bg-secondary' />
        <span className='font-bold'>{author}</span>
      </div>
    </div>
  )
}

interface TestimonialsSectionProps {
  items: Array<{
    author: string
    quote: string
  }>
  title: string
}

export function TestimonialsSection({
  items,
  title,
}: TestimonialsSectionProps) {
  return (
    <section className='py-24'>
      <div className='container mx-auto px-6'>
        <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
          {title}
        </h2>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-3'>
          {items.map((item) => (
            <TestimonialCard
              key={item.author}
              author={item.author}
              quote={item.quote}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
