import { getUser } from '@netlify/identity';
import { FLEET_DATA, PARTNERS_DATA, BOOKING_STATUSES } from './data/catalog';

export { FLEET_DATA, PARTNERS_DATA, BOOKING_STATUSES };

const TIMEOUT_MS = 8000;

async function request(path, { method = 'GET', body, timeout = TIMEOUT_MS } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(path, {
      method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      throw err;
    }
    return data;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Server tidak merespons. Periksa koneksi Anda.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Memastikan token sesi Identity masih segar sebelum memanggil API admin
async function ensureSession() {
  await getUser();
}

/* ------------------------------------------------------------------ */
/* Publik — hanya ketersediaan armada tanpa identitas pelanggan lain   */
/* ------------------------------------------------------------------ */

export async function fetchPublicData() {
  const data = await request('/api/public/availability');
  return {
    fleet: data.fleet || FLEET_DATA,
    // Bentuk minimal yang dibutuhkan matriks bentrok (utils.js)
    blocked: (data.blocked || []).map((b, i) => ({ id: `blk-${i}`, ...b })),
  };
}

export async function submitPublicBooking(payload) {
  const data = await request('/api/public/bookings', { method: 'POST', body: payload });
  return data.booking;
}

/* ------------------------------------------------------------------ */
/* Admin — membutuhkan login Netlify Identity dengan role admin        */
/* ------------------------------------------------------------------ */

export async function fetchAdminMe() {
  await ensureSession();
  return (await request('/api/admin/me')).user;
}

export async function fetchAdminData() {
  await ensureSession();
  const data = await request('/api/admin/data');
  return {
    fleet: data.fleet || FLEET_DATA,
    partners: data.partners || PARTNERS_DATA,
    bookings: data.bookings || [],
    lastSync: data.lastSync,
  };
}

export async function createAdminBooking(payload) {
  await ensureSession();
  return (await request('/api/admin/bookings', { method: 'POST', body: payload })).booking;
}

export async function updateAdminBooking(id, updates) {
  await ensureSession();
  return (await request(`/api/admin/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: updates })).booking;
}

export async function deleteAdminBooking(id) {
  await ensureSession();
  return request(`/api/admin/bookings/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

/**
 * Streaming analisis AI. onChunk dipanggil dengan teks kumulatif.
 */
export async function streamAiAnalysis({ mode = 'insight', messages = [] }, onChunk, signal) {
  await ensureSession();
  const res = await fetch('/api/admin/ai', {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, messages }),
    signal,
  });
  if (!res.ok || !res.body) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Analisis AI gagal dimulai.');
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let text = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value, { stream: true });
    onChunk(text);
  }
  return text;
}
