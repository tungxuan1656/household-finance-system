import { AcceptInvitationPage } from '@/features/invitations/pages/accept-invitation-page'

export default async function InvitationAcceptRoute({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return <AcceptInvitationPage token={token} />
}
