function normalizeInviteToken(value: string) {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return ''
  }

  const invitationPathMatch = trimmedValue.match(/\/invitations\/([^/?#]+)/)

  if (invitationPathMatch) {
    return invitationPathMatch[1]
  }

  return trimmedValue
}

export { normalizeInviteToken }
