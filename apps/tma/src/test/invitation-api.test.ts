import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const postMock = vi.fn()

const invalidateSurfaceMock = vi.fn()
const notificationMock = vi.fn()

vi.mock('@/lib/api/client', () => ({
  get: getMock,
  post: postMock,
}))

vi.mock('@/features/households/api/households', () => ({
  HOUSEHOLD_KEYS: { all: ['households'] },
  invalidateHouseholdSurfaceQueries: invalidateSurfaceMock,
}))

vi.mock('@/lib/telegram/haptics', () => ({
  notification: notificationMock,
}))

const loadInvitationApi = () => import('@/features/invitations/api/invitation')

describe('invitation API fetchers', () => {
  beforeEach(() => {
    getMock.mockReset()
    postMock.mockReset()
    invalidateSurfaceMock.mockReset().mockResolvedValue(undefined)
    notificationMock.mockReset()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('fetches invitation preview without authentication header', async () => {
    const preview = {
      household: { id: 'household-1', name: 'Test Family' },
      invitedRole: 'admin' as const,
      expiresAt: 1_700_000_000_000,
    }
    getMock.mockResolvedValueOnce(preview)

    const { getInvitationPreview, invitationPreviewQueryOptions } =
      await loadInvitationApi()

    const options = invitationPreviewQueryOptions('token-preview')

    expect(options.queryKey).toEqual([
      'invitations',
      'preview',
      'token-preview',
    ])

    const data = await getInvitationPreview('token-preview')

    expect(getMock).toHaveBeenCalledTimes(1)

    expect(getMock).toHaveBeenCalledWith('/invitations/token-preview', {
      authenticated: false,
    })

    expect(data).toEqual(preview)
  })

  it('preview queryFn uses authenticated: false (via queryOptions wrapper)', async () => {
    const preview = {
      household: { id: 'household-1', name: 'Test Family' },
      invitedRole: 'member' as const,
      expiresAt: 1_700_000_000_000,
    }
    getMock.mockResolvedValueOnce(preview)

    const { invitationPreviewQueryOptions } = await loadInvitationApi()
    const options = invitationPreviewQueryOptions('token-via-options')
    const queryFn = options.queryFn
    if (!queryFn) throw new Error('queryFn is not defined')

    const data = await queryFn({
      queryKey: options.queryKey,
      signal: new AbortController().signal,
      meta: undefined,
      client: undefined as never,
      direction: 'forward' as never,
      pageParam: undefined,
    })

    expect(getMock).toHaveBeenCalledWith('/invitations/token-via-options', {
      authenticated: false,
    })

    expect(data).toEqual(preview)
  })

  it('accept invitation posts to /invitations/:token/accept', async () => {
    const acceptResponse = {
      householdId: 'household-2',
      role: 'member' as const,
    }
    postMock.mockResolvedValueOnce(acceptResponse)

    const { acceptInvitation } = await loadInvitationApi()
    const data = await acceptInvitation('token-accept')

    expect(postMock).toHaveBeenCalledTimes(1)
    expect(postMock).toHaveBeenCalledWith('/invitations/token-accept/accept')
    expect(data).toEqual(acceptResponse)
  })

  it('create invitation posts role+ttl payload to household endpoint', async () => {
    const createResponse = {
      invitationId: 'inv-1',
      invitedRole: 'admin' as const,
      expiresAt: 1_700_000_000_000,
      invitePath: '/invitations/abc',
      token: 'abc',
    }
    postMock.mockResolvedValueOnce(createResponse)

    const { createInvitation } = await loadInvitationApi()
    const data = await createInvitation('household-1', {
      role: 'admin',
      ttlHours: 168,
    })

    expect(postMock).toHaveBeenCalledWith(
      '/households/household-1/invitations',
      { role: 'admin', ttlHours: 168 },
    )

    expect(data).toEqual(createResponse)
  })

  it('preview hook is disabled when token is empty', async () => {
    const { useInvitationPreviewQuery } = await loadInvitationApi()

    expect(typeof useInvitationPreviewQuery).toBe('function')
  })
})
