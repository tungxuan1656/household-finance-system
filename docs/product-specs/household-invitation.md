# Household Invitation

## Goal

Support reliable invite flows (links/codes/email) for onboarding members into a household while maintaining security and auditability.

## Entry Conditions

- An admin or authorized member initiates an invite from household settings or member list.

## User Flow

1. Admin generates an invite link or code with optional role (Member by default) and expiry.
2. Admin can copy link, send via email, or share an in-app invite.
3. Recipient opens link or enters code in app; if unauthenticated, they authenticate first, then accept invite.
4. Accepting invite validates token, adds user to household with designated role, and surfaces a welcome + suggested next actions.
5. Admins can revoke invites, view active invites, and set expirations.
6. Leaving / removing: members can leave voluntarily; admins can remove (kick) members with confirmation and audit.

## Acceptance Criteria

- Invite tokens are single-use or time-bound as configured.
- Invite acceptance validates that the user is not already a member and enforces role assignment.
- Revoked or expired invites cannot be used; UI shows clear error.
- Leaving a household is reversible within retention window via admin restore, unless permanently deleted.

## Failure States

- Invalid/expired token: show actionable error and request a new invite.
- Invite accepted by an account already in household: present a clear state and suggest switching household.
- Network error during acceptance: retry flow preserving token input.

---

Notes:
- Consider rate limits and abuse prevention for invite generation.
- Log invite events for audit and analytics (invites sent, accepted, revoked).