## Title

Implement `feat-036` Cloudinary signed media upload foundation (`image` + `video`) for backend and frontend.

## Purpose / Big Picture

This feature establishes a secure, reusable upload flow where the web client cannot upload arbitrary files to Cloudinary without server authorization. The backend generates a short-lived signature from server-controlled parameters and policy checks, then the frontend uses that ticket to upload with `multipart/form-data`. End users will not see a dedicated new page immediately, but upcoming media features can upload through the same shared foundation with consistent security and contract behavior.

## Scope

- Files, modules, and areas changed:
  - `apps/worker/src/contracts/media.ts`
  - `apps/worker/src/routes/media.ts`
  - `apps/worker/src/handlers/media/create-upload-signature.ts`
  - `apps/worker/src/lib/media/cloudinary.ts`
  - `apps/worker/src/index.ts`
  - `apps/worker/src/lib/env.ts`
  - `apps/worker/src/types/app.ts`
  - `apps/web/src/api/media.ts`
  - `apps/web/src/lib/media/cloudinary-upload.ts`
  - `apps/web/src/types/media.ts`
  - `apps/worker/test/index.spec.ts`
  - `apps/worker/test/unit/cloudinary.spec.ts`
  - `apps/worker/test/unit/dto-media.spec.ts`
  - `apps/web/src/api/media.test.ts`
  - `apps/web/src/lib/media/cloudinary-upload.test.ts`
  - `apps/worker/.dev.vars.example`, `apps/worker/README.md`
- Explicitly out of scope:
  - Migrating current avatar Firebase flow to Cloudinary.
  - Chunked/resumable video upload.
  - Private/authenticated delivery URL flow.

## Non-negotiable Requirements

- Flow must be auth-required and server-signed; client never holds Cloudinary secret.
- Signature must be SHA-1 over a whitelisted, deterministic param set.
- Policy validation (`mimeType`, `sizeBytes`, `resourceType`) enforced on backend.
- Upload is restricted to preset `household-finance-system-preset`.
- New behavior must be covered by worker + web tests.

## Progress

- [x] (2026-04-24) Added worker media signing contract, route, handler, and signing library.
- [x] (2026-04-24) Added Cloudinary env/config wiring and local docs/examples.
- [x] (2026-04-24) Added frontend media API and shared Cloudinary upload helper.
- [x] (2026-04-24) Added/updated worker + web tests for signing and upload contract.
- [x] (2026-04-24) Enforced upload preset `household-finance-system-preset` in signature + upload form fields.
- [x] (2026-04-24) Verified with `pnpm test:worker`, `pnpm typecheck:worker`, `pnpm test:web`, `pnpm typecheck:web`, `pnpm lint`, `./init.sh`.

## Surprises & Discoveries

- GitNexus index did not immediately resolve newly added symbols for impact queries; existing symbols (`readConfig`, `API_ENDPOINTS`) were analyzed instead, and post-change `detect_changes` was used to verify affected flow.
- Local worker test runtime warns about compatibility-date fallback (`2026-04-16` -> `2026-03-10`) but all tests pass.

## Decision Log

- Decision: Keep v1 to one-shot upload and enforce backend size limits.
  Rationale: lower complexity and faster safe rollout.
  Date/Author: 2026-04-24 / Codex + User

- Decision: Lock uploads to preset `household-finance-system-preset`.
  Rationale: centralize Cloudinary-side policy and prevent unsigned preset drift.
  Date/Author: 2026-04-24 / User request, implemented by Codex

- Decision: Keep avatar upload migration out of scope for this feature.
  Rationale: foundation-first delivery; feature migration will be separate scoped work.
  Date/Author: 2026-04-24 / Codex + User

## Outcomes & Retrospective

- Completed reusable signed-upload foundation for backend and frontend.
- Added deterministic signature tests and contract tests for auth/validation paths.
- Feature is ready for integration into domain workflows (profile avatar, expense attachments, etc.) without re-implementing signing logic.

## Context and Orientation

- Worker route registration and middleware: `apps/worker/src/index.ts`
- Media signing API surface: `apps/worker/src/routes/media.ts`
- Signing implementation and policy: `apps/worker/src/lib/media/cloudinary.ts`
- Web API adapter: `apps/web/src/api/media.ts`
- Web upload orchestration helper: `apps/web/src/lib/media/cloudinary-upload.ts`

## Plan of Work (Narrative)

1. Introduce worker media contract for request validation and response DTO.
2. Add authenticated media route `POST /api/v1/media/upload-signature` and connect route to worker entry.
3. Implement signing library:
   - build server-owned `folder/public_id/timestamp`.
   - canonicalize signable params.
   - generate SHA-1 signature from canonical string + API secret.
   - enforce policy by `resourceType`.
4. Extend env/config surface for Cloudinary settings and defaults.
5. Add web-side API method to request signature ticket.
6. Add web-side helper to upload file with signed fields and normalized output.
7. Add and run tests for schema validation, signing fixture, route behavior, multipart payload, and error mapping.

## Concrete Steps (Commands)

Run from repo root:

```bash
pnpm test:worker
pnpm typecheck:worker
pnpm test:web
pnpm typecheck:web
pnpm lint
./init.sh
```

Expected short outputs:

- `Test Files ... passed`
- `tsc --noEmit` exits 0
- `Linting: OK`
- `Init Done`

## Validation and Acceptance

- `POST /api/v1/media/upload-signature` without bearer token returns `401 UNAUTHENTICATED`.
- Valid signed-request returns `200` with required fields:
  - `cloudName`, `apiKey`, `uploadPreset`, `timestamp`, `signature`, `folder`, `publicId`, `resourceType`, `uploadUrl`, `expiresAt`, `maxBytes`, `allowedMimeTypes`.
- Invalid `mimeType` or oversized `sizeBytes` returns `400 INVALID_INPUT`.
- Frontend helper sends multipart fields:
  - `file`, `api_key`, `timestamp`, `signature`, `upload_preset`, `folder`, `public_id`.

## Idempotence & Recovery

- All commands above are safe to re-run.
- No DB migration/schema mutation included.
- Rollback is standard git revert of feature commits if required.

## Artifacts and Notes

- Known signature fixture assertion exists in `apps/worker/test/unit/cloudinary.spec.ts`.
- Integration coverage for route-level auth/validation/happy path exists in `apps/worker/test/index.spec.ts`.
- Frontend helper behavior is covered in `apps/web/src/lib/media/cloudinary-upload.test.ts`.

## Interfaces & Dependencies

- Cloudinary upload signature endpoint:
  - `POST /api/v1/media/upload-signature`
  - request: `UploadSignatureRequest`
  - response: `UploadSignatureResponse`
- External dependency:
  - Cloudinary Upload API (`https://api.cloudinary.com/v1_1/<cloud>/<resourceType>/upload`)
- Internal dependencies:
  - Worker auth middleware for endpoint protection.
  - Existing API envelope helpers (`success`, `errorResponse`) from `feat-033`.
