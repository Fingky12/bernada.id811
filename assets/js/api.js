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
};
