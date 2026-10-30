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

async function loadTestEnv() {
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
    console.error(`Usage: node orchestrate.mjs <${SCENARIOS.join('|')}> [k6 args...]`);
    process.exit(2);
  }
  const extraArgs = process.argv.slice(3);
  const doBuild = process.argv.includes('--build');
  const testEnv = await loadTestEnv();
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
