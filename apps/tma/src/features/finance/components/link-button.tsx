import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { type ButtonVariant, buttonVariants } from '@/components/ui'

export const LinkButton = ({
  children,
  className,
  to,
  variant = 'primary',
}: {
  children: ReactNode
  className?: string
  to: string
  variant?: ButtonVariant
}) => (
  <Link className={buttonVariants({ className, variant })} to={to}>
    {children}
  </Link>
)
