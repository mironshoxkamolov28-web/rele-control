// ── offlineStore.js ───────────────────────────────────────────────────────────
// Mahalliy (offline) ma'lumotlar saqlash moduli.
// Barcha ma'lumotlar localStorage'da saqlanadi.
// Pending queue — internet yo'q bo'lganda bajarilmagan amallar navbati.

const KEYS = {
  relays:      'rc_offline_relays',
  stations:    'rc_offline_stations',
  uchastkalar: 'rc_offline_uchastkalar',
  mexaniklar:  'rc_offline_mexaniklar',
  queue:       'rc_offline_queue',
};

// ── Local data read/write ─────────────────────────────────────────────────────

export function getLocalData(table) {
  try {
    const raw = localStorage.getItem(KEYS[table]);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setLocalData(table, rows) {
  try {
    localStorage.setItem(KEYS[table], JSON.stringify(rows));
  } catch (e) {
    console.warn('[offlineStore] setLocalData error:', e);
  }
}

// ── Pending queue ─────────────────────────────────────────────────────────────

export function getPendingQueue() {
  try {
    const raw = localStorage.getItem(KEYS.queue);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePendingQueue(queue) {
  try {
    localStorage.setItem(KEYS.queue, JSON.stringify(queue));
  } catch (e) {
    console.warn('[offlineStore] savePendingQueue error:', e);
  }
}

export function addToPendingQueue(operation) {
  // operation: { id, timestamp, table, op, data, tempId? }
  const queue = getPendingQueue();
  queue.push({ ...operation, timestamp: new Date().toISOString() });
  savePendingQueue(queue);
}

export function removePendingItem(id) {
  const queue = getPendingQueue().filter((item) => item.id !== id);
  savePendingQueue(queue);
}

export function clearPendingQueue() {
  try {
    localStorage.removeItem(KEYS.queue);
  } catch {}
}

// Temp ID yaratish — offline qo'shilgan yozuvlar uchun
export function createTempId() {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isTempId(id) {
  return typeof id === 'string' && id.startsWith('temp-');
}

// ── Local state operations ────────────────────────────────────────────────────
// Bu funksiyalar local cache'ni darhol yangilaydi (state setter'lar orqali)

export function applyLocalInsert(setRows, row) {
  setRows((cur) => [...cur, row]);
}

export function applyLocalUpdate(setRows, id, updates) {
  setRows((cur) => cur.map((r) => r.id === id ? { ...r, ...updates } : r));
}

export function applyLocalDelete(setRows, id) {
  setRows((cur) => cur.filter((r) => r.id !== id));
}

// Temp ID'ni haqiqiy ID bilan almashtirish (sync muvaffaqiyatli bo'lganda)
export function replaceTempId(setRows, tempId, realId) {
  setRows((cur) => cur.map((r) => r.id === tempId ? { ...r, id: realId } : r));
}

// ── Persistence helpers ───────────────────────────────────────────────────────
// Har safar state o'zgarganda local cache'ni yangilash uchun

export function persistRelays(relays) {
  setLocalData('relays', relays);
}

export function persistStations(stations) {
  setLocalData('stations', stations);
}

export function persistUchastkalar(uchastkalar) {
  setLocalData('uchastkalar', uchastkalar);
}

export function persistMexaniklar(mexaniklar) {
  setLocalData('mexaniklar', mexaniklar);
}
