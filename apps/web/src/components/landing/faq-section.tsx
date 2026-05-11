'use client'

import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface FaqItemProps {
  answer: string
  question: string
}

export function FaqItem({ answer, question }: FaqItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='overflow-hidden rounded-2xl border border-border/50 bg-background shadow-sm transition-all'>
      <button
        className='flex w-full cursor-pointer items-center justify-between p-6 text-left transition-colors hover:bg-muted/50 focus:outline-none'
        type='button'
        onClick={() => setIsOpen(!isOpen)}>
        <span className='text-lg font-bold'>{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className='border-t border-border/50 p-6 pt-4 leading-relaxed text-muted-foreground'>
          {answer}
        </div>
      </div>
    </div>
  )
}

interface FaqSectionProps {
  items: Array<{
    answer: string
    question: string
  }>
  title: string
}

export function FaqSection({ items, title }: FaqSectionProps) {
  return (
    <section className='bg-secondary/5 py-24'>
      <div className='container mx-auto max-w-3xl px-6'>
        <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl'>
          {title}
        </h2>
        <div className='space-y-4'>
          {items.map((item) => (
            <FaqItem
              key={item.question}
              answer={item.answer}
              question={item.question}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
