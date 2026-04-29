import { AcceptInvitationPage } from '@/views/invitations/accept-invitation-page'

export default async function InvitationAcceptRoute({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  return <AcceptInvitationPage token={token} />
}
