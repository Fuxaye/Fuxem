# Fuxem build plan

Last updated: 2026-11-07

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

## Milestone: Member home + profile media (done)

### Shipped
- **`/dashboard`**: restored member dashboard with `MemberLayout`.
- **`/me`**: account hub; sidebar **Account** link.
- **`/profile`**: real profile editor (fields, tags, avatar, Bunny upload, save via API).
- **`/profile/view`**: read-only member preview; public **`/u/{username}`** shows saved media.
- **Bunny**: production env on VPS (`fuxem` zone, `fuxem.b-cdn.net`); uploads via `/api/member/media/upload`.

### Ops
- Bunny secrets live only in **`/var/www/fuxem/.env`** (never in git). See `.env.example` for variable names.

---

## Rest of the site (recommended order)

Work in small slices; deploy after each slice that touches production behavior.

| Phase | Focus | Outcome |
|-------|--------|---------|
| **1** | Post-login home | ~~Dashboard, `/me`, nav~~ — **mostly done**; polish dashboard cards/links |
| **2** | Onboarding | **Done.** `/nocode` continues to `/profile?setup=1` after signup or email verify |
| **3** | Profile & discovery | **Done.** Editor, community cards, and search link to `/u/{username}` |
| **4** | Media | **Done.** `/camera` uploads through Bunny |
| **5** | Social | **In progress.** `/friends` lists accepted friends and pending requests. Messages and chatroom already use live data |
| **6** | Live | Profile cam / LiveKit env + token flow |
| **7** | Staff | Admin tools hub, moderation, audit logs |
| **8** | Public surfaces | Public media preview, legal/compliance polish |

### Production env
- **Email:** Resend HTTPS API. `fuxem.com` is verified. `RESEND_API_KEY` lives only in the VPS `.env`.
- LiveKit → cam rooms still to validate
- ~~Bunny → member uploads~~ **configured on VPS**

### Next slice
- Finish social polish: message thread edge cases, then LiveKit cam rooms.

---

## Current branch
- `main` on GitHub `Fuxaye/Fuxem`; production VPS at `fuxem.com`.
