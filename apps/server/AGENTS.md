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

## Security
- JWT secret from `process.env.SECRET` — never hardcode or commit
- Passwords hashed with bcryptjs (10 salt rounds) before storing
- Password field excluded from all Prisma queries via `select` — never `include` on User
- Socket.io connections validated via JWT; unauthorized connections rejected
- HTTP-only cookie for JWT prevents XSS token theft
