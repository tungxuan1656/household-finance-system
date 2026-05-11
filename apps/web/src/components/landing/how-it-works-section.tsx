interface StepItemProps {
  description: string
  number: number
  title: string
}

export function StepItem({ description, number, title }: StepItemProps) {
  return (
    <div className='relative flex flex-col items-center text-center'>
      <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary/10 bg-primary/5 text-2xl font-black text-primary'>
        {number}
      </div>
      <h3 className='mb-3 text-xl font-bold'>{title}</h3>
      <p className='leading-relaxed text-muted-foreground'>{description}</p>
    </div>
  )
}

interface HowItWorksSectionProps {
  steps: Array<{
    description: string
    title: string
  }>
  title: string
}

export function HowItWorksSection({ steps, title }: HowItWorksSectionProps) {
  return (
    <section className='py-20 md:py-32'>
      <div className='container mx-auto px-6'>
        <h2 className='mb-16 text-center text-3xl font-bold md:text-4xl lg:text-5xl'>
          {title}
        </h2>
        <div className='grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-12'>
          {steps.map((step, index) => (
            <StepItem
              key={step.title}
              description={step.description}
              number={index + 1}
              title={step.title}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
