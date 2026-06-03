# Profile Management

## Goal

Allow users to manage personal profile data, linked identity providers, and household membership overview in a clear, recoverable way.

## Entry Conditions

- User is authenticated and navigates to Settings / Profile.

## User Flow

1. User opens Profile settings.
2. User edits display name and avatar; changes are previewed and saved.
3. User links/unlinks identity providers (e.g., Google) with clear confirmation and fallback.
4. User views list of households they belong to, with role (Admin / Member) and quick actions (switch household, leave, view details).
5. User can update contact details (optional) and set preferences (currency, default time range).

## Acceptance Criteria

- Profile edits persist and surface immediately in the UI.
- Linking/unlinking identity providers is handled securely and requires re-auth where appropriate.
- User can view and switch between households they belong to.
- Leaving a household requires confirmation and explains consequences; admins cannot leave if they are the only admin without transferring admin role.

## Failure States

- Network error saving profile: show inline validation and retry option.
- Unlinking last auth provider without password fallback: block action and show guidance to add another provider.
- Leave household blocked for last admin: prevent action and surface transfer admin flow.

---

Notes:
- Consider rate-limiting profile updates and auditing important changes (email, provider links, household role changes).