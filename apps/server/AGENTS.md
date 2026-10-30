# Server — NestJS Backend

## Project Overview
NestJS 11 REST + WebSocket server with JWT auth, Socket.io real-time messaging, and Prisma database access.

## Commands
| Command | Action |
|---|---|
| `pnpm start:dev` | Watch mode |
| `pnpm build` | `nest build` |
| `pnpm lint` | ESLint with --fix |
| `pnpm format` | Prettier |

## Module Structure
```
src/
├── auth/              — JWT strategy, Passport guard, auth controller/service
├── chat/              — Socket.io gateway, chat service, Zod validation pipe
├── common/            — @Route() decorator, interceptors, helpers, Zod pipe
├── conversations/     — REST controller/service for conversations
├── prisma/            — Prisma service wrapper (re-exports @chat/db/client)
├── users/             — REST controller/service for users
├── app.module.ts      — Root module
└── main.ts            — Entry point (cookie-parser, CORS, JWT cookie setup)
```

## Code Style
- **Modular**: each feature is a NestJS module with `.module.ts`, `.controller.ts`, `.service.ts`
- **Validation**: use Zod pipes (`zod.pipe.ts`) for both HTTP and WebSocket input
- **Auth**: Passport `JwtAuthGuard` on protected routes; cookie-based JWT
- **DTOs**: Zod schemas define shape; inferred as TS types
- **Imports**: NestJS common/http, `@chat/db` for Prisma, `@chat/shared` for types/schemas

## Testing
- **E2E tests**: in `test/` — uses `@nestjs/testing` + supertest
- Run from apps/server: no script wired yet, but `test/app.e2e-spec.ts` and `test/jest-e2e.json` exist
- No unit tests currently; add with `@nestjs/testing` if needed

## Load Testing
k6 scenarios in `load-tests/scenarios/`, run via `load-tests/orchestrator.mjs`.
| Command | Action |
|---|---|
| `pnpm load-test:auth` | Auth flow load test (HTTP signup/login) |
| `pnpm load-test:messaging` | WebSocket messaging load test (50 VUs, 5m) |
| `pnpm load-test:setup` | Start test DB + server on 3001 for manual testing |
| `pnpm load-test:all` | Run auth, then messaging, against one server instance |

How it works (from repo root, all against the isolated test DB):
1. Ensures compose `db` is up on port 5433 (`docker compose --env-file .test.env up db -d`)
2. Creates database `messaging-app-test` and runs `prisma migrate reset --force` against it
3. Starts the built server (`dist`) on port 3001 with `NODE_ENV=test` + test `DATABASE_URL`/`SECRET` injected into the process env
4. Runs k6 with `BASE_URL`/`WS_URL` overridden to `localhost:3001`
- **Prereqs**: `.test.env`, Docker, k6 — pass `--build` to force a fresh build first (default reuses existing `dist`)
- Dev DB on 5432 and its data are never touched

## Security
- JWT secret from `process.env.SECRET` — never hardcode or commit
- Passwords hashed with bcryptjs (10 salt rounds) before storing
- Password field excluded from all Prisma queries via `select` — never `include` on User
- Socket.io connections validated via JWT; unauthorized connections rejected
- HTTP-only cookie for JWT prevents XSS token theft
