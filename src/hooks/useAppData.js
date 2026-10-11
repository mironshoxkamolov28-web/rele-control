import { useState, useEffect } from 'react';
import { supabase, toRelay } from '../supabase.js';
import { getRelayStatusFromDate, fetchAllRows } from '../relayHelpers.js';
import {
  getLocalData, persistRelays, persistStations, persistUchastkalar, persistMexaniklar,
  isTempId,
} from '../offlineStore.js';
import { startAutoSync, stopAutoSync, isOnline, onSyncComplete } from '../syncManager.js';

export function useAppData() {
  // ── Data ─────────────────────────────────────────────────────────────────
  const [stations, setStations] = useState(() => getLocalData('stations') || []);
  const [relays, setRelays] = useState(() => {
    // offlineStore'dan oladi (rc_offline_relays), eski kesh bilan ham moslik
    const offline = getLocalData('relays');
    if (offline) return offline;
    try {
      const cached = localStorage.getItem('rc_relays_cache');
      return cached ? JSON.parse(cached) : [];
    } catch { return []; }
  });
  const [loading, setLoading] = useState(true);
  const [publicRelay, setPublicRelay] = useState(null);
  const [uchastkalar, setUchastkalar] = useState(() => getLocalData('uchastkalar') || []);
  const [mexaniklar, setMexaniklar] = useState(() => getLocalData('mexaniklar') || []);
  // Internet holati
  const [online, setOnline] = useState(() => isOnline());

  // ── Public relay fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    const m = window.location.pathname.match(/^\/relay\/(\d+)$/);
    if (!m) return;
    const id = parseInt(m[1], 10);
    supabase
      .from('relays')
      .select('*, stations!station_id(name)')
      .eq('id', id)
      .single()
      .then(({ data }) => {
        if (data) {
          const relay = toRelay(data);
          relay.stationName = data.stations?.name || relay.stationId;
          setPublicRelay({ ...relay, status: getRelayStatusFromDate(relay.nextCheck) });
        }
      });
  }, []);

  // ── Main data loading ──────────────────────────────────────────────────────
  useEffect(() => {
    const isPublicPage = /^\/relay\/\d+$/.test(window.location.pathname);
    if (isPublicPage) { setLoading(false); return; }

    // Internet yo'q bo'lsa — local keshdan yuklaymiz va darhol ko'rsatamiz
    if (!navigator.onLine) {
      setLoading(false);
      return;
    }

    // Faqat kerakli ustunlar — tarmoq yukini kamaytiradi
    const RELAY_COLS = 'id,station_id,name,num,stativ,last_check,next_check,note,object,manzil';

    // 1-qadam: kichik jadvallar + birinchi 500 relay parallel yuklanadi
    Promise.all([
      supabase.from('stations').select('id,name,username,uchastka_id'),
      supabase.from('relays').select(RELAY_COLS).range(0, 499),
      supabase.from('uchastkalar').select('*'),
      supabase.from('mexaniklar').select('id,name,username'),
    ]).then(([{ data: stationsData }, { data: firstRelays }, { data: uchastkalarData }, { data: mexaniklarData }]) => {
      if (stationsData) {
        setStations(stationsData);
        persistStations(stationsData);
      }
      if (firstRelays) {
        const mapped = firstRelays.map(toRelay);
        setRelays(mapped);
        persistRelays(mapped);
      }
      if (uchastkalarData) {
        setUchastkalar(uchastkalarData);
        persistUchastkalar(uchastkalarData);
      }
      if (mexaniklarData) {
        setMexaniklar(mexaniklarData);
        persistMexaniklar(mexaniklarData);
      }
      setLoading(false); // ← foydalanuvchi darhol ko'radi

      // 2-qadam: 500 dan ortiq bo'lsa qolganlarini orqa fonda yuklaymiz
      if (firstRelays && firstRelays.length === 500) {
        fetchAllRows(supabase, 'relays', RELAY_COLS).then(({ data: allRelays }) => {
          if (allRelays) {
            const mapped = allRelays.map(toRelay);
            setRelays(mapped);
            persistRelays(mapped);
          }
        });
      }
    }).catch(() => {
      // Tarmoq xatosi — local keshdan davom etamiz
      setLoading(false);
    });
  }, []);

  // ── Online/Offline kuzatish va auto-sync ──────────────────────────────────
  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    startAutoSync();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      stopAutoSync();
    };
  }, []);

  // Sync tugaganda: 1) online holatni yangilaymiz 2) temp ID'larni almashtiramiz
  useEffect(() => {
    const unsub = onSyncComplete(({ tempIdMap }) => {
      setOnline(isOnline()); // syncManager ping natijasiga moslaymiz
      if (!tempIdMap || Object.keys(tempIdMap).length === 0) return;
      setRelays((cur) => cur.map((r) => isTempId(r.id) && tempIdMap[r.id] ? { ...r, id: tempIdMap[r.id] } : r));
    });
    return unsub;
  }, []);

  return {
    stations, setStations,
    relays, setRelays,
    loading,
    publicRelay,
    uchastkalar, setUchastkalar,
    mexaniklar, setMexaniklar,
    online,
  };
}
