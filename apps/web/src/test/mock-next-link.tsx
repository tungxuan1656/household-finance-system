import type { ReactNode } from 'react'

type MockNextLinkProps = {
  children: ReactNode
  href: string
}

export function MockNextLink({ children, href }: MockNextLinkProps) {
  return <a href={href}>{children}</a>
}
