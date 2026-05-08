import './onboarding-page.test-setup'

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { OnboardingPage } from '@/views/app/onboarding-page'

import {
  acceptInvitationMock,
  getInvitationPreviewMock,
  resetOnboardingPageTestState,
  setSearchParamsState,
} from './onboarding-page.test-setup'

describe('OnboardingPage invite flow', () => {
  beforeEach(() => {
    resetOnboardingPageTestState()
  })

  it('lets user switch to join-via-invite flow and preview token invite', async () => {
    render(<OnboardingPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.joinPath' }),
    )

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
      {
        target: { value: 'invite-token-123' },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.previewInvite',
      }),
    )

    await waitFor(() => {
      expect(getInvitationPreviewMock).toHaveBeenCalledWith('invite-token-123')
    })

    expect(screen.getByText('Joined Home')).toBeInTheDocument()

    expect(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.acceptInvite',
      }),
    ).toBeInTheDocument()
  })

  it('normalizes pasted full invite link before preview and accept', async () => {
    render(<OnboardingPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.joinPath' }),
    )

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
      {
        target: {
          value: 'https://app.example.com/invitations/invite-token-123',
        },
      },
    )

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.previewInvite',
      }),
    )

    await waitFor(() => {
      expect(getInvitationPreviewMock).toHaveBeenCalledWith('invite-token-123')
    })

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.acceptInvite',
      }),
    )

    await waitFor(() => {
      expect(acceptInvitationMock).toHaveBeenCalledWith('invite-token-123')
    })
  })

  it('prefills invite token from deep link and clears stale preview when token changes', async () => {
    setSearchParamsState(new URLSearchParams('inviteToken=invite-token-123'))

    const { rerender } = render(<OnboardingPage />)

    fireEvent.click(
      screen.getByRole('button', { name: 'app.onboarding.actions.joinPath' }),
    )

    expect(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
    ).toHaveValue('invite-token-123')

    fireEvent.click(
      screen.getByRole('button', {
        name: 'app.onboarding.actions.previewInvite',
      }),
    )

    await screen.findByText('Joined Home')

    setSearchParamsState(new URLSearchParams('inviteToken=invite-token-789'))
    rerender(<OnboardingPage />)

    expect(screen.queryByText('Joined Home')).not.toBeInTheDocument()

    fireEvent.change(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
      {
        target: { value: 'invite-token-456' },
      },
    )

    expect(screen.queryByText('Joined Home')).not.toBeInTheDocument()
  })

  it('prefills invite token from invite path deep link', () => {
    setSearchParamsState(
      new URLSearchParams('from=%2Finvitations%2Finvite-token-123'),
    )

    render(<OnboardingPage />)

    expect(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
    ).toHaveValue('invite-token-123')
  })

  it('falls back to from when inviteToken query is present but empty', () => {
    setSearchParamsState(
      new URLSearchParams(
        'inviteToken=&from=%2Finvitations%2Finvite-token-123',
      ),
    )

    render(<OnboardingPage />)

    expect(
      screen.getByLabelText('app.onboarding.fields.inviteToken.label'),
    ).toHaveValue('invite-token-123')
  })
})
