import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ChevronRightIcon } from '@/components/shared/tma-icons'
import { selection } from '@/lib/telegram/haptics'

export const TmaInlineAction = ({
  children,
  href,
  state,
}: {
  children: ReactNode
  href: string
  state?: unknown
}) => (
  <Link
    className='inline-flex items-center gap-1 text-xs font-bold text-tma-primary'
    state={state}
    to={href}
    onClick={() => selection()}>
    {children}
    <ChevronRightIcon height='14' width='14' />
  </Link>
)
