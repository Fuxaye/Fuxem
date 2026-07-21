# General Notes

## Session Log: 2026-07-12

### Implemented in this cycle

- Legal pages and routing are now integrated:
  - `/legal/privacy`
  - `/legal/terms`
  - `/legal/community-guidelines`
- Legal links are present on login, signup, public footer surfaces, and member sidebar legal section.
- Shared legal content/components are centralized in code for maintainability.
- Dashboard type narrowing regression fixed and member-layout prop compatibility updated.
- Admin/staff foundation extended with shared role helper and admin route constants for a tools hub direction.

### Direction currently agreed

- Keep UX and architecture aligned with existing app patterns.
- Incrementally improve functionality and layout quality.
- Build role-gated admin/moderation workflows with auditable actions.

### Periodic direction review cadence

Run this checkpoint at least once per week or after each major feature slice:

1. Confirm what shipped and what remains in progress.
2. Validate current work still matches product direction.
3. Identify top 1-2 next slices only (avoid scope spread).
4. Flag compliance/safety gaps and assign owner/priority.
5. Update `docs/ENGINEERING-WORKLOG.md` before starting the next slice.

## Current Production Snapshot (fuxem.com)

- App is deployed on VPS at `185.167.98.48` with PM2 process `fuxem`.
- Last deployment for Profile Cam completed successfully (build + restart + health checks).
- Route `/profile/cam` exists and is reachable behind auth (redirects unauthenticated users to login).

## Profile Cam Feature (Implemented)

- New page: `/profile/cam`.
- Supports two room modes:
  - `public` broadcast/join
  - `direct` 1-on-1 invite flow
- Metadata support:
  - category selector
  - location badge
- Live text chat implemented through LiveKit data channels.
- Invite URL generation added for room sharing.

## Auth and Access Rules (Important)

- `5555` = member login gate (credentials step)
- `0000` = signup path
- `9999` = burner account flow (temporary, limited)
- Burner intent is limited/public preview access; full signup users are higher privilege.

## Email Verification Status

### Before hardening

- Signup created verification tokens.
- Production fallback could auto-verify if mail service was not configured.
- Login did not block unverified accounts.

### Hardened locally (not yet confirmed deployed)

- `login` now blocks unverified users with `EMAIL_VERIFICATION_REQUIRED`.
- `register` no longer auto-verifies when email delivery fails in production.
- Files changed locally:
  - `src/app/api/auth/login/route.ts`
  - `src/app/api/auth/register/route.ts`

## Member Identity and Page Mapping

- `User.id` is primary identity key.
- `username` is unique and used for public member URL lookup (`/u/[username]`).
- `accountName` is unique and generated sequentially (`#1`, `#2`, ...).
- `Profile.userId` is unique (one profile per user).

## Member Sorting

- Search API sorts by:
  - `updatedAt desc`
  - then `createdAt desc`
- Community members page sorts by:
  - `createdAt desc`

## Media Uploads: Current State

- Upload pipeline is now Bunny-ready in code:
  - server adapter: `src/lib/storage/bunny.ts`
  - upload API: `src/app/api/member/media/upload/route.ts`
  - client helper: `src/lib/photo-upload.ts` now calls the upload API
- Upload endpoint requires auth + verified email + media policy checks.
- Profile API still stores media as URL arrays on profile record (`photoUrls`, `videoUrls`, `avatarUrl`).
- Remaining blocker is production Bunny environment configuration.

## Bunny Storage Migration Plan

1. Create Bunny Storage zone + pull zone/CDN hostname.
2. Add env vars (server-side):

- `BUNNY_STORAGE_ZONE`
- `BUNNY_STORAGE_REGION`
- `BUNNY_STORAGE_API_KEY`
- `BUNNY_CDN_BASE_URL`

1. Deploy current Bunny upload code to VPS.
2. Validate upload + retrieval + policy enforcement paths.
3. Run smoke test with real member and burner accounts.

## Infrastructure Notes

- Swap file was added on VPS (`/swapfile`, 2G).
- PM2 reports warning about in-memory/local version mismatch (`7.0.1` vs `5.3.0`), but process is running.
- `.env` exists on VPS, but key service variables were previously empty in snapshots (notably SMTP and LiveKit fields).

## Open Risks / Follow-ups

- Ensure production SMTP is configured, otherwise strict verification will block onboarding.
- Ensure LiveKit env vars are configured for cam to function for real users.
- Deploy latest auth hardening changes if not already synced.
- Consider stable member public URLs by `accountName` to avoid link breakage when username changes.

## Suggested Next Operational Checklist

1. Sync and deploy latest auth hardening files.
2. Verify SMTP and email verification flow end-to-end.
3. Verify LiveKit token generation and room join as authenticated users.
4. Configure Bunny env values and deploy upload changes.
5. Run production smoke test for signup -> verify email -> login.
6. Validate burner login behavior.
7. Validate profile photo upload.
8. Validate profile video upload (member allowed, burner blocked).
9. Validate profile cam direct/public + chat.
