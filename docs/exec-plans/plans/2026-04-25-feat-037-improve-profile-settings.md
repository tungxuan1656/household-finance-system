# ExecPlan: Improve Profile Settings & Cloudinary Media Upload

This document is a self-contained Execution Plan ("ExecPlan") to guide the implementation of `feat-037`.

---

## Title
Improve Profile Settings UI and Implement Cloudinary Upload Flow

## Purpose / Big Picture
Revamp the Profile Settings page to improve visual aesthetics, UX, and responsiveness, aligning it with modern design standards. Transition the avatar upload mechanism from legacy Firebase to the new Cloudinary pre-signed URL media upload flow, ensuring a unified and scalable media pipeline across the application.

## Scope
- **In Scope:**
  - `apps/web/src/pages/app/profile-settings-page.tsx`: Redesign the layout, improve form aesthetics, and update the avatar upload flow to use `uploadMediaViaCloudinary`.
  - `harness/feature_index.json`: Add `feat-037` entry.
  - `harness/features/feat-037.json`: Create the feature status file.
- **Out of Scope:**
  - Modifying backend Cloudinary signature endpoints (already implemented in `feat-036`).
  - Altering other app settings pages outside of profile settings.

## Non-negotiable Requirements
- The plan must be self-contained.
- The plan must produce observable behaviour or tests demonstrating success.
- Every technical term must be defined in-place.

## Progress
- [ ] Create execution plan (this document).
- [ ] Add `feat-037` to `harness/feature_index.json` and create `harness/features/feat-037.json`.
- [ ] Refactor `apps/web/src/pages/app/profile-settings-page.tsx` for enhanced UI and Cloudinary integration.
- [ ] Verify functionality via `./init.sh` and manual testing.
- [ ] Update `harness/progress.md` with session results.

## Surprises & Discoveries
- *(To be filled during implementation)*

## Decision Log
- **Decision:** Use `uploadMediaViaCloudinary` and deprecate `uploadProfileAvatar`.
  **Rationale:** Unifies media uploads to a single provider (Cloudinary) and leverages the secure, signed upload pattern established in `feat-036`.
  **Date/Author:** 2026-04-25 / Agent

## Outcomes & Retrospective
- *(To be filled upon completion)*

## Context and Orientation
- Settings Page: `apps/web/src/pages/app/profile-settings-page.tsx`
- Cloudinary Hook/Util: `apps/web/src/lib/media/cloudinary-upload.ts`
- Media Types: `apps/web/src/types/media.ts`

## Plan of Work (Narrative)
1. **Harness Updates**: Register `feat-037` in `harness/feature_index.json` as `pending`. Create `harness/features/feat-037.json`.
2. **Settings UI Redesign**:
   - Update `profile-settings-page.tsx` to use a more refined layout. Use improved spacing and card layout for a premium feel.
   - Restructure the Avatar and Camera button section to overlap or be side-by-side elegantly.
3. **Cloudinary Integration**:
   - In `profile-settings-page.tsx`, replace `import { uploadProfileAvatar } from '@/lib/firebase/storage'` with `import { uploadMediaViaCloudinary } from '@/lib/media/cloudinary-upload'`.
   - Update the `handleAvatarUpload` method to use `uploadMediaViaCloudinary` passing the file and a `signatureRequest` payload with `resourceType: 'image'`, `mimeType`, `sizeBytes`, and `feature: 'profile-avatar'`.
   - Use the returned `secureUrl` from Cloudinary as the new `avatarUrl` to mutate the user profile.
4. **Verification**: Run workspace checks (`./init.sh`) to ensure no TypeScript or linting errors, and manually verify the upload works.

## Concrete Steps (Commands)

```bash
# Full workspace verification
./init.sh
```

## Validation and Acceptance
- The UI in `/app/settings` looks polished and follows mobile-first design principles.
- Changing the avatar successfully uploads the image to Cloudinary and updates the profile in the database.
- `pnpm --filter @app/web lint` and `pnpm --filter @app/web typecheck` pass with no errors.

## Idempotence & Recovery
- Safe to re-run. If upload fails, the previous avatar remains intact.

## Interfaces & Dependencies
- `uploadMediaViaCloudinary` from `@/lib/media/cloudinary-upload`.
- `RequestUploadSignaturePayload` requiring `feature`, `mimeType`, `resourceType`, `sizeBytes`.
