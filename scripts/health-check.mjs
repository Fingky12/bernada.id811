import { config } from '../server/config.js';

const url = `http://localhost:${config.port}/api/health`;

function fail(msg) {
  console.error(`[FAIL] ${msg}`);
  process.exit(1);
}

let res;
try {
  res = await fetch(url);
} catch (error) {
  fail(`Tidak bisa terhubung ke ${url} — ${error.message}`);
}

if (res.status !== 200) {
  fail(`HTTP ${res.status} pada ${url} (diharapkan 200).`);
}

let body;
try {
  body = await res.json();
} catch {
  fail(`Response bukan JSON pada ${url}.`);
}

if (body.status !== 'ok') {
  fail(`status=${body.status} (diharapkan "ok").`);
}
if (body.service !== 'bernada-api') {
  fail(`service=${body.service} (diharapkan "bernada-api").`);
}
if (body.database !== 'connected') {
  fail(`database=${body.database} (diharapkan "connected").`);
}

console.log(`[PASS] ${url} -> 200, status=ok, service=bernada-api, database=connected`);
