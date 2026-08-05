# fuxem

fuxem is a private, members-only social platform for verified adults, built around discovery, profile presentation, media sharing, and community interaction.

## What the project is

This project combines a modern web app experience with member-only access controls, public preview surfaces, and admin tooling. The core experience includes:

- a public landing and entry experience
- member authentication and onboarding
- profile pages and member discovery
- media uploads and gallery experiences
- community spaces, messaging, and member engagement
- admin moderation and operational tools

## Tech stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Supabase
- Node.js services for media and auth flows

## Project structure

- src/app — app routes, pages, and UI
- src/components — shared UI components
- src/lib — shared utilities, auth, Prisma, and platform logic
- prisma — schema and migrations
- deploy — deployment and server setup scripts

## Getting started

1. Install dependencies
   ```bash
   npm install
   ```
2. Create your environment file and configure database/auth variables.
3. Run the development server
   ```bash
   npm run dev
   ```
4. Open the local app in your browser.

## Notes

The platform is intentionally designed around member-only access, privacy, and moderation. Public surfaces exist for preview and discovery, but core interaction remains gated behind account access.
