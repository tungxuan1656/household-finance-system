import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  backButtonHide: vi.fn(),
  backButtonIsSupported: vi.fn(),
  backButtonOnClick: vi.fn(),
  backButtonShow: vi.fn(),
  impact: vi.fn(),
  useInvitationDeepLinkRedirect: vi.fn(),
  useLocation: vi.fn(),
  useNavigate: vi.fn(),
}))

vi.mock('@tma.js/sdk', () => ({
  backButton: {
    hide: mocks.backButtonHide,
    isSupported: mocks.backButtonIsSupported,
    onClick: mocks.backButtonOnClick,
    show: mocks.backButtonShow,
  },
}))

vi.mock(
  '@/features/invitations/hooks/use-invitation-deep-link-redirect',
  () => ({
    useInvitationDeepLinkRedirect: mocks.useInvitationDeepLinkRedirect,
  }),
)

vi.mock('@/lib/telegram/haptics', () => ({
  impact: mocks.impact,
}))

vi.mock('react-router-dom', () => ({
  Outlet: () => null,
  useLocation: mocks.useLocation,
  useNavigate: mocks.useNavigate,
}))

import RootLayout from '@/app/router/root-layout'

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true })

const renderRootLayout = async (pathname: string, idx: number) => {
  const container = document.createElement('div')
  document.body.appendChild(container)
  window.history.replaceState({ idx }, '', pathname)

  mocks.useLocation.mockReturnValue({
    hash: '',
    key: `${pathname}:${idx}`,
    pathname,
    search: '',
    state: null,
  })

  const root = createRoot(container)

  await act(async () => {
    root.render(<RootLayout />)
  })

  return { container, root }
}

const unmount = async ({
  container,
  root,
}: {
  container: HTMLDivElement
  root: Root
}) => {
  await act(async () => {
    root.unmount()
  })

  container.remove()
}

describe('RootLayout BackButton ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.backButtonIsSupported.mockReturnValue(true)
    mocks.useNavigate.mockReturnValue(vi.fn())
    mocks.backButtonOnClick.mockReturnValue(vi.fn())
  })

  it.each(['/', '/statistics'])(
    'hides without binding on root tab %s',
    async (pathname) => {
      const rendered = await renderRootLayout(pathname, 1)

      expect(mocks.backButtonOnClick).not.toHaveBeenCalled()
      expect(mocks.backButtonShow).not.toHaveBeenCalled()
      expect(mocks.backButtonHide).toHaveBeenCalledTimes(1)

      await unmount(rendered)
    },
  )

  it('binds and navigates back for a secondary route with history', async () => {
    const navigate = vi.fn()
    mocks.useNavigate.mockReturnValue(navigate)

    const rendered = await renderRootLayout('/expenses/expense-1', 1)

    expect(mocks.backButtonOnClick).toHaveBeenCalledTimes(1)
    expect(mocks.backButtonShow).toHaveBeenCalledTimes(1)

    const handler = mocks.backButtonOnClick.mock.calls[0][0] as () => void
    handler()
    expect(navigate).toHaveBeenCalledWith(-1)

    await unmount(rendered)

    expect(mocks.backButtonOnClick.mock.results[0].value).toHaveBeenCalledTimes(
      1,
    )

    expect(mocks.backButtonHide).toHaveBeenCalledTimes(1)
  })

  it('does not bind a direct-entry secondary route without history', async () => {
    const rendered = await renderRootLayout('/expenses/expense-1', 0)

    expect(mocks.backButtonOnClick).not.toHaveBeenCalled()
    expect(mocks.backButtonShow).not.toHaveBeenCalled()
    expect(mocks.backButtonHide).toHaveBeenCalledTimes(1)

    await unmount(rendered)
  })

  it('leaves invitation BackButton ownership to the page', async () => {
    const rendered = await renderRootLayout('/invitations/token-1', 0)

    expect(mocks.backButtonOnClick).not.toHaveBeenCalled()
    expect(mocks.backButtonShow).not.toHaveBeenCalled()
    expect(mocks.backButtonHide).not.toHaveBeenCalled()

    await unmount(rendered)
  })
})
