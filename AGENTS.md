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

| Variable          | Description                                                |
| ----------------- | ---------------------------------------------------------- |
| `DATABASE_URL`    | PostgreSQL connection string                               |
| `SECRET`          | JWT signing secret                                         |
| `PORT`            | Server port (default 3000)                                 |
| `NODE_ENV`        | `development` \| `test` \| `production` (default `development`) |
| `CLIENT_URL`      | Allowed CORS origin for the client                         |
| `LOG_LEVEL`       | Pino level (default `debug` in dev, `info` otherwise)      |
| `PROFILE`         | Set to `1` to log Prisma queries / slow requests           |
| `VITE_API_URL`    | Client to server URL (default <http://localhost:3000>)     |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud for message attachments (optional; uploads return 503 without it) |
| `CLOUDINARY_API_KEY`    | Cloudinary API key, used to sign direct uploads            |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret, used to sign direct uploads — never expose or commit |

## Global Scripts

| Command                    | Action                                                           |
| -------------------------- | ---------------------------------------------------------------- |
| `pnpm dev`                 | Start all apps + packages in parallel                            |
| `pnpm build`               | Build all apps + packages                                        |
| `pnpm dev:server`          | Server in watch mode                                             |
| `pnpm dev:client`          | Client dev server                                                |
| `pnpm db:migrate`          | Apply Prisma migrations                                          |
| `pnpm db:generate`         | Regenerate Prisma client                                         |
| `pnpm db:reset`            | Drop + re-migrate database                                       |
| `pnpm db:studio`           | Open Prisma Studio                                               |
| `pnpm load-test:auth`      | Run k6 auth load test on the test DB (port 5433, server on 3001) |
| `pnpm load-test:messaging` | Run k6 WebSocket messaging load test on the test DB              |
| `pnpm load-test:setup`     | Start test DB + server for manual testing (no k6 run)            |
| `pnpm load-test:all`       | Run auth + messaging load tests sequentially                     |

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
