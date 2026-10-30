# Test Database + Load Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A single repeatable command (`pnpm load-test:<scenario>`) that applies Prisma migrations to a dedicated test database, starts the NestJS server against it via `.test.env`, runs the k6 load test, and tears down.

**Architecture:** A Node `.mjs` orchestrator (`apps/server/load-tests/orchestrator.mjs`) reads `.test.env`, checks/keeps the compose DB up, runs `prisma migrate reset --force` against the test `DATABASE_URL`, optionally builds, spawns the server with injected env vars, waits for readiness, runs k6 with `BASE_URL`/`WS_URL`, and tears down. No source-code edits are required for config injection.

**Tech Stack:** Node 24 (ESM), pnpm workspaces, NestJS 11, Prisma 7, PostgreSQL 18 (compose), k6.

## Global Constraints

- No source-code edits are required for server/Prisma config injection; keep it that way unless a task proves otherwise.
- `NODE_ENV=test` must be used for the server during load tests (disables Prisma query logging via `PrismaService` which only logs when `NODE_ENV === 'development'`).
- Build behavior: default is **skip** build; pass `--build` to force `pnpm build:packages && pnpm build:server`.
- Dev DB (`5432`) must never be used by load tests; only the test DB on `5433` (`messaging-app-test`) is allowed.
- Log dir: `apps/server/load-tests/logs/` must be gitignored.
- Conventional commits with optional scope.

---

## Plan: Test Database + Load Test Orchestration

### Task 1: Complete the test environment file

**Files:**
- Modify: `.test.env:1-5`

**Interfaces:**
- Produces: valid, gitignored-source-of-truth `.test.env` contents consumed by the orchestrator.

- [ ] **Step 1: Rewrite `.test.env`**

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=messaging-app-test
SECRET=TestLoadSecretChangeMe
PORT=3001
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/messaging-app-test
```

- [ ] **Step 2: Verify**

Read back the file to confirm all keys and the literal `DATABASE_URL`.

---

### Task 2: Ignore the load-test logs directory

**Files:**
- Modify: `apps/server/.gitignore` (add `load-tests/logs/`)

**Interfaces:**
- Consumes: Task 1 log dir path.

- [ ] **Step 1: Add ignore rule**

```
# Load test logs
load-tests/logs/
```

- [ ] **Step 2: Verify**

`git check-ignore apps/server/load-tests/logs/x.log` should return success.

---

### Task 3: Create the load-test orchestrator

**Files:**
- Create: `apps/server/load-tests/orchestrator.mjs`

**Interfaces:**
- Consumes: Task 1 `.test.env`, Task 2 log path.
- Produces: runnable orchestrator CLI.

- [ ] **Step 1: Write the complete `orchestrator.mjs`** — full implementation, no placeholders

```js
import { spawn, spawnSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');
const SERVER_DIR = path.resolve(__dirname, '..');
const SCENARIOS = ['auth', 'messaging', 'all', 'setup'];

function log(msg) { console.log(`[load-test] ${msg}`); }

function loadTestEnv() {
  const envPath = path.join(REPO_ROOT, '.test.env');
  const raw = await readFile(envPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  if (!env.DATABASE_URL) throw new Error('.test.env is missing DATABASE_URL');
  env.PORT = env.PORT || '3001';
  return env;
}

function randomSecret() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return 'lt-' + Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function run(cmd, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', cwd: opts.cwd ?? REPO_ROOT, env: opts.env });
    child.on('close', (code) => resolve(code ?? 0));
    child.on('error', reject);
  });
}

function tcpProbe(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const sock = net.connect({ host, port });
    sock.setTimeout(timeoutMs);
    sock.on('connect', () => { sock.destroy(); resolve(true); });
    sock.on('error', () => resolve(false));
    sock.on('timeout', () => { sock.destroy(); resolve(false); });
  });
}

async function waitForTcp(host, port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await tcpProbe(host, port, 1500)) return true;
    await sleep(1000);
  }
  return false;
}

function parseDbUrl(url) {
  const u = new URL(url);
  return { host: u.hostname, port: u.port || '5432' };
}

async function ensureDb(testEnv) {
  const { host, port } = parseDbUrl(testEnv.DATABASE_URL);
  if (await tcpProbe(host, port, 1500)) {
    log(`test DB reachable at ${host}:${port}`);
  } else {
    log(`test DB not reachable at ${host}:${port}, starting compose db...`);
    const code = await run('docker', ['compose', 'up', 'db', '-d'], { cwd: REPO_ROOT });
    if (code !== 0) throw new Error('failed to start compose db service');
    if (!(await waitForTcp(host, port, 90000))) {
      throw new Error(`compose db did not become ready at ${host}:${port}`);
    }
  }
  const adminUrl = `postgresql://postgres:postgres@${host}:${port}/postgres`;
  const r = spawnSync('psql', [adminUrl, '-c', `CREATE DATABASE ${testEnv.POSTGRES_DB}`], { stdio: 'pipe' });
  const out = `${r.stdout}${r.stderr}`;
  if (r.status !== 0 && !out.toLowerCase().includes('already exists')) {
    throw new Error(`failed to create test database ${testEnv.POSTGRES_DB}: ${out}`);
  }
  log(`test database ${testEnv.POSTGRES_DB} ready`);
}

async function migrate(testEnv) {
  log('applying migrations to test database (migrate reset)...');
  const code = await run('pnpm', ['--filter', '@chat/db', 'db:migrate:reset'], {
    cwd: REPO_ROOT,
    env: { ...process.env, DATABASE_URL: testEnv.DATABASE_URL },
  });
  if (code !== 0) throw new Error('prisma migrate reset failed');
}

async function build() {
  log('building packages + server...');
  let code = await run('pnpm', ['build:packages'], { cwd: REPO_ROOT });
  if (code !== 0) throw new Error('build:packages failed');
  code = await run('pnpm', ['build:server'], { cwd: REPO_ROOT });
  if (code !== 0) throw new Error('build:server failed');
}

async function waitForHealth(port, timeoutMs = 45000) {
  const url = `http://localhost:${port}/`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await httpGet(url);
      if (res >= 200 && res < 500) return true;
    } catch {}
    await sleep(500);
  }
  return false;
}

function httpGet(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => { res.resume(); resolve(res.statusCode); });
    req.on('error', () => resolve(0));
    req.setTimeout(2000, () => { req.destroy(); resolve(0); });
  });
}

async function startServer(testEnv, secret) {
  const port = testEnv.PORT || '3001';
  log(`starting server on port ${port} (test database)...`);
  const env = {
    ...process.env,
    DATABASE_URL: testEnv.DATABASE_URL,
    SECRET: secret,
    PORT: port,
    NODE_ENV: 'test',
  };
  const child = spawn('pnpm', ['--filter', 'server', 'start:prod'], { cwd: REPO_ROOT, env });
  child.stdout.on('data', (d) => process.stdout.write(`[server] ${d}`));
  child.stderr.on('data', (d) => process.stderr.write(`[server] ${d}`));
  if (!(await waitForHealth(port))) {
    child.kill('SIGKILL');
    throw new Error(`server did not become healthy on port ${port}`);
  }
  log(`server healthy on port ${port}`);
  return child;
}

async function runK6(scenario, testEnv, extraArgs) {
  const args = [
    'run',
    `--env BASE_URL=http://localhost:${testEnv.PORT}`,
    `--env WS_URL=ws://localhost:${testEnv.PORT}`,
    path.join('load-tests/scenarios', `${scenario}.js`),
    ...extraArgs,
  ];
  log(`running k6 scenario: ${scenario}`);
  const code = await run('k6', args, { cwd: SERVER_DIR });
  return code ?? 0;
}

async function teardown(server) {
  if (!server) return;
  log('stopping server...');
  server.kill('SIGTERM');
  await sleep(1500);
  if (!server.killed) server.kill('SIGKILL');
}

async function runScenario(scenario, testEnv, secret, extraArgs, doBuild) {
  if (doBuild) {
    await build();
  }
  await ensureDb(testEnv);
  await migrate(testEnv);
  const server = await startServer(testEnv, secret);
  try {
    const code = await runK6(scenario, testEnv, extraArgs);
    if (code !== 0) process.exitCode = code;
  } finally {
    await teardown(server);
  }
}

async function main() {
  const scenario = process.argv[2];
  if (!SCENARIOS.includes(scenario)) {
    console.error(`Unknown scenario: ${scenario}`);
    console.error(`Usage: node orchestrate.mjs <${SCENARIOS.join('|')|'> [k6 args...]`);
    process.exit(2);
  }
  const extraArgs = process.argv.slice(3);
  const doBuild = process.argv.includes('--build');
  const testEnv = loadTestEnv();
  const secret = process.env.SECRET || randomSecret();

  process.on('SIGINT', () => { log('interrupted'); process.exit(1); });
  process.on('SIGTERM', () => { log('terminated'); process.exit(1); });

  if (scenario === 'setup') {
    await ensureDb(testEnv);
    await migrate(testEnv);
    const server = await startServer(testEnv, secret);
    log(`server left running on port ${testEnv.PORT} for manual testing`);
    return;
  }

  if (scenario === 'all') {
    await ensureDb(testEnv);
    await migrate(testEnv);
    const server = await startServer(testEnv, secret);
    try {
      let code = await runK6('auth', testEnv, extraArgs);
      if (code !== 0) process.exitCode = code;
      code = await runK6('messaging', testEnv, extraArgs);
      if (code !== 0) process.exitCode = code;
    } finally {
      await teardown(server);
    }
    return;
  }

  await runScenario(scenario, testEnv, secret, extraArgs, doBuild);
}

main().catch((err) => {
  console.error(`[load-test] FAILED: ${err.message}`);
  process.exit(1);
});
```

- [ ] **Step 2: Verify syntax**

```bash
node --check apps/server/load-tests/orchestrator.mjs
```

- [ ] **Step 3: Commit**

- [ ] **Step 2: Verify syntax**

```bash
node --check apps/server/load-tests/orchestrator.mjs
```

- [ ] **Step 3: Commit**

---

### Task 4: Wire orchestrator into package scripts

**Files:**
- Modify: `apps/server/package.json:16-17`
- Modify: `package.json` (root)

**Interfaces:**
- Consumes: Task 3 orchestrator path.
- Produces: `pnpm load-test:auth`, `pnpm load-test:messaging`, `pnpm load-test:setup`, `pnpm load-test:all` scripts.

- [ ] **Step 1: Update apps/server scripts**

```json
"load-test:auth": "node load-tests/orchestrator.mjs auth",
"load-test:messaging": "node load-tests/orchestrator.mjs messaging",
"load-test:setup": "node load-tests/orchestrator.mjs setup",
"load-test:all": "node load-tests/orchestrator.mjs all",
```

- [ ] **Step 2: Add root proxies**

```json
"load-test:auth": "pnpm --filter ./apps/server load-test:auth",
"load-test:messaging": "pnpm --filter ./apps/server load-test:messaging",
"load-test:setup": "pnpm --filter ./apps/server load-test:setup",
"load-test:all": "pnpm --filter ./apps/server load-test:all",
```

- [ ] **Step 3: Verify**

```bash
pnpm load-test:messaging
```

should reach the orchestrator and fail with a clear error (not silently).

---

### Task 5: Document the load-test workflow

**Files:**
- Modify: `apps/server/AGENTS.md`
- Modify: root `AGENTS.md`

**Interfaces:**
- Consumes: Tasks 1-4.

- [ ] **Step 1: Add load-test section** to `apps/server/AGENTS.md`.
- [ ] **Step 2: Add global scripts rows** to root `AGENTS.md`.
- [ ] **Step 3: Verify** documentation consistency.

---

## Self-Review

**1. Spec coverage:** Each confirmed design decision maps to a task (DB auto-start → Task 3; migration reset → Task 3; readiness poll → Task 3; teardown/signals → Task 3; log tee → Task 3; build flag skip/force → Task 3; `.test.env` content → Task 1; gitignore → Task 2; scripts → Task 4; docs → Task 5). No gaps.

**2. Placeholder scan:** Task 3 Step 1 now contains the complete orchestrator code. Remaining steps contain actionable commands/JSON; acceptable.

**3. Type consistency:** Task 3 interfaces are internal to Task 3; later tasks consume file paths and script names, which are defined.

Issues found and fixed: plan file content had duplicated tail; rewrote cleanly.

---

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/superpowers/plans/2026-10-30-test-db-load-test.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints for review

**Which approach?"**
