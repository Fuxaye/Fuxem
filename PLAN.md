# Fuxem build plan

Last updated: 2026-11-04

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
| **2** | Onboarding | After **`/nocode` signup**, route to profile setup; align with required PATCH fields |
| **3** | Profile & discovery | Editor **done**; improve search/community + public profile polish |
| **4** | Media | Bunny **on VPS**; next: unify **`/camera`** capture to Bunny, retire Supabase path |
| **5** | Social | Friends, messages, chatroom |
| **6** | Live | Profile cam / LiveKit env + token flow |
| **7** | Staff | Admin tools hub, moderation, audit logs |
| **8** | Public surfaces | Public media preview, legal/compliance polish |

### Production env still to validate
- SMTP → email verification in strict mode
- LiveKit → cam rooms
- ~~Bunny → member uploads~~ **configured on VPS**

### Suggested next slice (pick one)
1. **Post-signup flow** — `/nocode` success → `/profile` with checklist (city, gender, photo).
2. **Camera → Bunny** — one upload pipeline; remove Supabase dependency for profile capture.
3. **Community / search** — browse members with real profiles and avatars.
4. **SMTP + verify email** — production mail so new accounts must verify before login.

---

## Current branch
- `main` on GitHub `Fuxaye/Fuxem`; production VPS at `fuxem.com`.
