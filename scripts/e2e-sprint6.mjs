/* ==========================================================
    BERNADA.ID — E2E VERIFICATION — Sprint 6
    Verifikasi fitur baru Sprint 6 (post-release v1.5.0 kandidat):
    (1) Pricing & packages (backend source of truth)
    (2) Order (amount server-side, idempotency, ownership)
    (3) Payment boundary (manual provider, paid hanya dari backend)
    (4) Invitation lifecycle (draft/preview/published/unpublished)
    (5) Regression ringkas (auth, templates, guestbook, gift accounts, admin)

    Prasyarat: server `npm run dev` berjalan di :3000,
    DB PostgreSQL sudah migrate (0001-0010).

    Penggunaan: node --env-file-if-exists=.env scripts/e2e-sprint6.mjs
  ========================================================== */

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

async function rawApi(path, { method = 'POST', body, token } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return res.status;
}

function uniqueEmail(prefix) {
  return `${prefix}.${Date.now()}@e2e-bernada.local`;
}

async function run() {
  const emailA = uniqueEmail('e2e6.buyer');
  const emailB = uniqueEmail('e2e6.other');
  const emailC = uniqueEmail('e2e6.admin');

  // --- 1. Health check ---------------------------------------------------
  const health = await api('/api/health');
  record(
    'GET /api/health',
    health.status === 200 && health.data?.status === 'ok',
    `status=${health.status} database=${health.data?.database}`,
  );

  // --- 2. Pricing: list paket aktif dari backend -------------------------
  const packages = await api('/api/packages');
  const pkgList = packages.data?.packages ?? [];
  const codes = pkgList.map((p) => p.code);
  record(
    'GET /api/packages (list aktif, urut sortOrder, fitur)',
    packages.ok && codes.join(',') === 'basic,premium,exclusive'
      && pkgList.every((p) => p.isActive === true && Array.isArray(p.features)),
    `status=${packages.status} codes=${codes.join(',')} count=${pkgList.length}`,
  );

  // --- 3. Detail paket premium --------------------------------------------
  const premium = pkgList.find((p) => p.code === 'premium');
  const pkgDetail = await api(`/api/packages/${premium.id}`);
  record(
    'GET /api/packages/:id (detail + fitur)',
    pkgDetail.ok && pkgDetail.data?.package?.priceAmount === 129000
      && pkgDetail.data?.package?.features?.length >= 1,
    `status=${pkgDetail.status} price=${pkgDetail.data?.package?.priceAmount}`,
  );

  // --- 4. Paket invalid → 404 ---------------------------------------------
  const badPkg = await api('/api/packages/00000000-0000-0000-0000-000000000000', { expect: 404 });
  record(
    'GET /api/packages/:id (invalid → 404)',
    badPkg.ok && badPkg.data?.error?.code === 'NOT_FOUND',
    `status=${badPkg.status} code=${badPkg.data?.error?.code}`,
  );

  // --- 5. Regression: templates tersedia ---------------------------------
  const templates = await api('/api/templates');
  record(
    'GET /api/templates (regression)',
    templates.ok && Array.isArray(templates.data?.templates) && templates.data.templates.length >= 1,
    `status=${templates.status} count=${templates.data?.templates?.length}`,
  );

  // --- 6. Register buyer (user A) ------------------------------------------
  const regA = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailA, password: PASSWORD, fullName: 'E2E6 Buyer' },
    expect: 200,
  });
  const tokenA = regA.data?.accessToken;
  record(
    'POST /api/auth/register (buyer)',
    regA.ok && !!tokenA,
    `status=${regA.status}`,
  );

  // --- 7. Order premium: amount dari server --------------------------------
  const orderKey = `s6-key-${Date.now()}`;
  const order1 = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: orderKey },
    expect: 201,
  });
  const premiumOrder = order1.data?.order;
  record(
    'POST /api/orders (premium → pending, amount server)',
    order1.ok && order1.data?.created === true
      && premiumOrder?.amount === 129000 && premiumOrder?.status === 'pending'
      && /^ORD-\d{8}-[0-9A-F]{4}$/.test(premiumOrder?.orderNumber ?? '')
      && premiumOrder?.package?.code === 'premium',
    `status=${order1.status} amount=${premiumOrder?.amount} orderNumber=${premiumOrder?.orderNumber}`,
  );

  // --- 8. Idempotency: duplicate submission --------------------------------
  const order1dup = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: orderKey },
    expect: 200,
  });
  record(
    'POST /api/orders (idempotency duplicate → created:false, id sama)',
    order1dup.ok && order1dup.data?.created === false
      && order1dup.data?.order?.id === premiumOrder?.id,
    `status=${order1dup.status} created=${order1dup.data?.created}`,
  );

  // --- 9. Manipulasi amount diabaikan (paket basic → pending, amount server) --
  const basicPkg = pkgList.find((p) => p.code === 'basic');
  const orderBasic = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: basicPkg.id, amount: 500000, price: 999999, idempotencyKey: `s6-basic-${Date.now()}` },
    expect: 201,
  });
  const basicOrder = orderBasic.data?.order;
  record(
    'POST /api/orders (amount tampering diabaikan; basic → pending, amount server)',
    orderBasic.ok && basicOrder?.amount === 77000 && basicOrder?.status === 'pending' && basicOrder?.package?.code === 'basic',
    `status=${orderBasic.status} amount=${basicOrder?.amount} status=${basicOrder?.status}`,
  );

  // --- 10. Paket invalid → 404 ----------------------------------------------
  const orderBad = await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: '00000000-0000-0000-0000-000000000000', idempotencyKey: `s6-bad-${Date.now()}` },
    expect: 404,
  });
  record(
    'POST /api/orders (paket invalid → 404)',
    orderBad.ok && orderBad.data?.error?.code === 'NOT_FOUND',
    `status=${orderBad.status} code=${orderBad.data?.error?.code}`,
  );

  // --- 11. Order tanpa autentikasi → 401 ------------------------------------
  const orderAnon = await api('/api/orders', {
    method: 'POST',
    body: { packageId: premium.id, idempotencyKey: `s6-anon-${Date.now()}` },
    expect: 401,
  });
  record(
    'POST /api/orders (unauthenticated → 401)',
    orderAnon.ok,
    `status=${orderAnon.status}`,
  );

  // --- 12. List order milik user --------------------------------------------
  const orderList = await api('/api/orders', { token: tokenA });
  const foundIds = orderList.data?.orders?.map((o) => o.id);
  record(
    'GET /api/orders (list milik user)',
    orderList.ok && foundIds.includes(premiumOrder?.id) && foundIds.includes(basicOrder?.id),
    `status=${orderList.status} count=${orderList.data?.orders?.length}`,
  );

  // --- 13. Detail order -------------------------------------------------------
  const orderDetail = await api(`/api/orders/${premiumOrder.id}`, { token: tokenA });
  record(
    'GET /api/orders/:id (detail)',
    orderDetail.ok && orderDetail.data?.order?.id === premiumOrder.id
      && orderDetail.data?.order?.amount === 129000,
    `status=${orderDetail.status}`,
  );

  // --- 14. Ownership: order user lain → 404 -----------------------------------
  const regB = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailB, password: PASSWORD, fullName: 'E2E6 Other' },
    expect: 200,
  });
  const tokenB = regB.data?.accessToken;
  const orderOther = await api(`/api/orders/${premiumOrder.id}`, { token: tokenB, expect: 404 });
  record(
    'GET /api/orders/:id (order milik orang lain → 404)',
    orderOther.ok && orderOther.data?.error?.code === 'NOT_FOUND',
    `status=${orderOther.status} code=${orderOther.data?.error?.code}`,
  );

  // --- 15. Buat payment (boundary manual) -------------------------------------
  const pay1 = await api(`/api/orders/${premiumOrder.id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 201,
  });
  const payment = pay1.data?.payment;
  record(
    'POST /api/orders/:id/payment (provider manual → pending)',
    pay1.ok && pay1.data?.created === true && payment?.provider === 'manual'
      && payment?.status === 'pending'
      && (payment?.paymentReference ?? '').startsWith('MANUAL-ORD-'),
    `status=${pay1.status} ref=${payment?.paymentReference}`,
  );

  // --- 16. Order berubah menjadi awaiting_payment ------------------------------
  const orderAfterPay = await api(`/api/orders/${premiumOrder.id}`, { token: tokenA });
  record(
    'POST payment → order awaiting_payment',
    orderAfterPay.data?.order?.status === 'awaiting_payment',
    `status=${orderAfterPay.data?.order?.status}`,
  );

  // --- 17. Payment duplicate → created:false, id sama --------------------------
  const pay1dup = await api(`/api/orders/${premiumOrder.id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 200,
  });
  record(
    'POST /api/orders/:id/payment (duplicate → created:false)',
    pay1dup.ok && pay1dup.data?.created === false && pay1dup.data?.payment?.id === payment?.id,
    `status=${pay1dup.status} created=${pay1dup.data?.created}`,
  );

  // --- 18. GET payment detail ---------------------------------------------------
  const payGet = await api(`/api/orders/${premiumOrder.id}/payment`, { token: tokenA });
  record(
    'GET /api/orders/:id/payment (detail)',
    payGet.ok && payGet.data?.payment?.status === 'pending'
      && payGet.data?.payment?.amount === 129000,
    `status=${payGet.status} amount=${payGet.data?.payment?.amount}`,
  );

  // --- 19. Order basic (pending) → payment 409 ALREADY_PAID jika sudah ada ------
  const payBasic = await api(`/api/orders/${basicOrder.id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 201,
  });
  record(
    'POST payment (order basic pending → 201 created)',
    payBasic.ok && payBasic.data?.created === true && payBasic.data?.payment?.status === 'pending',
    `status=${payBasic.status} created=${payBasic.data?.created}`,
  );

  // --- 20. Payment duplicate basic → created:false -----------------------------
  const payBasicDup = await api(`/api/orders/${basicOrder.id}/payment`, {
    method: 'POST',
    token: tokenA,
    expect: 200,
  });
  record(
    'POST payment (basic duplicate → created:false)',
    payBasicDup.ok && payBasicDup.data?.created === false,
    `status=${payBasicDup.status} created=${payBasicDup.data?.created}`,
  );

  // --- 21. Cancel order → pending/awaiting_payment ------------------------------
  const cancel = await api(`/api/orders/${premiumOrder.id}/cancel`, {
    method: 'POST',
    token: tokenA,
    expect: 200,
  });
  record(
    'POST /api/orders/:id/cancel → cancelled',
    cancel.ok && cancel.data?.order?.status === 'cancelled',
    `status=${cancel.status} orderStatus=${cancel.data?.order?.status}`,
  );

  // --- 22. Cancel ulang → 409 ORDER_STATUS_CONFLICT ------------------------------
  const cancel2 = await api(`/api/orders/${premiumOrder.id}/cancel`, {
    method: 'POST',
    token: tokenA,
    expect: 409,
  });
  record(
    'POST /api/orders/:id/cancel (ulang → 409)',
    cancel2.ok && cancel2.data?.error?.code === 'ORDER_STATUS_CONFLICT',
    `status=${cancel2.status} code=${cancel2.data?.error?.code}`,
  );

  // --- 23. Invitation dibuat → status draft ---------------------------------------
  const slug = `s6-${Date.now().toString(36)}`;
  const inv = await api('/api/invitations', {
    method: 'POST',
    token: tokenA,
    body: {
      title: 'E2E6 Lifecycle Verification',
      slug,
      templateId: templates.data.templates[0].id,
      eventDate: '2026-12-25',
      eventTime: '09:00',
      venue: 'Gedung E2E6',
      location: 'Jakarta',
      couple: 'E2E6 & Test',
    },
    expect: 201,
  });
  const invId = inv.data?.invitation?.id;
  record(
    'POST /api/invitations (baru → draft, packageId null)',
    inv.ok && inv.data?.invitation?.status === 'draft'
      && inv.data?.invitation?.packageId === null && inv.data?.invitation?.isPublished === false,
    `status=${inv.data?.invitation?.status}`,
  );

  // --- 24. GET status endpoint ------------------------------------------------------
  const invStatus = await api(`/api/invitations/${invId}/status`, { token: tokenA });
  record(
    'GET /api/invitations/:id/status → draft',
    invStatus.ok && invStatus.data?.status === 'draft' && invStatus.data?.isPublished === false,
    `status=${invStatus.data?.status}`,
  );

  // --- 25. Transisi draft → preview → published --------------------------------------
  const toPreview = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'preview' },
    expect: 200,
  });
  const toPublished = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'published' },
    expect: 200,
  });
  record(
    'PATCH status draft → preview → published (is_published sync)',
    toPreview.data?.status === 'preview' && toPublished.data?.status === 'published'
      && toPublished.data?.isPublished === true,
    `final=${toPublished.data?.status} isPublished=${toPublished.data?.isPublished}`,
  );

  // --- 26. Publik dapat akses slug saat published --------------------------------
  const publicOn = await api(`/api/invitations/public/${slug}`, { expect: 200 });
  record(
    'GET /api/invitations/public/:slug (published → 200)',
    publicOn.ok && publicOn.data?.invitation?.id === invId,
    `status=${publicOn.status}`,
  );

  // --- 27. published → unpublished → publik 404 -----------------------------------
  const toUnpublished = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'unpublished' },
    expect: 200,
  });
  const publicOff = await api(`/api/invitations/public/${slug}`, { expect: 404 });
  record(
    'PATCH published → unpublished (publik 404)',
    toUnpublished.data?.status === 'unpublished' && toUnpublished.data?.isPublished === false
      && publicOff.ok,
    `status=${toUnpublished.data?.status} public=${publicOff.status}`,
  );

  // --- 28. unpublished → draft (boleh) ---------------------------------------------
  const toDraft = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'draft' },
    expect: 200,
  });
  record(
    'PATCH unpublished → draft (transisi sah)',
    toDraft.data?.status === 'draft',
    `status=${toDraft.data?.status}`,
  );

  // --- 29. draft → published langsung (boleh) ---------------------------------------
  const directPub = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'published' },
    expect: 200,
  });
  record(
    'PATCH draft → published langsung (sah)',
    directPub.data?.status === 'published',
    `status=${directPub.data?.status}`,
  );

  // --- 30. published → preview → 409 INVALID_TRANSITION ------------------------------
  const illegal = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'preview' },
    expect: 409,
  });
  record(
    'PATCH published → preview → 409 INVALID_TRANSITION',
    illegal.ok && illegal.data?.error?.code === 'INVALID_TRANSITION',
    `status=${illegal.status} code=${illegal.data?.error?.code}`,
  );

  // --- 31. Status tidak dikenal → 400 --------------------------------------------------
  const bogus = await api(`/api/invitations/${invId}/status`, {
    method: 'PATCH',
    token: tokenA,
    body: { status: 'nonsense' },
    expect: 400,
  });
  record(
    'PATCH status tidak dikenal → 400 VALIDATION_ERROR',
    bogus.ok && bogus.data?.error?.code === 'VALIDATION_ERROR',
    `status=${bogus.status} code=${bogus.data?.error?.code}`,
  );

  // --- 32. Legacy publish → status published -------------------------------------------
  const legacyPub = await api(`/api/invitations/${invId}/publish`, {
    method: 'POST',
    token: tokenA,
    expect: 200,
  });
  record(
    'POST /api/invitations/:id/publish (legacy) → status published',
    legacyPub.data?.invitation?.isPublished === true && legacyPub.data?.invitation?.status === 'published',
    `isPublished=${legacyPub.data?.invitation?.isPublished} status=${legacyPub.data?.invitation?.status}`,
  );

  // --- 33. Regression: guestbook publik + gift accounts --------------------------------
  const gb = await api(`/api/invitations/public/${slug}/guestbook`, {
    method: 'POST',
    body: { guestName: 'Tamu E2E6', attendance: 'hadir', guestsCount: 2, message: 'Selamat!' },
    expect: 201,
  });
  const gift = await api(`/api/invitations/public/${slug}/gift-accounts`);
  record(
    'Regression: guestbook publik + gift accounts (publik)',
    gb.ok && gift.ok && Array.isArray(gift.data?.accounts),
    `gb=${gb.status} gift=${gift.status}`,
  );

  // --- 34. Invitations DTO menyertakan status & packageId --------------------------------
  const invList = await api('/api/invitations', { token: tokenA });
  const listItem = invList.data?.invitations?.find((i) => i.id === invId);
  record(
    'GET /api/invitations (DTO berisi status & packageId)',
    invList.ok && listItem?.status === 'published' && 'packageId' in listItem,
    `status=${listItem?.status} packageId=${listItem?.packageId}`,
  );

  // --- 35. Admin: promote + unpublish admin → status sync --------------------------------
  const regC = await api('/api/auth/register', {
    method: 'POST',
    body: { email: emailC, password: PASSWORD, fullName: 'E2E6 Admin Candidate' },
    expect: 200,
  });
  let promoted = false;
  try {
    execSync(`npm run admin:promote -- "${emailC}"`, { stdio: 'pipe', cwd: process.cwd() });
    promoted = true;
  } catch {
    promoted = false;
  }
  const cRole = await pool.query('SELECT role FROM users WHERE id = $1', [regC.data.user.id]);
  const loginC = await api('/api/auth/login', {
    method: 'POST',
    body: { email: emailC, password: PASSWORD },
    expect: 200,
  });
  const tokenC = loginC.data?.accessToken;
  const adminUnpub = await api(`/api/admin/invitations/${invId}/unpublish`, {
    method: 'POST',
    token: tokenC,
    expect: 200,
  });
  const statusAfterAdmin = await api(`/api/invitations/${invId}/status`, { token: tokenA });
  record(
    'Admin unpublish → is_published false & status unpublished (sync)',
    promoted && cRole.rows[0]?.role === 'admin'
      && adminUnpub.data?.invitation?.isPublished === false
      && statusAfterAdmin.data?.status === 'unpublished'
      && statusAfterAdmin.data?.isPublished === false,
    `role=${cRole.rows[0]?.role} adminIsPub=${adminUnpub.data?.invitation?.isPublished} ownerStatus=${statusAfterAdmin.data?.status}`,
  );

  // --- 36. Regression: admin stats -------------------------------------------------------
  const stats = await api('/api/admin/stats', { token: tokenC, expect: 200 });
  record(
    'Regression: GET /api/admin/stats (admin → 200)',
    stats.ok && typeof stats.data?.stats?.users === 'number',
    `status=${stats.status} users=${stats.data?.stats?.users}`,
  );

  // --- 37. Rate limit order: burst 11 POST /api/orders → ≥1 × 429 --------------------------
  const freshKey = `s6-rate-${Date.now()}`;
  await api('/api/orders', {
    method: 'POST',
    token: tokenA,
    body: { packageId: premium.id, idempotencyKey: freshKey },
    expect: 201,
  });
  const burstCodes = [];
  for (let i = 0; i < 11; i += 1) {
    burstCodes.push(await rawApi('/api/orders', {
      token: tokenA,
      body: { packageId: premium.id, idempotencyKey: freshKey },
    }));
  }
  record(
    'Rate limit POST /api/orders (burst 11 → ≥1 × 429)',
    burstCodes.includes(429),
    `codes=${burstCodes.join(',')}`,
  );

  // --- 38. Rate limit payment: burst 6 POST payment → ≥1 × 429 -----------------------------
  const burstPayCodes = [];
  for (let i = 0; i < 6; i += 1) {
    burstPayCodes.push(await rawApi(`/api/orders/${basicOrder.id}/payment`, { token: tokenA }));
  }
  record(
    'Rate limit POST /api/orders/:id/payment (burst 6 → ≥1 × 429)',
    burstPayCodes.includes(429),
    `codes=${burstPayCodes.join(',')}`,
  );

  // --- Cleanup: payment dulu (FK RESTRICT), lalu users (cascade orders/invitations) ---------
  await pool.query(
    `DELETE FROM payments
      WHERE order_id IN (SELECT id FROM orders WHERE user_id = ANY($1))`,
    [[regA.data.user.id, regB.data.user.id, regC.data.user.id]],
  );
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

  console.log(`\n=== E2E SPRINT 6 — ${passCount}/${passCount + failCount} PASS ===\n`);
  for (const r of results) {
    const icon = r.ok ? '✅ PASS' : '❌ FAIL';
    console.log(`${icon}  ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passCount} PASS · ${failCount} FAIL`);
  process.exit(failCount > 0 ? 1 : 0);
}

main();
