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
- [x] Create execution plan (this document).
- [x] Add `feat-037` to `harness/feature_index.json` and create `harness/features/feat-037.json`.
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
1. **Harness Updates**: Register `feat-037` in `harness/feature_index.json` as `pending`. Create `harness/features/feat-037.json` (Already done).
2. **Settings UI Redesign**:
   - **Evaluate Current UI**: The Avatar and the "Change Avatar" button are stacked in a column, which takes up unnecessary vertical space and feels disjointed. It lacks a `CardDescription` to provide context for the settings section.
   - **Improvement**: Update `profile-settings-page.tsx` to use a more refined layout. Use `<CardDescription>` to provide context.
   - **Avatar Area Redesign**: Restructure the Avatar and Camera button section. Use a side-by-side flex layout (Avatar on the left, Name/Action on the right) for the profile header area. Separate the Profile Picture section and the Form section using a `<Separator />` or distinct padding.
   - **Form Refinements**: Keep the `FieldGroup` + `Field` composition as required by the Shadcn guide. Improve the layout structure using generic flex/grid utilities (`flex`, `items-center`, `gap-6`).
3. **Cloudinary Integration**:
   - In `profile-settings-page.tsx`, replace `import { uploadProfileAvatar } from '@/lib/firebase/storage'` with `import { uploadMediaViaCloudinary } from '@/lib/media/cloudinary-upload'`.
   - Update the `handleAvatarUpload` method to use `uploadMediaViaCloudinary` passing the file and a `signatureRequest` payload with `resourceType: 'image'`, `mimeType`, `sizeBytes`, and `feature: 'profile-avatar'`.
   - Use the returned `secureUrl` from Cloudinary as the new `avatarUrl` to mutate the user profile. Ensure loading states (`isSubmitting` or `mutation.isPending`) disable inputs correctly.
4. **Verification**: Run workspace checks (`./init.sh`) to ensure no TypeScript or linting errors, and manually verify the upload works.

## Concrete Steps (Commands)

```bash
# Full workspace verification
./init.sh
```

## Validation and Acceptance
- The UI in `/app/settings` looks polished, includes a `CardDescription`, and follows a side-by-side or well-spaced layout for the avatar and form.
- Changing the avatar successfully uploads the image to Cloudinary and updates the profile in the database.
- `pnpm --filter @app/web lint` and `pnpm --filter @app/web typecheck` pass with no errors.

## Idempotence & Recovery
- Safe to re-run. If upload fails, the previous avatar remains intact.

## Interfaces & Dependencies
- `uploadMediaViaCloudinary` from `@/lib/media/cloudinary-upload`.
- `RequestUploadSignaturePayload` requiring `feature`, `mimeType`, `resourceType`, `sizeBytes`.
