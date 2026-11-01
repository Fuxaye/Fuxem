# Fuxem build plan

Last updated: 2026-11-01

## Milestone: Auth gate + deploy (done)

### Shipped
- **Welcome PIN**: `0000` → `/nocode`, `5555` → `/login`; invalid PIN messaging; Submit + Enter work on production.
- **Signup**: `/nocode` full registration (User ID, email, DOB 19+, password, username availability API).
- **Login**: credentials + member PIN; middleware auth cookie gate; Suspense fix for production build.
- **Deploy**: `deploy/update.sh`, GitHub Actions `deploy-production.yml`, VPS SSH deploy key, flock lock, Node heap for builds.

### Ops
- **Manual deploy (VPS)**: `cd /var/www/fuxem && bash deploy/update.sh`
- **Auto deploy**: push to `main` (after GitHub secrets: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, optional `VPS_SSH_PORT`)
- **Docs**: `deploy/README.md`, `deploy/SSH-DEPLOY-KEY.md`
- **Smoke test**: `docs/POST_DEPLOY_SMOKE_TEST.md`

---

## Rest of the site (recommended order)

Work in small slices; deploy after each slice that touches production behavior.

| Phase | Focus | Outcome |
|-------|--------|---------|
| **1** | Post-login home | Dashboard `/dashboard` useful; `/me` routes; logout; returnTo after login |
| **2** | Onboarding | Finish passcode/email-verified path after signup; profile basics |
| **3** | Profile & discovery | `/me/profile`, public member pages, search/community sorting |
| **4** | Media | Bunny env on VPS; photo/video upload + tier limits (see smoke test) |
| **5** | Social | Friends, messages, chatroom |
| **6** | Live | Profile cam / LiveKit env + token flow |
| **7** | Staff | Admin tools hub, moderation, audit logs |
| **8** | Public surfaces | Public media preview, legal/compliance polish |

### Production env still to validate
- SMTP → email verification in strict mode
- LiveKit → cam rooms
- Bunny → member uploads

---

## Current branch
- `main` on GitHub `Fuxaye/Fuxem`; production VPS at `fuxem.com`.
