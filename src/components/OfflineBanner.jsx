import React, { useState, useEffect, useRef } from 'react';
import { getPendingQueue } from '../offlineStore.js';
import { onSyncComplete } from '../syncManager.js';

// Supabase health endpoint — haqiqiy internet bor-yo'qligini tekshiradi
const PING_URL = 'https://vebhjxwzpqdwxbtquyth.supabase.co/rest/v1/?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlYmhqeHd6cHFkd3hidHF1eXRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4MDI4MTAsImV4cCI6MjA5ODM3ODgxMH0.ToxFuUZtKm35SWmdtzpeIKISdA8LCAymlVcoZIqOUl0';
const PING_INTERVAL = 4000; // har 4 soniya
const PING_TIMEOUT = 3000;  // 3 soniya kutish

async function checkRealConnectivity() {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT);
    const res = await fetch(PING_URL, {
      method: 'HEAD',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    return res.ok || res.status < 500;
  } catch {
    return false;
  }
}

/**
 * OfflineBanner — Haqiqiy internet holatini kuzatadi va ko'rsatadi.
 * navigator.onLine o'rniga har 4 soniyada real ping yuboradi.
 *
 * - Offline: qizil banner
 * - Sinkronlanmoqda: sariq spinner
 * - Online (sync tugadi): yashil banner, 3 soniya ko'rinib yo'qoladi
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true); // start optimistic
  const [checked, setChecked] = useState(false);   // birinchi tekshiruv o'tganmi
  const [pendingCount, setPendingCount] = useState(() => getPendingQueue().length);
  const [syncing, setSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const prevOnlineRef = useRef(true);

  // ── Asosiy ping loop ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const online = await checkRealConnectivity();
      if (cancelled) return;

      setChecked(true);
      setIsOnline(online);

      // Online → Offline o'tganda
      if (!online && prevOnlineRef.current) {
        setSyncing(false);
        setShowSuccess(false);
      }

      // Offline → Online o'tganda → sync boshlash signali
      if (online && !prevOnlineRef.current) {
        setSyncing(true);
        setShowSuccess(false);
      }

      prevOnlineRef.current = online;
    }

    // Darhol birinchi tekshiruv
    ping();

    // Keyin har 4 soniyada
    const interval = setInterval(ping, PING_INTERVAL);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // ── Sync tugaganini kuzatish ────────────────────────────────────────────────
  useEffect(() => {
    const unsub = onSyncComplete(({ synced }) => {
      setSyncing(false);
      setPendingCount(getPendingQueue().length);
      if (synced > 0) {
        setShowSuccess(true);
        const timer = setTimeout(() => setShowSuccess(false), 3500);
        return () => clearTimeout(timer);
      }
    });
    return unsub;
  }, []);

  // ── Pending count yangilash ─────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(getPendingQueue().length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Birinchi tekshiruv tugagunicha hech narsa ko'rsatmaymiz
  if (!checked) return null;

  // Online, sync yo'q, success yo'q, queue bo'sh → banner ko'rsatilmaydi
  if (isOnline && !syncing && !showSuccess && pendingCount === 0) return null;

  // ── Ko'rinish ───────────────────────────────────────────────────────────────
  let bgClass, icon, text;

  if (!isOnline) {
    bgClass = 'bg-red-600 border-red-700';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M3 3l18 18" />
      </svg>
    );
    text = pendingCount > 0
      ? `📵 Offline rejim — ${pendingCount} ta amal navbatda`
      : '📵 Offline rejim — o\'zgarishlar saqlanadi';
  } else if (syncing) {
    bgClass = 'bg-yellow-500 border-yellow-600';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
    text = `⏳ Sinkronizatsiya... ${pendingCount > 0 ? `(${pendingCount} ta qoldi)` : ''}`;
  } else if (showSuccess) {
    bgClass = 'bg-emerald-600 border-emerald-700';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
    text = '✅ Sinkronizatsiya muvaffaqiyatli yakunlandi';
  } else if (isOnline && pendingCount > 0) {
    bgClass = 'bg-yellow-500 border-yellow-600';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    text = `⚠️ ${pendingCount} ta amal yuborilishini kutmoqda`;
  } else {
    return null;
  }

  return (
    <div
      style={{ zIndex: 9999 }}
      className={`
        fixed top-0 left-0 right-0
        flex items-center justify-center gap-2
        px-4 py-2.5 text-sm font-semibold text-white
        border-b-2
        ${bgClass}
      `}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default OfflineBanner;
