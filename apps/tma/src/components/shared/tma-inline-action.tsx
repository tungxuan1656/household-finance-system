import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ChevronRightIcon } from '@/components/shared/tma-icons'
import { selection } from '@/lib/telegram/haptics'

export const TmaInlineAction = ({
  children,
  href,
}: {
  children: ReactNode
  href: string
}) => (
  <Link
    className='inline-flex items-center gap-1 text-xs font-bold text-tma-primary'
    to={href}
    onClick={() => selection()}>
    {children}
    <ChevronRightIcon height='14' width='14' />
  </Link>
)
