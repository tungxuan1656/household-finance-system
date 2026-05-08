import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MockNextLink } from './mock-next-link'

describe('MockNextLink', () => {
  it('renders anchor with href and children', () => {
    render(
      <MockNextLink href='/settings'>
        <span>Settings</span>
      </MockNextLink>,
    )

    const link = screen.getByRole('link', { name: 'Settings' })

    expect(link).toHaveAttribute('href', '/settings')
  })
})
