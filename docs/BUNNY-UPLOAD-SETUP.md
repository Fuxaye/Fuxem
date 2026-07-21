# Bunny Upload Setup

This project is now wired to upload profile media through a server endpoint:

- Endpoint: `/api/member/media/upload`
- Server adapter: `src/lib/storage/bunny.ts`
- Client helper: `src/lib/photo-upload.ts`

## What Is Already Done In Code

- Authenticated uploads only.
- Email verification required before upload.
- Member media policy enforced (burner/member/premium).
- File type validation:
  - photos: jpeg, png, webp, gif
  - videos: mp4, webm, mov
- File size validation:
  - photo max: 10MB
  - video max: 100MB
- Upload destination switched to Bunny via server-side API key.

## Required Environment Variables

Set these on production (VPS `.env`):

- `BUNNY_STORAGE_ZONE`
- `BUNNY_STORAGE_API_KEY`
- `BUNNY_STORAGE_REGION`
- `BUNNY_CDN_BASE_URL`

Notes:

- `BUNNY_STORAGE_REGION` can be empty for default hostname (`storage.bunnycdn.com`) or set to region prefix (for example `ny`, `la`, `sg`).
- `BUNNY_CDN_BASE_URL` should be your public CDN domain, for example:
  - `https://fuxem-media.b-cdn.net`
  - or a custom domain like `https://media.fuxem.com`

## Bunny Dashboard Steps

1. Create a Storage Zone.
2. Copy Storage Zone name -> `BUNNY_STORAGE_ZONE`.
3. Create/read Storage API key -> `BUNNY_STORAGE_API_KEY`.
4. Create Pull Zone or custom hostname for public delivery.
5. Set pull origin/path to the storage zone content.
6. Use public CDN base URL as `BUNNY_CDN_BASE_URL`.

## Deploy Steps

1. Add Bunny env vars to `/var/www/fuxem/.env`.
2. Sync changed files to server.
3. Build and restart app:
   - `npm run build:vps`
   - `pm2 restart fuxem`
4. Verify endpoint with an authenticated member upload.

## Smoke Test

1. Log in with verified member account.
2. Open profile page and upload 1 photo.
3. Save profile.
4. Reload profile and confirm image persists.
5. Confirm returned URL is under `BUNNY_CDN_BASE_URL`.
6. Repeat with burner account and confirm video upload is blocked.

## Security Notes

- Bunny API key is server-only and never exposed to browser.
- Uploads are authenticated and policy-gated.
- Keep API key rotated and restricted in Bunny dashboard.
