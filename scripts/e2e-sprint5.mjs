/* ==========================================================
    BERNADA.ID — E2E VERIFICATION — Sprint 5
    Verifikasi fitur baru Sprint 5 (post-release v1.3.0):
    (1) Lupa & reset password (token hash + SMTP dev log)
    (2) Admin dashboard (role management + moderasi)

    Prasyarat: server `npm run dev` berjalan di :3000,
    DB PostgreSQL sudah migrate (0001-0006).

    Penggunaan: node --env-file-if-exists=.env scripts/e2e-sprint5.mjs
  ========================================================== */

import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { pool } from '../server/db.js';
import { config } from '../server/config.js';

const BASE_URL = `http://localhost:${config.port}`;
const PASSWORD = 'E2e-test-2026';

const results = [];
let passCount = 0;
let failCount = 0;

function record(name, ok, detail = '') {
  results.push({ name, ok, detail });
  if (ok) passCount += 1;
  else failCount += 1;
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

async function api(path, { method = 'GET', body, token, expect } = {}) {
  const doRequest = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }).then(async (res) => {
      let data = null;
      try {
        data = await res.json();
      } catch {
        data = null;
      }
      return { status: res.status, ok: expect ? res.status === expect : true, data };
    });

  let result = await doRequest();
  if (result.status === 429) {
    console.log('  (rate limited — menunggu window 61s lalu retry...)');
    await new Promise((resolve) => setTimeout(resolve, 61_000));
    result = await doRequest();
  }
  return result;
}

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}@e2e-bernada.local`;
}

async function run() {
  const emailA = uniqueEmail('e2e.reset');
  const emailB = uniqueEmail('e2e.owner');
  const emailC = uniqueEmail('e2e.admin');

  // --- 1. Health check ---------------------------------------------------
  const health = await api('/api/health');
  record(
    'GET /api/health',
    health.status === 200 && health.data?.status === 'ok',
    `status=${health.status} database=${health.data?.database}`,
  );

  // --- 2. Register user A (reset flow) -----------------------------------
  const regA = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailA, password: PASSWORD, fullName: 'E2E Reset User' },
    expect: 200,
  });
  const tokenA = regA.data?.accessToken;
  record(
    'POST /api/auth/register (user reset)',
    regA.ok && !!tokenA,
    `status=${regA.status}`,
  );

  // --- 3. Forgot password → 200 generik + token tersimpan -----------------
  const forgot = await api('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: emailA },
    expect: 200,
  });
  const resetRows = await pool.query(
    `SELECT id, token_hash, expires_at, used_at
       FROM password_reset_tokens
      WHERE user_id = $1`,
    [regA.data.user.id],
  );
  record(
    'POST /api/auth/forgot-password (anti-enumerasi + token tersimpan)',
    forgot.ok && resetRows.rows.length === 1 && resetRows.rows[0].used_at === null,
    `status=${forgot.status} token_rows=${resetRows.rows.length}`,
  );

  // --- 4. Forgot password email non-terdaftar → tetap 200 -----------------
  const forgotGhost = await api('/api/auth/forgot-password', {
    method: 'POST',
    body: { email: uniqueEmail('e2e.ghost') },
    expect: 200,
  });
  record(
    'POST /api/auth/forgot-password (email tidak terdaftar → 200)',
    forgotGhost.ok,
    `status=${forgotGhost.status}`,
  );

  // --- 5. Reset password dengan token valid -------------------------------
  const validToken = crypto.randomBytes(32).toString('base64url');
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() + INTERVAL '24 hours')`,
    [regA.data.user.id, hashToken(validToken)],
  );
  const newPassword = 'E2e-newpass-2026';
  const resetOk = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: validToken, password: newPassword },
    expect: 200,
  });
  record(
    'POST /api/auth/reset-password (token valid)',
    resetOk.ok && resetOk.data.user?.id === regA.data.user.id,
    `status=${resetOk.status}`,
  );

  // --- 6. Login dengan password baru --------------------------------------
  const loginAfterReset = await api('/api/auth/login', {
    method: 'POST',
    body: { email: emailA, password: newPassword },
    expect: 200,
  });
  record(
    'POST /api/auth/login (password baru berfungsi)',
    loginAfterReset.ok && !!loginAfterReset.data.accessToken,
    `status=${loginAfterReset.status}`,
  );

  // --- 7. Reuse token yang sudah dipakai → 400 ----------------------------
  const reuse = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: validToken, password: PASSWORD },
    expect: 400,
  });
  record(
    'POST /api/auth/reset-password (token sudah dipakai → 400)',
    reuse.ok && reuse.data?.error?.code === 'INVALID_TOKEN',
    `status=${reuse.status} code=${reuse.data?.error?.code}`,
  );

  // --- 8. Token kedaluwarsa → 400 -----------------------------------------
  const expiredToken = crypto.randomBytes(32).toString('base64url');
  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, NOW() - INTERVAL '1 minute')`,
    [regA.data.user.id, hashToken(expiredToken)],
  );
  const expired = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: expiredToken, password: PASSWORD },
    expect: 400,
  });
  record(
    'POST /api/auth/reset-password (token kedaluwarsa → 400)',
    expired.ok && expired.data?.error?.code === 'EXPIRED_TOKEN',
    `status=${expired.status} code=${expired.data?.error?.code}`,
  );

  // --- 9. Token acak/tidak dikenal → 400 ----------------------------------
  const invalid = await api('/api/auth/reset-password', {
    method: 'POST',
    body: { token: crypto.randomBytes(32).toString('base64url'), password: PASSWORD },
    expect: 400,
  });
  record(
    'POST /api/auth/reset-password (token tidak dikenal → 400)',
    invalid.ok && invalid.data?.error?.code === 'INVALID_TOKEN',
    `status=${invalid.status} code=${invalid.data?.error?.code}`,
  );

  // --- 10. Register user B (owner data) -----------------------------------
  const regB = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailB, password: PASSWORD, fullName: 'E2E Owner User' },
    expect: 200,
  });
  const tokenB = regB.data?.accessToken;
  record(
    'POST /api/auth/register (user owner)',
    regB.ok && !!tokenB,
    `status=${regB.status}`,
  );

  // --- 11. User B buat & terbitkan undangan --------------------------------
  const templates = await api('/api/templates');
  const templateId = templates.data?.templates?.[0]?.id;
  const slug = `e2e-admin-${Date.now().toString(36)}`;
  const inv = await api('/api/invitations', {
    method: 'POST',
    token: tokenB,
    body: {
      title: 'E2E Admin Verification',
      slug,
      templateId,
      eventDate: '2026-12-25',
      eventTime: '09:00',
      venue: 'Gedung E2E',
      location: 'Jakarta',
      couple: 'E2E & Test',
    },
    expect: 201,
  });
  const invId = inv.data?.invitation?.id;
  const pub = await api(`/api/invitations/${invId}/publish`, {
    method: 'POST',
    token: tokenB,
    expect: 200,
  });
  record(
    'POST /api/invitations + publish (data untuk admin)',
    regB.ok && pub.ok && pub.data?.invitation?.isPublished === true,
    `invitation=${slug} published=${pub.data?.invitation?.isPublished}`,
  );

  // --- 12. Entri buku tamu via endpoint publik -----------------------------
  const gb = await api(`/api/invitations/public/${slug}/guestbook`, {
    method: 'POST',
    body: {
      guestName: 'Tamu E2E',
      attendance: 'hadir',
      guestsCount: 2,
      message: 'Selamat menempuh hidup baru!',
    },
    expect: 201,
  });
  const gbId = gb.data?.entry?.id;
  record(
    'POST /api/invitations/public/:slug/guestbook (data untuk admin)',
    gb.ok && !!gbId,
    `status=${gb.status}`,
  );

  // --- 13. Non-admin dilarang akses admin ----------------------------------
  const blocked = await api('/api/admin/stats', { token: tokenB, expect: 403 });
  record(
    'GET /api/admin/stats (non-admin → 403)',
    blocked.ok && blocked.data?.error?.code === 'FORBIDDEN',
    `status=${blocked.status} code=${blocked.data?.error?.code}`,
  );

  // --- 14. Register user C (calon admin) -----------------------------------
  const regC = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailC, password: PASSWORD, fullName: 'E2E Admin Candidate' },
    expect: 200,
  });
  record(
    'POST /api/auth/register (calon admin)',
    regC.ok && !!regC.data?.accessToken,
    `status=${regC.status}`,
  );

  // --- 15. Promote user C via script npm run admin:promote -----------------
  let promoted = false;
  try {
    execSync(`npm run admin:promote -- "${emailC}"`, {
      stdio: 'pipe',
      cwd: process.cwd(),
    });
    promoted = true;
  } catch {
    promoted = false;
  }
  const cRole = await pool.query('SELECT role FROM users WHERE id = $1', [regC.data.user.id]);
  record(
    'npm run admin:promote (script)',
    promoted && cRole.rows[0]?.role === 'admin',
    `role=${cRole.rows[0]?.role}`,
  );

  // --- 16. Admin login & akses /api/admin/stats ----------------------------
  const loginC = await api('/api/auth/login', {
    method: 'POST',
    body: { email: emailC, password: PASSWORD },
    expect: 200,
  });
  const tokenC = loginC.data?.accessToken;
  const stats = await api('/api/admin/stats', { token: tokenC, expect: 200 });
  record(
    'GET /api/admin/stats (admin → 200 + data)',
    stats.ok && typeof stats.data?.stats?.users === 'number',
    `status=${stats.status} users=${stats.data?.stats?.users}`,
  );

  // --- 17. GET /api/admin/users + filter search ----------------------------
  const users = await api('/api/admin/users?page=1&pageSize=50', { token: tokenC, expect: 200 });
  const foundB = users.data?.users?.some((u) => u.email === emailB);
  const usersSearch = await api('/api/admin/users?search=Owner', { token: tokenC, expect: 200 });
  record(
    'GET /api/admin/users (list + search)',
    users.ok && foundB && usersSearch.data?.users?.length >= 1,
    `status=${users.status} total=${users.data?.total} found_owner=${foundB}`,
  );

  // --- 18. GET /api/admin/users/:id (detail + counts) -----------------------
  const detail = await api(`/api/admin/users/${regB.data.user.id}`, {
    token: tokenC,
    expect: 200,
  });
  record(
    'GET /api/admin/users/:id (detail + counts)',
    detail.ok && typeof detail.data?.counts?.invitations === 'number',
    `status=${detail.status} invitations=${detail.data?.counts?.invitations}`,
  );

  // --- 19. GET /api/admin/invitations ---------------------------------------
  const invitations = await api('/api/admin/invitations?pageSize=50', {
    token: tokenC,
    expect: 200,
  });
  const foundInv = invitations.data?.invitations?.some((i) => i.id === invId);
  record(
    'GET /api/admin/invitations (list)',
    invitations.ok && foundInv,
    `status=${invitations.status} total=${invitations.data?.total}`,
  );

  // --- 20. POST /api/admin/invitations/:id/unpublish ------------------------
  const unpub = await api(`/api/admin/invitations/${invId}/unpublish`, {
    method: 'POST',
    token: tokenC,
    expect: 200,
  });
  record(
    'POST /api/admin/invitations/:id/unpublish',
    unpub.ok && unpub.data?.invitation?.isPublished === false,
    `status=${unpub.status} published=${unpub.data?.invitation?.isPublished}`,
  );

  // --- 21. GET /api/admin/guestbook -----------------------------------------
  const gbList = await api('/api/admin/guestbook?pageSize=50', { token: tokenC, expect: 200 });
  const foundGb = gbList.data?.entries?.some((e) => e.id === gbId);
  record(
    'GET /api/admin/guestbook (list)',
    gbList.ok && foundGb,
    `status=${gbList.status} total=${gbList.data?.total}`,
  );

  // --- 22. DELETE /api/admin/guestbook/:entryId -----------------------------
  const gbDel = await api(`/api/admin/guestbook/${gbId}`, {
    method: 'DELETE',
    token: tokenC,
    expect: 204,
  });
  const gbAfter = await pool.query('SELECT id FROM guestbook WHERE id = $1', [gbId]);
  record(
    'DELETE /api/admin/guestbook/:entryId (204)',
    gbDel.ok && gbDel.status === 204 && gbAfter.rows.length === 0,
    `status=${gbDel.status} rows_left=${gbAfter.rows.length}`,
  );

  // --- 23. Guard admin terakhir (ubah role sendiri → 400) --------------------
  const selfRole = await api(`/api/admin/users/${regC.data.user.id}/role`, {
    method: 'PATCH',
    token: tokenC,
    body: { role: 'user' },
    expect: 400,
  });
  record(
    'PATCH /api/admin/users/:id/role (role sendiri → 400)',
    selfRole.ok,
    `status=${selfRole.status} code=${selfRole.data?.error?.code}`,
  );

  // --- 24. Promote user B → admin, lalu demote kembali -----------------------
  const promoteB = await api(`/api/admin/users/${regB.data.user.id}/role`, {
    method: 'PATCH',
    token: tokenC,
    body: { role: 'admin' },
    expect: 200,
  });
  const demoteB = await api(`/api/admin/users/${regB.data.user.id}/role`, {
    method: 'PATCH',
    token: tokenC,
    body: { role: 'user' },
    expect: 200,
  });
  record(
    'PATCH /api/admin/users/:id/role (promote → demote, last-admin guard)',
    promoteB.ok && demoteB.ok && demoteB.data?.user?.role === 'user',
    `promote=${promoteB.status} demote=${demoteB.status}`,
  );

  // --- 25. Setelah demote, user B kembali ditolak admin ----------------------
  const blockedAgain = await api('/api/admin/users', { token: tokenB, expect: 403 });
  record(
    'GET /api/admin/users (demoted user → 403)',
    blockedAgain.ok,
    `status=${blockedAgain.status}`,
  );

  // --- Cleanup --------------------------------------------------------------
  await pool.query('DELETE FROM users WHERE id = ANY($1)', [
    [regA.data.user.id, regB.data.user.id, regC.data.user.id],
  ]);
  await pool.end();
}

async function main() {
  try {
    await run();
  } catch (error) {
    record('SKRIP E2E (unexpected error)', false, `${error.message}`);
  }

  console.log(`\n=== E2E SPRINT 5 — ${passCount}/${passCount + failCount} PASS ===\n`);
  for (const r of results) {
    const icon = r.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passCount} PASS · ${failCount} FAIL`);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
