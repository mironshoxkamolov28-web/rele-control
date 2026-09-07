import React, { useState, useEffect } from 'react';
import { getPendingQueue } from '../offlineStore.js';
import { onSyncComplete } from '../syncManager.js';

/**
 * OfflineBanner — Internet holati va sinkronizatsiya holatini ko'rsatadi.
 * - Offline: qizil banner, navbatdagi amallar soni
 * - Sinkronlanmoqda: sariq banner, spinner
 * - Online (sync tugadi): yashil banner, 3 soniya ko'rinib yo'qoladi
 */
export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine);
  const [pendingCount, setPendingCount] = useState(() => getPendingQueue().length);
  const [syncing, setSyncing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Internet holat o'zgarishlarini kuzatish
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncing(true);
      setShowSuccess(false);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncing(false);
      setShowSuccess(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync tugaganini kuzatish
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

  // Pending count ni vaqti-vaqti bilan yangilash (offline amallar uchun)
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingCount(getPendingQueue().length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Online, sync yo'q, muvaffaqiyat ham yo'q → banner ko'rsatilmaydi
  if (isOnline && !syncing && !showSuccess && pendingCount === 0) return null;

  // ── Ko'rinish ──────────────────────────────────────────────────────────────
  let bgColor, icon, text;

  if (!isOnline) {
    bgColor = 'bg-red-600/90 border-red-500/50';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728M15.536 8.464a5 5 0 010 7.072M12 12h.01M3 3l18 18" />
      </svg>
    );
    text = pendingCount > 0
      ? `Offline rejim — ${pendingCount} ta amal navbatda`
      : 'Offline rejim — o\'zgarishlar saqlanadi';
  } else if (syncing) {
    bgColor = 'bg-yellow-600/90 border-yellow-500/50';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    );
    text = `Sinkronizatsiya davom etmoqda... ${pendingCount > 0 ? `(${pendingCount} ta qoldi)` : ''}`;
  } else if (showSuccess) {
    bgColor = 'bg-emerald-600/90 border-emerald-500/50';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    );
    text = 'Sinkronizatsiya muvaffaqiyatli yakunlandi';
  } else if (isOnline && pendingCount > 0) {
    // Online lekin hali queue bo'sh emas (sync boshlanmagan)
    bgColor = 'bg-yellow-600/90 border-yellow-500/50';
    icon = (
      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
    text = `${pendingCount} ta amal yuborilishini kutmoqda`;
  } else {
    return null;
  }

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-center gap-2
        px-4 py-2 text-sm font-medium text-white
        border-b backdrop-blur-sm
        transition-all duration-300
        ${bgColor}
      `}
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

export default OfflineBanner;
