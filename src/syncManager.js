// ── syncManager.js ────────────────────────────────────────────────────────────
// Pending queue'dagi amallarni Supabase'ga yuborish va internet holatini kuzatish.
// Internet qayta ulanganda avtomatik ishga tushadi.

import { supabase, fromRelay } from './supabase.js';
import {
  getPendingQueue,
  removePendingItem,
  clearPendingQueue,
  isTempId,
  decodePassword,
} from './offlineStore.js';

// ── Sync callback registratsiyasi ─────────────────────────────────────────────
// Sync tugaganda UI'ni yangilash uchun callback'lar ro'yxati
const syncCallbacks = new Set();

export function onSyncComplete(cb) {
  syncCallbacks.add(cb);
  return () => syncCallbacks.delete(cb); // unsubscribe
}

function notifySyncComplete(result) {
  syncCallbacks.forEach((cb) => {
    try { cb(result); } catch {}
  });
}

// ── Pending queue'ni yuborish ─────────────────────────────────────────────────

export async function syncPendingQueue() {
  const queue = getPendingQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  // temp_id → real_id xaritasi: bir seansdagi insert'lardan hosil bo'lgan
  const tempIdMap = {};

  for (const item of queue) {
    try {
      let success = false;

      if (item.table === 'relays') {
        success = await syncRelayOp(item, tempIdMap);
      } else if (item.table === 'stations') {
        success = await syncStationOp(item, tempIdMap);
      } else if (item.table === 'uchastkalar') {
        success = await syncUchastkaOp(item, tempIdMap);
      } else if (item.table === 'mexaniklar') {
        success = await syncMexanikOp(item, tempIdMap);
      } else {
        // Noma'lum jadval — o'tkazib yuboramiz
        removePendingItem(item.id);
        continue;
      }

      if (success) {
        removePendingItem(item.id);
        synced++;
      } else {
        failed++;
      }
    } catch (err) {
      console.warn('[syncManager] item failed:', item, err);
      failed++;
    }
  }

  notifySyncComplete({ synced, failed, tempIdMap });
  return { synced, failed, tempIdMap };
}

// ── Relay operatsiyalari ──────────────────────────────────────────────────────

async function syncRelayOp(item, tempIdMap) {
  const { op, data } = item;

  if (op === 'insert') {
    // Temp ID bilan saqlangan — haqiqiy ID kerak
    const payload = { ...data };
    delete payload.id; // Supabase o'zi beradi

    const { data: inserted, error } = await supabase
      .from('relays')
      .insert(fromRelay(payload))
      .select()
      .single();

    if (error) { console.warn('[sync] relay insert error:', error); return false; }
    // Temp ID → Real ID xaritasiga qo'shamiz
    if (data.id) tempIdMap[data.id] = inserted.id;
    return true;
  }

  if (op === 'update') {
    // Agar ID hali temp bo'lsa (keyinroq insert kelishi kutilgan), skip
    const realId = isTempId(data.id) ? tempIdMap[data.id] : data.id;
    if (!realId) return false;

    const { error } = await supabase.rpc('update_relay_anon', {
      p_id: realId,
      p_station_id: data.stationId,
      p_name: data.name,
      p_num: data.num,
      p_stativ: data.stativ || null,
      p_last_check: data.lastCheck || null,
      p_next_check: data.nextCheck || null,
      p_note: data.note || null,
      p_object: data.object || null,
      p_manzil: data.manzil || null,
    });
    if (error) { console.warn('[sync] relay update error:', error); return false; }
    return true;
  }

  if (op === 'delete') {
    const realId = isTempId(data.id) ? tempIdMap[data.id] : data.id;
    if (!realId) return true; // Temp edi, hech qachon Supabase'ga kiritilmagan
    const { error } = await supabase.from('relays').delete().eq('id', realId);
    if (error) { console.warn('[sync] relay delete error:', error); return false; }
    return true;
  }

  if (op === 'bulk-update') {
    const realId = isTempId(data.id) ? tempIdMap[data.id] : data.id;
    if (!realId) return false;
    const { error } = await supabase.from('relays').update(data.updates).eq('id', realId);
    if (error) { console.warn('[sync] relay bulk-update error:', error); return false; }
    return true;
  }

  return false;
}

// ── Station operatsiyalari ────────────────────────────────────────────────────

async function syncStationOp(item, _tempIdMap) {
  const { op, data } = item;

  if (op === 'insert') {
    const { error: insErr } = await supabase.from('stations').insert({
      id: data.id, name: data.name, username: data.username, uchastka_id: data.uchastka_id || null,
    });
    if (insErr) { console.warn('[sync] station insert error:', insErr); return false; }
    if (data._password) {
      const pw = decodePassword(data._password) || data._password;
      await supabase.rpc('set_station_password', { p_id: data.id, p_password: pw });
    }
    return true;
  }

  if (op === 'update') {
    const { error } = await supabase.from('stations')
      .update({ name: data.name, username: data.username, uchastka_id: data.uchastka_id || null })
      .eq('id', data.id);
    if (error) { console.warn('[sync] station update error:', error); return false; }
    if (data._password) {
      const pw = decodePassword(data._password) || data._password;
      await supabase.rpc('set_station_password', { p_id: data.id, p_password: pw });
    }
    return true;
  }

  if (op === 'delete') {
    await supabase.from('relays').delete().eq('station_id', data.id);
    await supabase.from('stations').delete().eq('id', data.id);
    return true;
  }

  return false;
}

// ── Uchastka operatsiyalari ───────────────────────────────────────────────────

async function syncUchastkaOp(item, _tempIdMap) {
  const { op, data } = item;

  if (op === 'insert') {
    const { error } = await supabase.from('uchastkalar').insert({ id: data.id, name: data.name });
    if (error) { console.warn('[sync] uchastka insert error:', error); return false; }
    return true;
  }

  if (op === 'update') {
    const { error } = await supabase.from('uchastkalar').update({ name: data.name }).eq('id', data.id);
    if (error) { console.warn('[sync] uchastka update error:', error); return false; }
    return true;
  }

  if (op === 'delete') {
    await supabase.from('stations').update({ uchastka_id: null }).eq('uchastka_id', data.id);
    await supabase.from('uchastkalar').delete().eq('id', data.id);
    return true;
  }

  return false;
}

// ── Mexanik operatsiyalari ────────────────────────────────────────────────────

async function syncMexanikOp(item, _tempIdMap) {
  const { op, data } = item;

  if (op === 'insert') {
    const { error } = await supabase.from('mexaniklar').insert({
      id: data.id, name: data.name, username: data.username || null,
    });
    if (error) { console.warn('[sync] mexanik insert error:', error); return false; }
    if (data._password) {
      const pw = decodePassword(data._password) || data._password;
      await supabase.rpc('set_mexanik_password', { p_id: data.id, p_password: pw });
    }
    return true;
  }

  if (op === 'update') {
    const { error } = await supabase.from('mexaniklar')
      .update({ name: data.name, username: data.username || null })
      .eq('id', data.id);
    if (error) { console.warn('[sync] mexanik update error:', error); return false; }
    if (data._password) {
      const pw = decodePassword(data._password) || data._password;
      await supabase.rpc('set_mexanik_password', { p_id: data.id, p_password: pw });
    }
    return true;
  }

  if (op === 'delete') {
    await supabase.from('mexaniklar').delete().eq('id', data.id);
    return true;
  }

  return false;
}

// ── Internet holati kuzatish (ping-based) ────────────────────────────────────

const PING_URL = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/?apikey=${import.meta.env.VITE_SUPABASE_ANON_KEY}`;

async function pingServer() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(PING_URL, { method: 'HEAD', signal: controller.signal, cache: 'no-store' });
    clearTimeout(timer);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

let _reallyOnline = true; // so'nggi ping natijasi

export function isOnline() {
  return _reallyOnline;
}

// Tashqaridan darhol sync qilish uchun
export async function triggerSync() {
  const online = await pingServer();
  _reallyOnline = online;
  if (online && getPendingQueue().length > 0) {
    console.log('[syncManager] Manual sync triggered...');
    await syncPendingQueue();
  }
}

let autoSyncEnabled = false;
let autoSyncInterval = null;
let _onlineHandler = null;
let _offlineHandler = null;

export function startAutoSync() {
  if (autoSyncEnabled) return;
  autoSyncEnabled = true;

  async function tick() {
    const online = await pingServer();
    const wasOnline = _reallyOnline;
    _reallyOnline = online;

    // Offline → Online o'tish: queue yuborish
    if (online && !wasOnline) {
      console.log('[syncManager] Connectivity restored — syncing...');
      await syncPendingQueue();
    }

    // Sahifa yangi yuklanganda ham sinab ko'ramiz
    if (online && getPendingQueue().length > 0 && wasOnline) {
      await syncPendingQueue();
    }
  }

  // Browser online/offline eventlarini tinglash — darhol react qilish uchun
  _offlineHandler = () => {
    _reallyOnline = false;
    console.log('[syncManager] Browser reports offline');
  };
  _onlineHandler = async () => {
    console.log('[syncManager] Browser reports online — syncing...');
    // Darhol ping qilib, queue'ni yuboramiz
    const online = await pingServer();
    _reallyOnline = online;
    if (online && getPendingQueue().length > 0) {
      await syncPendingQueue();
    }
  };
  window.addEventListener('online', _onlineHandler);
  window.addEventListener('offline', _offlineHandler);

  // Darhol birinchi tekshiruv
  tick();

  // Har 30 soniyada (batareya tejash uchun 5s dan oshirildi)
  autoSyncInterval = setInterval(tick, 30000);
}

export function stopAutoSync() {
  if (!autoSyncEnabled) return;
  if (autoSyncInterval) { clearInterval(autoSyncInterval); autoSyncInterval = null; }
  if (_onlineHandler) { window.removeEventListener('online', _onlineHandler); _onlineHandler = null; }
  if (_offlineHandler) { window.removeEventListener('offline', _offlineHandler); _offlineHandler = null; }
  autoSyncEnabled = false;
}

