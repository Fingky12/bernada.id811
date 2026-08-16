/* ==========================================================
    BERNADA.ID API CLIENT
    ----------------------------------------------------------
    Sprint 3 — The Core Features
    Tanggung jawab:
    - Memanggil endpoint /api (same-origin, cookie httpOnly)
    - Menyimpan access token di memori (bukan localStorage)
    - Auto-refresh access token via cookie refresh sekali gagal 401
    - Membungkus error server menjadi Error dengan .status & .code
  ========================================================== */

const API_BASE = '/api';

let accessToken = null;

async function parseResponse(res) {
  if (res.status === 204) {
    return null;
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const error = new Error(
      data?.error?.message || `Permintaan gagal (${res.status}).`,
    );
    error.status = res.status;
    error.code = data?.error?.code || 'REQUEST_FAILED';
    throw error;
  }
  return data;
}

async function refreshSession() {
  const res = await fetch(`${API_BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'same-origin',
  });
  if (!res.ok) {
    accessToken = null;
    return false;
  }
  const data = await res.json();
  accessToken = data.accessToken;
  return true;
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = {};
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'same-origin',
  });

  if (res.status === 401 && accessToken) {
    if (await refreshSession()) {
      headers.Authorization = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
        credentials: 'same-origin',
      });
    }
  }

  return parseResponse(res);
}

export const api = {
  async initSession() {
    return refreshSession();
  },

  async register({ email, password, fullName }) {
    const data = await request('/auth/register', {
      method: 'POST',
      body: { email, password, fullName },
    });
    accessToken = data.accessToken;
    return data.user;
  },

  async login({ email, password }) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    accessToken = data.accessToken;
    return data.user;
  },

  async logout() {
    try {
      await request('/auth/logout', { method: 'POST' });
    } finally {
      accessToken = null;
    }
  },

  async forgotPassword(email) {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  },

  async resetPassword(token, password) {
    const data = await request('/auth/reset-password', {
      method: 'POST',
      body: { token, password },
    });
    return data.user;
  },

  async me() {
    const data = await request('/auth/me');
    return data.user;
  },

  async listTemplates() {
    const data = await request('/templates');
    return data.templates;
  },

  async listInvitations() {
    const data = await request('/invitations');
    return data.invitations;
  },

  async createInvitation(payload) {
    const data = await request('/invitations', {
      method: 'POST',
      body: payload,
    });
    return data.invitation;
  },

  async getInvitation(id) {
    const data = await request(`/invitations/${id}`);
    return data.invitation;
  },

  async updateInvitation(id, payload) {
    const data = await request(`/invitations/${id}`, {
      method: 'PATCH',
      body: payload,
    });
    return data.invitation;
  },

  async deleteInvitation(id) {
    await request(`/invitations/${id}`, { method: 'DELETE' });
  },

  async setPublished(id, isPublished) {
    const action = isPublished ? 'publish' : 'unpublish';
    const data = await request(`/invitations/${id}/${action}`, {
      method: 'POST',
    });
    return data.invitation;
  },

  async getInvitationStatus(id) {
    return request(`/invitations/${id}/status`);
  },

  async setInvitationStatus(id, status) {
    return request(`/invitations/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
  },

  /* ---- Manajemen tamu ---- */

  async listGuests(invitationId) {
    const data = await request(`/invitations/${invitationId}/guests`);
    return data.guests;
  },

  async addGuest(invitationId, payload) {
    const data = await request(`/invitations/${invitationId}/guests`, {
      method: 'POST',
      body: payload,
    });
    return data.guests;
  },

  async addGuestsBulk(invitationId, guests) {
    const data = await request(`/invitations/${invitationId}/guests`, {
      method: 'POST',
      body: { guests },
    });
    return data.guests;
  },

  async getGuestStats(invitationId) {
    return request(`/invitations/${invitationId}/guests/stats`);
  },

  async updateGuest(guestId, payload) {
    const data = await request(`/guests/${guestId}`, {
      method: 'PATCH',
      body: payload,
    });
    return data.guest;
  },

  async deleteGuest(guestId) {
    await request(`/guests/${guestId}`, { method: 'DELETE' });
  },

  /* ---- Amplop digital ---- */

  async listGiftAccounts(invitationId) {
    const data = await request(`/invitations/${invitationId}/gift-accounts`);
    return data.accounts;
  },

  async createGiftAccount(invitationId, payload) {
    const data = await request(`/invitations/${invitationId}/gift-accounts`, {
      method: 'POST',
      body: payload,
    });
    return data.account;
  },

  async updateGiftAccount(giftAccountId, payload) {
    const data = await request(`/gift-accounts/${giftAccountId}`, {
      method: 'PATCH',
      body: payload,
    });
    return data.account;
  },

  async deleteGiftAccount(giftAccountId) {
    await request(`/gift-accounts/${giftAccountId}`, { method: 'DELETE' });
  },

  /* ---- Komersial: paket, order, pembayaran (Sprint 6) ---- */

  async listPackages() {
    const data = await request('/packages');
    return data.packages;
  },

  async getPackage(id) {
    const data = await request(`/packages/${id}`);
    return data.package;
  },

  async createOrder({ packageId, invitationId, idempotencyKey }) {
    return request('/orders', {
      method: 'POST',
      body: {
        packageId,
        invitationId: invitationId || undefined,
        idempotencyKey,
      },
    });
  },

  async listOrders() {
    const data = await request('/orders');
    return data.orders;
  },

  async getOrder(id) {
    const data = await request(`/orders/${id}`);
    return data.order;
  },

  async cancelOrder(id) {
    const data = await request(`/orders/${id}/cancel`, { method: 'POST' });
    return data.order;
  },

  async createOrderPayment(orderId) {
    return request(`/orders/${orderId}/payment`, { method: 'POST' });
  },

  async getOrderPayment(orderId) {
    return request(`/orders/${orderId}/payment`);
  },

  /* ---- Admin (Sprint 5) ---- */

  async getAdminStats() {
    const data = await request('/admin/stats');
    return data.stats;
  },

  async listAdminUsers({ search = '', role = '', page = 1, pageSize = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (role) params.set('role', role);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return request(`/admin/users?${params.toString()}`);
  },

  async getAdminUser(userId) {
    return request(`/admin/users/${userId}`);
  },

  async setUserRole(userId, role) {
    const data = await request(`/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: { role },
    });
    return data.user;
  },

  async listAdminInvitations({ search = '', status = '', page = 1, pageSize = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (status) params.set('status', status);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return request(`/admin/invitations?${params.toString()}`);
  },

  async adminUnpublishInvitation(id) {
    const data = await request(`/admin/invitations/${id}/unpublish`, {
      method: 'POST',
    });
    return data.invitation;
  },

  async listAdminGuestbook({ search = '', page = 1, pageSize = 20 } = {}) {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    return request(`/admin/guestbook?${params.toString()}`);
  },

  async deleteAdminGuestbookEntry(entryId) {
    await request(`/admin/guestbook/${entryId}`, { method: 'DELETE' });
  },
};
