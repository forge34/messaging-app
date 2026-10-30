# Design: Test Database + Load Test Orchestration

Date: 2026-10-30

## Goal
Provide a single, repeatable way to run load tests against a dedicated test database:

```sh
pnpm load-test:<scenario>
```

which:
1. Ensures the test database is migrated.
2. Starts the NestJS server pointed at the test database (via `.test.env`).
3. Runs the k6 load test.
4. Tears down the server.

## Confirmed decisions

| Question | Answer |
|---|---|
| Trigger | Option A — orchestrator runs full lifecycle |
| Test DB | A1 — reuse compose postgres on `5433`, separate `messaging-app-test` DB, `prisma migrate reset` before each run |
| Server config injection | 1a — inject test env vars into spawned server process (no source edits) |
| Test port | 2a — `3001` |
| Migration strategy | `prisma migrate reset --force` against test `DATABASE_URL` |
| DB auto-start | Best-effort `docker compose up db -d`; fail fast with a clear message if still unreachable |
| Post-run cleanup | Always tear down server; tee logs to `apps/server/load-tests/logs/` (gitignored) |
| Build flag | Default: skip build; `--build` forces `pnpm build:packages && pnpm build:server` |

## Architecture

```
pnpm load-test:messaging
  → apps/server: "node load-tests/orchestrator.mjs messaging [--build]"
      ├─ load & validate .test.env (DATABASE_URL, SECRET, PORT, NODE_ENV)
      ├─ check localhost:5433 reachable
      │    └─ if down: best-effort `docker compose up db -d`, wait ≤30s, re-check; fail fast if still down
      ├─ cd packages/db && DATABASE_URL=<test> prisma migrate reset --force
      ├─ unless --build: skip build
      ├─ if --build: pnpm build:packages && pnpm build:server
      ├─ spawn pnpm --filter ./apps/server start:prod with env = { ...process.env, ...testEnv }
      ├─ poll GET http://localhost:3001 until 200 (≤60s)
      ├─ k6 run load-tests/scenarios/<scenario>.js
      │      --env BASE_URL=http://localhost:3001 --env WS_URL=ws://localhost:3001
      ├─ finally: kill server child; propagate k6 exit code
      └─ exit/SIGINT/SIGTERM → teardown; logs tee'd to apps/server/load-tests/logs/
```

## Why it works (no source changes required)

- `apps/server/src/app.module.ts` sets `envFilePath: join(process.cwd(), '../../.env')` as a *fallback*; Nest's `ConfigModule` does not override existing `process.env` values. Injecting `DATABASE_URL` / `SECRET` / `PORT` / `NODE_ENV=test` into the spawned process therefore wins over the dev `.env`.
- `packages/db/prisma.config.ts` reads `process.env.DATABASE_URL` — injecting the test URL before running `prisma migrate reset` points migrations at the test DB.
- `NODE_ENV=test` disables Prisma query logging (`PrismaService` only logs when `NODE_ENV === 'development'`), keeping load-test noise/perf clean.
- k6 receives `BASE_URL` / `WS_URL` via `--env`, overriding the `localhost:3000` defaults in `load-tests/config.js`.

## Files

| File | Change |
|---|---|
| `apps/server/load-tests/orchestrator.mjs` | **Create** — orchestrator (`.mjs` = always ESM; `apps/server/package.json` has no `"type"`) |
| `apps/server/package.json` | **Edit** — scripts call orchestrator |
| `package.json` (root) | **Edit** — add `load-test:*` proxies |
| `.test.env` | **Edit** — complete with `SECRET`, `PORT=3001`, `NODE_ENV=test`, literal `DATABASE_URL` |
| `apps/server/.gitignore` | **Edit** — ignore `load-tests/logs/` |
| `apps/server/AGENTS.md` | **Edit** — document load-test flow |

## Behavior details
- DB auto-start: best-effort compose start; ≤30s wait; fail fast with a clear message if still unreachable.
- Migration reset: `prisma migrate reset --force` against test URL → clean slate each run.
- Readiness: poll `GET /` (returns 200 "Hello World!") ≤60s.
- Cleanup: `finally` + signal handlers → kill server; propagate k6 exit code.
- Logs: tee server stdout/stderr to `apps/server/load-tests/logs/<scenario>-<timestamp>.log`.

## Verification
- `pnpm load-test:auth` → migrations applied, server on `3001`, k6 passes, server torn down; dev DB (`5432`) untouched.
- `pnpm load-test:messaging` → full WebSocket round-trip.
- `pnpm load-test:messaging --build` → forces build.
- DB down → orchestrator attempts compose start, then fails fast with a clear message.

## Open questions (resolved)

- Log file dir: `apps/server/load-tests/logs/` → to be added to `.gitignore`.
- Build behavior: default = skip build; `--build` forces build.
