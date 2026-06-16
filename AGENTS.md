# Messaging App — Workspace Guide

Real-time chat app — NestJS backend + React frontend + Prisma/PostgreSQL, in a pnpm monorepo.

## Project Overview
- **Monorepo**: pnpm workspace with `apps/` (server, client) and `packages/` (db, shared)
- **Server**: NestJS 11, Express, Socket.io, Passport/JWT, bcryptjs
- **Client**: React 19, Vite 7, Tanstack Router/Query, Tailwind v4, Shadcn UI
- **Database**: PostgreSQL 18, Prisma 7, Zod (via prisma-zod-generator)
- **CI/CD**: GitHub Actions — client deploys to VPS via SSH, server image published to GHCR

## Setup
```sh
cp .example.env .env
docker compose up db -d
pnpm install
pnpm db:migrate && pnpm db:generate
pnpm dev
```

## Environment Variables (.env)
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET` | JWT signing secret |
| `PORT` | Server port (default 3000) |
| `VITE_API_URL` | Client to server URL (default http://localhost:3000) |

## Global Scripts
| Command | Action |
|---|---|
| `pnpm dev` | Start all apps + packages in parallel |
| `pnpm build` | Build all apps + packages |
| `pnpm dev:server` | Server in watch mode |
| `pnpm dev:client` | Client dev server |
| `pnpm db:migrate` | Apply Prisma migrations |
| `pnpm db:generate` | Regenerate Prisma client |
| `pnpm db:reset` | Drop + re-migrate database |
| `pnpm db:studio` | Open Prisma Studio |

## Commit Convention
Conventional commits with optional scope matching existing history:
```
feat(auth): add refresh token rotation
fix(chat): handle disconnect on expired token
refactor: extract validation pipe
chore: upgrade eslint to v9
docs: add architecture overview
```

## Workspace Dependencies
- `@chat/db` (packages/db) — Prisma client, Zod schemas, browser adapter
- `@chat/shared` (packages/shared) — Shared types, Zod schemas, socket event types

## Per-Package Guides
- `apps/server/AGENTS.md`
- `apps/client/AGENTS.md`
- `packages/db/AGENTS.md`
- `packages/shared/AGENTS.md`

## Security
- `SECRET` env var must never be committed — `.env` is in `.gitignore`
- Passwords hashed with bcryptjs (salt rounds: 10)
- JWT tokens stored in HTTP-only cookies (not accessible to JS)
- Socket.io input validated via Zod pipes
- All user-facing data goes through Prisma relation filtering to avoid over-fetching
