import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { supabase, toRelay, fromRelay } from './supabase.js';
import { LANGS, createTranslator } from './i18n.js';

function getPublicUrl() {
  try { return localStorage.getItem('rc_public_url') || window.location.origin; } catch { return window.location.origin; }
}

function qrUrl(relay) {
  return `${getPublicUrl()}/relay/${relay.id}`;
}

function getRelayStatusFromDate(dateString) {
  if (!dateString) return 'green';
  const now = new Date();
  const target = new Date(dateString);
  if (Number.isNaN(target.getTime())) return 'green';
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'red';
  if (diffDays <= 30) return 'yellow';
  return 'green';
}

const statusConfig = {
  red: { color: 'red', lightBg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400', bar: 'bg-red-500/20', barFill: 'bg-red-500' },
  yellow: { color: 'yellow', lightBg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400', bar: 'bg-yellow-500/20', barFill: 'bg-yellow-500' },
  green: { color: 'green', lightBg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400', bar: 'bg-emerald-500/20', barFill: 'bg-emerald-500' },
};

const navItems = [
  { id: 'dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'relays', labelKey: 'nav.relays', icon: 'M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z',
    children: [{ id: 'add-relay', labelKey: 'nav.addRelay' }, { id: 'monthly-plan', labelKey: 'nav.monthlyPlan' }] },
  { id: 'stations', labelKey: 'nav.stations', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', adminOnly: true,
    children: [{ id: 'add-station', labelKey: 'nav.addStation' }] },
  { id: 'uchastkalar', labelKey: 'nav.uchastkalar', icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7', adminOnly: true,
    children: [{ id: 'add-uchastka', labelKey: 'nav.addUchastka' }] },
  { id: 'mexaniklar', labelKey: 'nav.mexaniklar', icon: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z', adminOnly: true,
    children: [{ id: 'add-mexanik', labelKey: 'nav.addMexanik' }] },
  { id: 'settings', labelKey: 'nav.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z', adminOnly: true },
];

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, t }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onCancel}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md animate-scale-in glass rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-white/50 mt-2">{message}</p>
        <div className="flex gap-3 mt-5 justify-end">
          <button onClick={onCancel}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/20">
            {t('common.cancel')}
          </button>
          <button onClick={onConfirm}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-400">
            {t('common.delete')}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, gradient, icon, delay }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl ${gradient} p-5 ring-1 ring-white/10 transition-all duration-500 hover:ring-white/20 hover:scale-[1.02] hover:shadow-2xl animate-slide-up`}
      style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-700" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-white/60">{label}</p>
          <span className="text-lg opacity-60">{icon}</span>
        </div>
        <p className="mt-2 text-4xl font-black tracking-tight text-white animate-count-up">{value}</p>
        <div className="mt-3 h-1 w-full rounded-full bg-white/10">
          <div className="h-full rounded-full bg-white/30 transition-all duration-1000" style={{ width: `${Math.min(100, (value / 10) * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}

function ThemeToggle({ theme, onToggle, t, className = '' }) {
  return (
    <button onClick={onToggle} type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white ${className}`}
      title={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}>
      {theme === 'dark' ? (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 1020.354 15.354z" />
        </svg>
      )}
    </button>
  );
}

function LanguageToggle({ lang, onCycle, className = '' }) {
  return (
    <button onClick={onCycle} type="button"
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-[11px] font-bold text-white/70 transition hover:bg-white/20 hover:text-white ${className}`}
      title="Til / Язык / Language">
      {lang.toUpperCase()}
    </button>
  );
}

function MechanicSelect({ mexaniklar, value, onChange, t }) {
  const knownNames = mexaniklar.map((m) => m.name);
  const selected = value
    ? value.split(',').map((s) => s.trim()).filter((s) => knownNames.includes(s))
    : [];
  const toggle = (name) => {
    const next = selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name];
    onChange(next.join(', '));
  };
  if (mexaniklar.length === 0) {
    return <p className="text-xs text-white/30 rounded-xl border border-white/10 bg-white/5 px-4 py-3">{t('mexaniklar.empty')}</p>;
  }
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex flex-wrap gap-2">
        {mexaniklar.map((m) => {
          const isSelected = selected.includes(m.name);
          return (
            <button key={m.id} type="button" onClick={() => toggle(m.name)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                isSelected
                  ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}>
              {m.name}
            </button>
          );
        })}
      </div>
      {value && (
        <button type="button" onClick={() => onChange('')}
          className="mt-2 text-[11px] font-medium text-white/30 transition hover:text-red-400">
          {t('common.clear')}
        </button>
      )}
    </div>
  );
}

export default function RelayDashboard() {
  const [stations, setStations] = useState([]);
  const [relays, setRelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicRelay, setPublicRelay] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRelay, setSelectedRelay] = useState(null);
  const [relayPage, setRelayPage] = useState(1);
  const [relayPageSize, setRelayPageSize] = useState(20);
  const [auth, setAuth] = useState(() => {
    try {
      const saved = localStorage.getItem('rc_auth');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loginStation, setLoginStation] = useState('admin');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [adminFilterStation, setAdminFilterStation] = useState('all');
  const [activeNav, setActiveNav] = useState(() => {
    try { return localStorage.getItem('rc_active_nav') || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [newRelay, setNewRelay] = useState({
    stationId: '', name: '', num: '', stativ: '', lastCheck: '', nextCheck: '', note: '',
  });
  const [newStation, setNewStation] = useState({ name: '', username: '', password: '', uchastkaId: '' });
  const [editingStation, setEditingStation] = useState(null);
  const [deleteStationId, setDeleteStationId] = useState(null);
  const [stationFormError, setStationFormError] = useState('');
  const [uchastkalar, setUchastkalar] = useState([]);
  const [newUchastka, setNewUchastka] = useState({ name: '' });
  const [editingUchastka, setEditingUchastka] = useState(null);
  const [deleteUchastkaId, setDeleteUchastkaId] = useState(null);
  const [uchastkaFormError, setUchastkaFormError] = useState('');
  const [mexaniklar, setMexaniklar] = useState([]);
  const [newMexanik, setNewMexanik] = useState({ name: '' });
  const [editingMexanik, setEditingMexanik] = useState(null);
  const [deleteMexanikId, setDeleteMexanikId] = useState(null);
  const [mexanikFormError, setMexanikFormError] = useState('');
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('rc_theme') || 'dark'; } catch { return 'dark'; }
  });
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('rc_lang') || 'uz'; } catch { return 'uz'; }
  });
  const t = createTranslator(lang);
  const [qrPreviewRelay, setQrPreviewRelay] = useState(null);
  const [viewStation, setViewStation] = useState(null);
  const [viewMexanik, setViewMexanik] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [publicUrl, setPublicUrl] = useState(() => {
    try { return localStorage.getItem('rc_public_url') || ''; } catch { return ''; }
  });
  const [publicUrlInput, setPublicUrlInput] = useState(publicUrl);

  // Public QR sahifa uchun alohida fetch
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

  // Stansiya va relelarni Supabase dan yuklash
  useEffect(() => {
    const isPublicPage = /^\/relay\/\d+$/.test(window.location.pathname);
    if (isPublicPage) { setLoading(false); return; }
    Promise.all([
      supabase.from('stations').select('id,name,username,uchastka_id'),
      supabase.from('relays').select('*'),
      supabase.from('uchastkalar').select('*'),
      supabase.from('mexaniklar').select('*'),
    ]).then(([{ data: stationsData }, { data: relaysData }, { data: uchastkalarData }, { data: mexaniklarData }]) => {
      if (stationsData) {
        setStations(stationsData);
        const firstStation = stationsData.find((s) => s.id !== 'admin');
        if (firstStation) setNewRelay((r) => ({ ...r, stationId: firstStation.id }));
      }
      if (relaysData) setRelays(relaysData.map(toRelay));
      if (uchastkalarData) setUchastkalar(uchastkalarData);
      if (mexaniklarData) setMexaniklar(mexaniklarData);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    try { localStorage.setItem('rc_active_nav', activeNav); } catch {}
  }, [activeNav]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rc_theme', theme); } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((cur) => (cur === 'dark' ? 'light' : 'dark'));

  useEffect(() => {
    try { localStorage.setItem('rc_lang', lang); } catch {}
  }, [lang]);

  const cycleLang = () => setLang((cur) => LANGS[(LANGS.indexOf(cur) + 1) % LANGS.length]);

  useEffect(() => {
    setRelayPage(1);
  }, [searchQuery, filterStatus, adminFilterStation, relayPageSize]);

  useEffect(() => {
    const adminOnlyNav = ['stations', 'settings', 'add-relay', 'add-station', 'uchastkalar', 'add-uchastka', 'mexaniklar', 'add-mexanik', 'monthly-plan'];
    if (auth && auth.id !== 'admin' && adminOnlyNav.includes(activeNav)) {
      setActiveNav('dashboard');
    }
  }, [auth]);

  const stationRelays = relays
    .map((r) => ({ ...r, status: getRelayStatusFromDate(r.nextCheck) }))
    .filter((relay) =>
      auth?.id === 'admin'
        ? adminFilterStation === 'all' ? true : relay.stationId === adminFilterStation
        : relay.stationId === auth?.id
    );
  const visibleRelays = stationRelays
    .filter((r) => filterStatus === 'all' || r.status === filterStatus)
    .filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.num.includes(searchQuery))
    .sort((a, b) => {
      if (!a.nextCheck) return 1;
      if (!b.nextCheck) return -1;
      return new Date(a.nextCheck) - new Date(b.nextCheck);
    });

  const relayPageCount = Math.max(1, Math.ceil(visibleRelays.length / relayPageSize));
  const pagedRelays = visibleRelays.slice((relayPage - 1) * relayPageSize, relayPage * relayPageSize);

  const stats = {
    total: stationRelays.length,
    expired: stationRelays.filter((r) => r.status === 'red').length,
    warning: stationRelays.filter((r) => r.status === 'yellow').length,
    active: stationRelays.filter((r) => r.status === 'green').length,
  };

  const visibleStations = auth?.id === 'admin'
    ? stations.filter((s) => s.id !== 'admin')
    : stations.filter((s) => s.id === auth?.id);

  const monthlyPlanByStation = stations
    .filter((s) => s.id !== 'admin')
    .map((s) => ({
      station: s,
      relays: relays
        .filter((r) => r.stationId === s.id)
        .map((r) => ({ ...r, status: getRelayStatusFromDate(r.nextCheck) }))
        .filter((r) => r.status === 'yellow')
        .sort((a, b) => new Date(a.nextCheck) - new Date(b.nextCheck)),
    }))
    .filter((g) => g.relays.length > 0);

  const getStationName = (id) => stations.find((s) => s.id === id)?.name || id;
  const getUchastkaName = (id) => uchastkalar.find((u) => u.id === id)?.name || '—';

  const viewStationData = viewStation ? stations.find((s) => s.id === viewStation) : null;
  const viewStationRelays = relays
    .filter((r) => r.stationId === viewStation)
    .map((r) => ({ ...r, status: getRelayStatusFromDate(r.nextCheck) }))
    .sort((a, b) => {
      if (!a.nextCheck) return 1;
      if (!b.nextCheck) return -1;
      return new Date(a.nextCheck) - new Date(b.nextCheck);
    });
  const viewStationStats = {
    total: viewStationRelays.length,
    expired: viewStationRelays.filter((r) => r.status === 'red').length,
    warning: viewStationRelays.filter((r) => r.status === 'yellow').length,
    active: viewStationRelays.filter((r) => r.status === 'green').length,
  };
  const viewStationNameCounts = Object.values(
    viewStationRelays.reduce((acc, r) => {
      const key = r.name || '—';
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  const viewMexanikData = viewMexanik ? mexaniklar.find((m) => m.id === viewMexanik) : null;
  const viewMexanikRelays = viewMexanikData
    ? relays
        .filter((r) => (r.note || '').split(',').map((s) => s.trim()).includes(viewMexanikData.name))
        .map((r) => ({ ...r, status: getRelayStatusFromDate(r.nextCheck) }))
        .sort((a, b) => (b.lastCheck || '').localeCompare(a.lastCheck || ''))
    : [];
  const viewMexanikNameCounts = Object.values(
    viewMexanikRelays.reduce((acc, r) => {
      const key = r.name || '—';
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const viewMexanikMonthCounts = Object.values(
    viewMexanikRelays.reduce((acc, r) => {
      const key = r.lastCheck ? r.lastCheck.slice(0, 7) : '';
      acc[key] = acc[key] || { month: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.month.localeCompare(a.month));
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const viewMexanikThisMonth = viewMexanikMonthCounts.find((m) => m.month === thisMonthKey)?.count || 0;

  const printQRCode = async (relay) => {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrUrl(relay), {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
    const link = document.createElement('a');
    link.download = `QR-${relay.num}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    const { data, error } = await supabase.rpc('verify_station_login', {
      p_id: loginStation,
      p_username: loginUsername,
      p_password: loginPassword,
    });
    const station = data?.[0];
    if (error || !station) {
      setLoginError(t('login.error'));
      return;
    }
    setAuth(station);
    try { localStorage.setItem('rc_auth', JSON.stringify({ id: station.id, name: station.name })); } catch {}
    setLoginError('');
    setSearchQuery('');
    setFilterStatus('all');
    setSelectedRelay(null);
    setActiveNav('dashboard');
  };

  const handleLogout = () => {
    setAuth(null);
    setActiveNav('dashboard');
    try {
      localStorage.removeItem('rc_auth');
      localStorage.removeItem('rc_active_nav');
    } catch {}
    setSelectedRelay(null);
    setViewStation(null);
    setViewMexanik(null);
    setLoginPassword('');
    setLoginUsername('');
    setLoginError('');
  };

  const handleSaveEdit = async () => {
    await supabase.from('relays').update(fromRelay(selectedRelay)).eq('id', selectedRelay.id);
    setRelays(relays.map((r) => r.id === selectedRelay.id ? { ...selectedRelay } : r));
    setSelectedRelay(null);
  };

  const handleAddRelay = async () => {
    const { data } = await supabase.from('relays').insert(fromRelay(newRelay)).select().single();
    if (data) {
      const added = toRelay(data);
      setRelays([...relays, added]);
      setQrPreviewRelay(added);
    }
    setNewRelay({ stationId: newRelay.stationId, name: '', num: '', stativ: '', lastCheck: '', nextCheck: '', note: '' });
  };

  const handleAddStation = async () => {
    setStationFormError('');
    if (!newStation.name.trim() || !newStation.username.trim() || !newStation.password.trim()) return;
    const newId = newStation.username.trim().toLowerCase().replace(/\s+/g, '-');
    if (stations.some((s) => s.id === newId)) {
      setStationFormError(t('errors.usernameTaken', newStation.username));
      return;
    }
    const row = { id: newId, name: newStation.name, username: newStation.username, uchastka_id: newStation.uchastkaId || null };
    const { error } = await supabase.from('stations').insert(row);
    if (error) { setStationFormError(error.message); return; }
    const { error: pwError } = await supabase.rpc('set_station_password', { p_id: newId, p_password: newStation.password });
    if (pwError) { setStationFormError(pwError.message); return; }
    setStations([...stations, row]);
    setNewStation({ name: '', username: '', password: '', uchastkaId: '' });
  };

  const handleUpdateStation = async () => {
    if (!editingStation) return;
    setStationFormError('');
    const oldId = editingStation._originalId;
    const newId = editingStation.username.trim().toLowerCase().replace(/\s+/g, '-');
    if (newId !== oldId && stations.some((s) => s.id === newId)) {
      setStationFormError(t('errors.usernameTaken', editingStation.username));
      return;
    }
    const row = { id: newId, name: editingStation.name, username: editingStation.username, uchastka_id: editingStation.uchastka_id || null };
    if (oldId !== newId) {
      // Login o'zgarsa ID ham o'zgaradi — parol hash'i va relelarni yangi ID'ga
      // xavfsiz ko'chirish uchun server-tomon funksiyani chaqiramiz.
      const { error: renameError } = await supabase.rpc('rename_station', {
        p_old_id: oldId, p_new_id: newId, p_name: row.name, p_username: row.username, p_uchastka_id: row.uchastka_id,
      });
      if (renameError) { setStationFormError(renameError.message); return; }
      setRelays(relays.map((r) => r.stationId === oldId ? { ...r, stationId: newId } : r));
    } else {
      const { error } = await supabase.from('stations')
        .update({ name: row.name, username: row.username, uchastka_id: row.uchastka_id })
        .eq('id', oldId);
      if (error) { setStationFormError(error.message); return; }
    }
    if (editingStation.password.trim()) {
      const { error: pwError } = await supabase.rpc('set_station_password', { p_id: newId, p_password: editingStation.password.trim() });
      if (pwError) { setStationFormError(pwError.message); return; }
    }
    setStations(stations.map((s) => s.id === oldId ? row : s));
    setEditingStation(null);
  };

  const handleDeleteRelay = async (id) => {
    await supabase.from('relays').delete().eq('id', id);
    setRelays(relays.filter((r) => r.id !== id));
  };

  const handleDeleteStation = async () => {
    if (!deleteStationId) return;
    await supabase.from('relays').delete().eq('station_id', deleteStationId);
    await supabase.from('stations').delete().eq('id', deleteStationId);
    setStations(stations.filter((s) => s.id !== deleteStationId));
    setRelays(relays.filter((r) => r.stationId !== deleteStationId));
    setDeleteStationId(null);
  };

  const handleAddUchastka = async () => {
    setUchastkaFormError('');
    if (!newUchastka.name.trim()) return;
    const newId = newUchastka.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (uchastkalar.some((u) => u.id === newId)) {
      setUchastkaFormError(t('errors.uchastkaExists', newUchastka.name));
      return;
    }
    const row = { id: newId, name: newUchastka.name };
    const { error } = await supabase.from('uchastkalar').insert(row);
    if (error) { setUchastkaFormError(error.message); return; }
    setUchastkalar([...uchastkalar, row]);
    setNewUchastka({ name: '' });
  };

  const handleUpdateUchastka = async () => {
    if (!editingUchastka) return;
    const row = { id: editingUchastka.id, name: editingUchastka.name };
    const { error } = await supabase.from('uchastkalar').update(row).eq('id', row.id);
    if (error) return;
    setUchastkalar(uchastkalar.map((u) => u.id === row.id ? row : u));
    setEditingUchastka(null);
  };

  const handleDeleteUchastka = async () => {
    if (!deleteUchastkaId) return;
    await supabase.from('stations').update({ uchastka_id: null }).eq('uchastka_id', deleteUchastkaId);
    await supabase.from('uchastkalar').delete().eq('id', deleteUchastkaId);
    setStations(stations.map((s) => s.uchastka_id === deleteUchastkaId ? { ...s, uchastka_id: null } : s));
    setUchastkalar(uchastkalar.filter((u) => u.id !== deleteUchastkaId));
    setDeleteUchastkaId(null);
  };

  const handleAddMexanik = async () => {
    setMexanikFormError('');
    if (!newMexanik.name.trim()) return;
    const newId = newMexanik.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (mexaniklar.some((m) => m.id === newId)) {
      setMexanikFormError(t('errors.mexanikExists', newMexanik.name));
      return;
    }
    const row = { id: newId, name: newMexanik.name };
    const { error } = await supabase.from('mexaniklar').insert(row);
    if (error) { setMexanikFormError(error.message); return; }
    setMexaniklar([...mexaniklar, row]);
    setNewMexanik({ name: '' });
  };

  const handleUpdateMexanik = async () => {
    if (!editingMexanik) return;
    const row = { id: editingMexanik.id, name: editingMexanik.name };
    const { error } = await supabase.from('mexaniklar').update(row).eq('id', row.id);
    if (error) return;
    setMexaniklar(mexaniklar.map((m) => m.id === row.id ? row : m));
    setEditingMexanik(null);
  };

  const handleDeleteMexanik = async () => {
    if (!deleteMexanikId) return;
    await supabase.from('mexaniklar').delete().eq('id', deleteMexanikId);
    setMexaniklar(mexaniklar.filter((m) => m.id !== deleteMexanikId));
    setDeleteMexanikId(null);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Rele-Control — ${auth?.id === 'admin' ? 'ADMIN hisobot' : auth?.name || 'Hisobot'}`, 14, 16);
    doc.setFontSize(10);
    let y = 30;
    stationRelays.forEach((r, i) => {
      doc.text(`${i + 1}. ${r.name} (${r.num}) | ${r.nextCheck} [${r.status.toUpperCase()}]`, 14, y);
      y += 8;
    });
    doc.save('rele-hisobot.pdf');
  };

  const exportMonthlyPlanPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Oylik tekshiruv rejasi (muddati yaqin relelar)", 14, 16);
    doc.setFontSize(10);
    let y = 30;
    monthlyPlanByStation.forEach((group) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont(undefined, 'bold');
      doc.text(`${group.station.name} (${group.relays.length} ta)`, 14, y);
      y += 7;
      doc.setFont(undefined, 'normal');
      group.relays.forEach((r, i) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(`  ${i + 1}. ${r.name} (${r.num}) — ${r.nextCheck}`, 14, y);
        y += 7;
      });
      y += 4;
    });
    doc.save('oylik-reja.pdf');
  };

  const filteredNav = navItems.filter((item) => (item.adminOnly ? auth?.id === 'admin' : true));

  const bgClass = 'bg-slate-950 text-slate-100';

  if (loading && !/^\/relay\/\d+$/.test(window.location.pathname)) {
    return (
      <div className={`${bgClass} min-h-screen flex items-center justify-center`}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full border-2 border-amber-500/20 border-t-amber-500 animate-spin" />
          <p className="text-sm text-white/40">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (publicRelay) {
    const sc = statusConfig[publicRelay.status];
    const sName = publicRelay.stationName || getStationName(publicRelay.stationId);
    return (
      <div className={`${bgClass} min-h-screen font-sans flex items-center justify-center p-4`}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        </div>
        <div className="fixed top-4 right-4 z-10">
          <LanguageToggle lang={lang} onCycle={cycleLang} />
        </div>
        <div className="relative w-full max-w-md animate-slide-up">
          <div className="glass rounded-2xl p-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20 mb-4">
              RELE CONTROL
            </div>
            <div className={`absolute top-0 left-0 h-1.5 w-full rounded-t-2xl ${sc.bar}`}>
              <div className={`h-full rounded-t-2xl ${sc.barFill}`} style={{ width: publicRelay.status === 'green' ? '25%' : publicRelay.status === 'yellow' ? '60%' : '100%' }} />
            </div>
            <div className="flex items-center justify-center gap-2 mt-2 mb-3">
              <span className={`flex h-3 w-3 rounded-full ${sc.dot} ${publicRelay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
              <span className={`px-3 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                {t(`status.${publicRelay.status}`)}
              </span>
            </div>
            <h2 className="text-2xl font-black text-white">{publicRelay.name}</h2>
            <p className="text-sm font-mono text-white/40 mt-1">№ {publicRelay.num}</p>
            <div className="my-5 flex justify-center">
              <div className="bg-white rounded-xl p-3">
                <QRCodeSVG value={qrUrl(publicRelay)} size={140} level="H" />
              </div>
            </div>
            <div className="space-y-2 text-sm text-left bg-white/5 rounded-xl p-4">
              <div className="flex justify-between"><span className="text-white/40">{t('common.station')}</span><span className="text-white font-medium">{sName}</span></div>
              {publicRelay.stativ && <div className="flex justify-between"><span className="text-white/40">{t('table.stativ')}</span><span className="text-white font-medium">{publicRelay.stativ}</span></div>}
              {publicRelay.lastCheck && <div className="flex justify-between"><span className="text-white/40">{t('field.lastCheck')}</span><span className="text-white font-medium">{publicRelay.lastCheck}</span></div>}
              <div className="flex justify-between"><span className="text-white/40">{t('public.check')}</span><span className="text-white font-medium">{publicRelay.nextCheck}</span></div>
              {publicRelay.note && <div className="flex justify-between"><span className="text-white/40">{t('public.checkedBy')}</span><span className="text-white/50 text-xs italic">{publicRelay.note}</span></div>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!auth) {
    return (
      <div className={`${bgClass} min-h-screen font-sans transition-colors duration-300 relative overflow-hidden`}>
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
        </div>
        <div className="fixed top-4 right-4 z-10 flex gap-2">
          <LanguageToggle lang={lang} onCycle={cycleLang} />
          <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} />
        </div>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-5xl animate-fade-in">
            <div className="grid gap-8 lg:grid-cols-5">
              <div className="lg:col-span-3 hidden lg:flex flex-col justify-center space-y-6">
                <div className="inline-flex w-fit rounded-full bg-amber-500/10 px-4 py-1.5 text-xs font-semibold text-amber-400 ring-1 ring-amber-500/20">
                  {t('login.badge')}
                </div>
                <h2 className="text-5xl font-black leading-tight text-white">
                  {t('login.heroLine1')}
                  <span className="text-gradient block mt-1">{t('login.heroLine2')}</span>
                  {t('login.heroLine3')}
                </h2>
                <p className="max-w-md text-base leading-relaxed text-white/50">
                  {t('login.heroDesc')}
                </p>
                <div className="flex gap-4">
                  <div className="rounded-2xl glass-light p-4">
                    <p className="text-2xl font-black text-white">{relays.length}</p>
                    <p className="text-xs text-white/40">{t('login.statTotalRelay')}</p>
                  </div>
                  <div className="rounded-2xl glass-light p-4">
                    <p className="text-2xl font-black text-white">{stations.length - 1}</p>
                    <p className="text-xs text-white/40">{t('login.statStations')}</p>
                  </div>
                  <div className="rounded-2xl glass-light p-4">
                    <p className="text-2xl font-black text-white">100%</p>
                    <p className="text-xs text-white/40">{t('login.statSecurity')}</p>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="glass rounded-2xl p-6 animate-slide-up">
                  <h3 className="text-xl font-bold text-white mb-1">{t('login.title')}</h3>
                  <p className="text-sm text-white/40 mb-6">{t('login.subtitle')}</p>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{t('common.station')}</label>
                      <select value={loginStation} onChange={(e) => setLoginStation(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-black outline-none transition focus:border-amber-500/50 focus:bg-white/10">
                        {stations.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{t('login.username')}</label>
                      <input type="text" value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{t('login.password')}</label>
                      <div className="relative">
                        <input type={showLoginPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10" />
                        <button type="button" onClick={() => setShowLoginPassword((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition">
                          {showLoginPassword ? (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                    {loginError && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{loginError}</div>
                    )}
                    <button type="submit"
                      className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
                      {t('login.submit')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${bgClass} min-h-screen font-sans transition-colors duration-300`}>
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center gap-3 px-4 glass border-b border-white/5">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
          <span className="text-sm font-black text-slate-950">R</span>
        </div>
        <span className="text-sm font-bold tracking-widest text-white flex-1">RELE CONTROL</span>
        <LanguageToggle lang={lang} onCycle={cycleLang} />
        <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="relative flex min-h-screen">
        <aside className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col glass border-r border-white/5 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex items-center gap-3 border-b border-white/5 px-5 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/20">
              <span className="text-lg font-black text-slate-950">R</span>
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-widest text-white">RELE CONTROL</h1>
              <p className="text-[9px] tracking-[0.2em] text-white/30 uppercase">{t('app.tagline')}</p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
            {filteredNav.map((item) => {
              const isExpanded = item.children && (activeNav === item.id || item.children.some((c) => c.id === activeNav));
              return (
                <div key={item.id}>
                  <button onClick={() => { setActiveNav(item.id); setSidebarOpen(false); setViewStation(null); setViewMexanik(null); }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                      activeNav === item.id
                        ? 'bg-amber-500/15 text-amber-400 shadow-sm'
                        : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                    }`}>
                    <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                    {t(item.labelKey)}
                    {item.children && (
                      <svg className={`ml-auto h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </button>
                  {isExpanded && item.children && auth?.id === 'admin' && (
                    <div className="ml-3 mt-1 space-y-0.5 border-l border-white/5 pl-2">
                      {item.children.map((child) => (
                        <button key={child.id} onClick={() => { setActiveNav(child.id); setSidebarOpen(false); setViewStation(null); setViewMexanik(null); }}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                            activeNav === child.id
                              ? 'bg-amber-500/10 text-amber-400'
                              : 'text-white/40 hover:bg-white/5 hover:text-white/70'
                          }`}>
                          {t(child.labelKey)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-white/5 p-4 space-y-3">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-400 text-xs font-bold">
                {auth.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-white truncate">{auth.name}</p>
                <p className="text-[10px] text-white/30 truncate">{auth.id === 'admin' ? t('user.admin') : t('user.stationUser')}</p>
              </div>
              <LanguageToggle lang={lang} onCycle={cycleLang} className="h-8 w-8 flex-shrink-0" />
              <ThemeToggle theme={theme} onToggle={toggleTheme} t={t} className="h-8 w-8 flex-shrink-0" />
            </div>

            <button onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/50 transition hover:bg-red-500/10 hover:text-red-400">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('sidebar.logout')}
            </button>
          </div>
        </aside>

        <main className="lg:ml-64 flex-1 pt-14 px-4 pb-4 lg:pt-6 lg:px-6 lg:pb-6 space-y-6">
          {viewStation ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <button onClick={() => setViewStation(null)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-2xl font-black text-white">{viewStationData?.name}</h2>
                  <p className="text-sm text-white/40 mt-1">{t('stationView.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                <StatCard label={t('stat.total')} value={viewStationStats.total} gradient="bg-gradient-to-br from-white/10 to-white/5" icon="⚡" delay={0} />
                <StatCard label={t('stat.expired')} value={viewStationStats.expired} gradient="bg-gradient-to-br from-red-500/20 to-red-500/5" icon="🔴" delay={100} />
                <StatCard label={t('stat.warning')} value={viewStationStats.warning} gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5" icon="🟡" delay={200} />
                <StatCard label={t('stat.active')} value={viewStationStats.active} gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5" icon="🟢" delay={300} />
              </div>

              {viewStationNameCounts.length > 0 && (
                <div className="glass rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white/80 mb-4">{t('stationView.byName')}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {viewStationNameCounts.map((item) => (
                      <div key={item.name} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                        <span className="text-sm text-white/70 truncate">{item.name}</span>
                        <span className="flex-shrink-0 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewStationRelays.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <div className="text-5xl mb-4 opacity-30">🔍</div>
                  <p className="text-lg font-semibold text-white/60">{t('stationView.empty')}</p>
                </div>
              ) : (
                <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                        <th className="px-4 py-3 font-medium">{t('table.status')}</th>
                        <th className="px-4 py-3 font-medium">{t('table.name')}</th>
                        <th className="px-4 py-3 font-medium">{t('table.stativ')}</th>
                        <th className="px-4 py-3 font-medium">{t('field.lastCheck')}</th>
                        <th className="px-4 py-3 font-medium">{t('table.nextCheck')}</th>
                        {auth?.id === 'admin' && <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {viewStationRelays.map((relay) => {
                        const sc = statusConfig[relay.status];
                        return (
                          <tr key={relay.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                                {t(`status.${relay.status}`)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-semibold text-white" title={relay.note || undefined}>{relay.name}</div>
                              <div className="text-xs font-mono text-white/30">№ {relay.num}</div>
                            </td>
                            <td className="px-4 py-3 text-white/60">{relay.stativ || '—'}</td>
                            <td className="px-4 py-3 text-white/60">{relay.lastCheck || '—'}</td>
                            <td className="px-4 py-3 text-white/60">{relay.nextCheck}</td>
                            {auth?.id === 'admin' && (
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setSelectedRelay({ ...relay })}
                                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                                    {t('common.edit')}
                                  </button>
                                  <button onClick={() => printQRCode(relay)}
                                    className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                                    {t('common.qr')}
                                  </button>
                                  <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                                    className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                    {t('common.delete')}
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="md:hidden grid grid-cols-1 gap-4">
                {viewStationRelays.map((relay, idx) => {
                  const sc = statusConfig[relay.status];
                  return (
                    <div key={relay.id}
                      className="group relative overflow-hidden rounded-2xl glass hover:bg-white/[0.08] transition-all duration-500 animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className={`absolute top-0 left-0 h-1 w-full ${sc.bar}`}>
                        <div className={`h-full ${sc.barFill}`} style={{ width: relay.status === 'green' ? '25%' : relay.status === 'yellow' ? '60%' : '100%' }} />
                      </div>
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`flex h-2.5 w-2.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                            {t(`status.${relay.status}`)}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{relay.name}</h3>
                        <p className="text-xs font-mono text-white/30 mb-3">№ {relay.num}</p>
                        <div className="space-y-1.5 text-sm text-white/50">
                          {relay.stativ && <div>{t('table.stativ')}: {relay.stativ}</div>}
                          {relay.lastCheck && <div>{t('field.lastCheck')}: {relay.lastCheck}</div>}
                          <div>{relay.nextCheck}</div>
                        </div>
                        {auth?.id === 'admin' && (
                          <div className="mt-4 flex gap-2 pt-4 border-t border-white/5">
                            <button onClick={() => setSelectedRelay({ ...relay })}
                              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                              {t('common.edit')}
                            </button>
                            <button onClick={() => printQRCode(relay)}
                              className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                              {t('common.qr')}
                            </button>
                            <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                              className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                              {t('common.delete')}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : viewMexanik ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center gap-3">
                <button onClick={() => setViewMexanik(null)}
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-white/10 text-white/70 transition hover:bg-white/20 hover:text-white">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h2 className="text-2xl font-black text-white">{viewMexanikData?.name}</h2>
                  <p className="text-sm text-white/40 mt-1">{t('mexanikView.subtitle')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <StatCard label={t('mexanikView.totalChecked')} value={viewMexanikRelays.length} gradient="bg-gradient-to-br from-white/10 to-white/5" icon="⚡" delay={0} />
                <StatCard label={t('mexanikView.thisMonth')} value={viewMexanikThisMonth} gradient="bg-gradient-to-br from-amber-500/20 to-amber-500/5" icon="📅" delay={100} />
              </div>

              {viewMexanikRelays.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <div className="text-5xl mb-4 opacity-30">🔍</div>
                  <p className="text-lg font-semibold text-white/60">{t('mexanikView.empty')}</p>
                </div>
              ) : (
                <>
                  <div className="glass rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white/80 mb-4">{t('mexanikView.byName')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {viewMexanikNameCounts.map((item) => (
                        <div key={item.name} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                          <span className="text-sm text-white/70 truncate">{item.name}</span>
                          <span className="flex-shrink-0 rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-xs font-bold text-amber-400">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="glass rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-white/80 mb-4">{t('mexanikView.byMonth')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {viewMexanikMonthCounts.map((item) => (
                        <div key={item.month || 'unknown'} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-3 py-2">
                          <span className="text-sm text-white/70 truncate">{item.month || t('mexanikView.unknownMonth')}</span>
                          <span className="flex-shrink-0 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-xs font-bold text-emerald-400">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
          <>
          {activeNav === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">{t('nav.dashboard')}</h2>
                <p className="text-sm text-white/40 mt-1">{t('dashboard.subtitle')}</p>
              </div>
              {stats.expired > 0 && (
                <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 sm:p-5 animate-fade-in">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-red-500/20 text-lg animate-pulse-soft">⚠️</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-red-400">{t('dashboard.alertExpiredCount', stats.expired)}</p>
                    <p className="text-xs text-white/50 mt-0.5 truncate">
                      {stationRelays.filter((r) => r.status === 'red').slice(0, 3).map((r) => r.name).join(', ')}
                      {stats.expired > 3 ? t('dashboard.alertMore', stats.expired - 3) : ''} {t('dashboard.alertAction')}
                    </p>
                    <button onClick={() => { setActiveNav('relays'); setFilterStatus('red'); }}
                      className="mt-3 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30">
                      {t('dashboard.viewBtn')}
                    </button>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
                <StatCard label={t('stat.total')} value={stats.total} gradient="bg-gradient-to-br from-white/10 to-white/5" icon="⚡" delay={0} />
                <StatCard label={t('stat.expired')} value={stats.expired} gradient="bg-gradient-to-br from-red-500/20 to-red-500/5" icon="🔴" delay={100} />
                <StatCard label={t('stat.warning')} value={stats.warning} gradient="bg-gradient-to-br from-yellow-500/20 to-yellow-500/5" icon="🟡" delay={200} />
                <StatCard label={t('stat.active')} value={stats.active} gradient="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5" icon="🟢" delay={300} />
              </div>
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white/80 mb-4">{t('dashboard.byStation')}</h3>
                <div className="space-y-3">
                  {visibleStations.map((s) => {
                    const count = relays.filter((r) => r.stationId === s.id).length;
                    const expired = relays.filter((r) => r.stationId === s.id && getRelayStatusFromDate(r.nextCheck) === 'red').length;
                    return (
                      <button key={s.id} type="button" onClick={() => setViewStation(s.id)}
                        className="flex w-full items-center gap-4 rounded-xl bg-white/5 px-4 py-3 text-left transition hover:bg-white/10">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 text-xs font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{s.name}</p>
                          <p className="text-xs text-white/40">{t('common.relayCountShort', count)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-white">{count}</p>
                          <p className={`text-xs ${expired > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                            {expired > 0 ? t('dashboard.expiredShort', expired) : t('dashboard.allGood')}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeNav === 'stations' && auth?.id === 'admin' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">{t('nav.stations')}</h2>
                <p className="text-sm text-white/40 mt-1">{t('station.subtitle')}</p>
              </div>
              <div className="space-y-3">
                {stations.filter((s) => s.id !== 'admin').map((s) => {
                  const count = relays.filter((r) => r.stationId === s.id).length;
                  return (
                    <div key={s.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 text-amber-400 font-bold">
                        {s.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{s.name}</p>
                        <p className="text-xs text-white/40">{t('station.loginLabel')} <span className="font-mono text-white/50">{s.username}</span> &middot; {t('common.relayCountShort', count)} &middot; {t('station.uchastkaLabel')} {getUchastkaName(s.uchastka_id)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditingStation({ _originalId: s.id, name: s.name, username: s.username, password: '', uchastka_id: s.uchastka_id || '' })}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                          {t('common.edit')}
                        </button>
                        <button onClick={() => setDeleteStationId(s.id)}
                          className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                          {t('common.delete')}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeNav === 'relays' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">{t('nav.relays')}</h2>
                  <p className="text-sm text-white/40 mt-1">{t('relays.foundCount', visibleRelays.length)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={exportToPDF}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
                    {t('common.pdfExport')}
                  </button>

                </div>
              </div>

              <div className="glass rounded-2xl p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input type="text" value={searchQuery} placeholder={t('relays.searchPlaceholder')} className="w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10"
                      onChange={(e) => setSearchQuery(e.target.value)} />
                  </div>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50">
                    <option value="all" className="bg-neutral-900 text-white">{t('filter.allStatus')}</option>
                    <option value="red" className="bg-neutral-900 text-white">{t('status.red')}</option>
                    <option value="yellow" className="bg-neutral-900 text-white">{t('status.yellow')}</option>
                    <option value="green" className="bg-neutral-900 text-white">{t('status.green')}</option>
                  </select>
                  {auth?.id === 'admin' && (
                    <select value={adminFilterStation} onChange={(e) => setAdminFilterStation(e.target.value)}
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-500/50">
                      <option value="all" className="bg-neutral-900 text-white">{t('filter.allStations')}</option>
                      {stations.filter((s) => s.id !== 'admin').map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.name}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      <th className="px-4 py-3 font-medium">{t('table.status')}</th>
                      <th className="px-4 py-3 font-medium">{t('table.name')}</th>
                      <th className="px-4 py-3 font-medium">{t('common.station')}</th>
                      <th className="px-4 py-3 font-medium">{t('table.stativ')}</th>
                      <th className="px-4 py-3 font-medium">{t('field.lastCheck')}</th>
                      <th className="px-4 py-3 font-medium">{t('table.nextCheck')}</th>
                      {auth?.id === 'admin' && <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRelays.map((relay) => {
                      const sc = statusConfig[relay.status];
                      return (
                        <tr key={relay.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                              {t(`status.${relay.status}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-white" title={relay.note || undefined}>{relay.name}</div>
                            <div className="text-xs font-mono text-white/30">№ {relay.num}</div>
                          </td>
                          <td className="px-4 py-3 text-white/60">{getStationName(relay.stationId)}</td>
                          <td className="px-4 py-3 text-white/60">{relay.stativ || '—'}</td>
                          <td className="px-4 py-3 text-white/60">{relay.lastCheck || '—'}</td>
                          <td className="px-4 py-3 text-white/60">{relay.nextCheck}</td>
                          {auth?.id === 'admin' && (
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setSelectedRelay({ ...relay })}
                                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                                  {t('common.edit')}
                                </button>
                                <button onClick={() => printQRCode(relay)}
                                  className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                                  {t('common.qr')}
                                </button>
                                <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                  {t('common.delete')}
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="md:hidden grid grid-cols-1 gap-4">
                {pagedRelays.map((relay, idx) => {
                  const sc = statusConfig[relay.status];
                  return (
                    <div key={relay.id}
                      className="group relative overflow-hidden rounded-2xl glass hover:bg-white/[0.08] transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl animate-slide-up"
                      style={{ animationDelay: `${idx * 80}ms` }}>
                      <div className={`absolute top-0 left-0 h-1 w-full ${sc.bar}`}>
                        <div className={`h-full ${sc.barFill} transition-all duration-700`} style={{ width: relay.status === 'green' ? '25%' : relay.status === 'yellow' ? '60%' : '100%' }} />
                      </div>
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className={`flex h-2.5 w-2.5 rounded-full ${sc.dot} ${relay.status === 'red' ? 'animate-pulse-soft' : ''}`} />
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${sc.lightBg} ${sc.text} ${sc.border} border`}>
                              {t(`status.${relay.status}`)}
                            </span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{relay.name}</h3>
                        <p className="text-xs font-mono text-white/30 mb-3">№ {relay.num}</p>
                        <div className="text-xs text-white/40 mb-3">{getStationName(relay.stationId)}</div>
                        <div className="space-y-1.5 text-sm">
                          {relay.stativ && (
                            <div className="flex items-center gap-2 text-white/50">
                              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" /></svg>
                              <span className="text-white/70">{t('table.stativ')}: {relay.stativ}</span>
                            </div>
                          )}
                          {relay.lastCheck && (
                            <div className="flex items-center gap-2 text-white/50">
                              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="text-white/70">{t('field.lastCheck')}: {relay.lastCheck}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-white/50">
                            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            <span className="text-white/70">{relay.nextCheck}</span>
                          </div>
                          {relay.note && (
                            <div className="flex items-center gap-2 text-white/50">
                              <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                              <span className="text-white/50 italic text-xs">{relay.note}</span>
                            </div>
                          )}
                        </div>
                        {auth?.id === 'admin' && (
                          <div className="mt-4 flex items-center justify-between pt-4 border-t border-white/5">
                            <div className="flex gap-2">
                              <button onClick={() => setSelectedRelay({ ...relay })}
                                className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                                {t('common.edit')}
                              </button>
                              <button onClick={() => printQRCode(relay)}
                                className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-medium text-amber-400 transition hover:bg-amber-500/20">
                                {t('common.qrDownload')}
                              </button>
                              <button onClick={() => { if (confirm(t('relays.deleteConfirm', relay.name, relay.num))) handleDeleteRelay(relay.id); }}
                                className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                {t('common.delete')}
                              </button>
                            </div>
                            <div id={`qr-${relay.id}`} className="bg-white rounded-lg p-1.5 transition-transform group-hover:scale-110">
                              <QRCodeSVG value={qrUrl(relay)} size={44} level="H" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {visibleRelays.length === 0 && (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <div className="text-5xl mb-4 opacity-30">🔍</div>
                  <p className="text-lg font-semibold text-white/60">{t('relays.empty')}</p>
                  <p className="text-sm text-white/30 mt-1">{t('relays.emptyHint')}</p>
                </div>
              )}

              {visibleRelays.length > 0 && (
                <div className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span>
                      {visibleRelays.length === 0 ? 0 : (relayPage - 1) * relayPageSize + 1}
                      {'–'}
                      {Math.min(relayPage * relayPageSize, visibleRelays.length)} / {visibleRelays.length}
                    </span>
                    <select value={relayPageSize} onChange={(e) => setRelayPageSize(Number(e.target.value))}
                      className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-white outline-none transition focus:border-amber-500/50">
                      {[10, 20, 50, 100].map((n) => <option key={n} value={n} className="bg-neutral-900 text-white">{t('pagination.perPage', n)}</option>)}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRelayPage((p) => Math.max(1, p - 1))} disabled={relayPage <= 1}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                      {t('pagination.prev')}
                    </button>
                    <span className="text-xs text-white/50">{relayPage} / {relayPageCount}</span>
                    <button onClick={() => setRelayPage((p) => Math.min(relayPageCount, p + 1))} disabled={relayPage >= relayPageCount}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed">
                      {t('pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeNav === 'add-relay' && auth?.id === 'admin' && (
            <div className="glass rounded-2xl p-6 animate-slide-up max-w-3xl">
              <h2 className="text-lg font-bold text-white">{t('addRelay.title')}</h2>
              <p className="text-sm text-white/40 mb-5">{t('addRelay.subtitle')}</p>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('common.station')}</label>
                  <select value={newRelay.stationId} onChange={(e) => setNewRelay({ ...newRelay, stationId: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50">
                    {stations.filter((s) => s.id !== 'admin').map((s) => <option key={s.id} value={s.id} className="bg-neutral-900 text-white">{s.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.relayName')}</label>
                  <input value={newRelay.name} onChange={(e) => setNewRelay({ ...newRelay, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.factoryNum')}</label>
                  <input value={newRelay.num} onChange={(e) => setNewRelay({ ...newRelay, num: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.stativNum')}</label>
                  <input value={newRelay.stativ} onChange={(e) => setNewRelay({ ...newRelay, stativ: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.lastCheck')}</label>
                  <input type="date" value={newRelay.lastCheck} onChange={(e) => setNewRelay({ ...newRelay, lastCheck: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.nextCheck')}</label>
                  <input type="date" value={newRelay.nextCheck} onChange={(e) => setNewRelay({ ...newRelay, nextCheck: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <label className="text-xs font-medium text-white/60">{t('field.checkedBy')}</label>
                <MechanicSelect mexaniklar={mexaniklar} value={newRelay.note} onChange={(v) => setNewRelay({ ...newRelay, note: v })} t={t} />
              </div>
              <div className="mt-5 flex gap-3">
                <button onClick={handleAddRelay}
                  className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
                  {t('addRelay.submit')}
                </button>
                <button onClick={() => setActiveNav('relays')}
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {activeNav === 'monthly-plan' && auth?.id === 'admin' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black text-white">{t('nav.monthlyPlan')}</h2>
                  <p className="text-sm text-white/40 mt-1">{t('monthlyPlan.subtitle')}</p>
                </div>
                {monthlyPlanByStation.length > 0 && (
                  <button onClick={exportMonthlyPlanPDF}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
                    {t('common.pdfExport')}
                  </button>
                )}
              </div>

              {monthlyPlanByStation.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <div className="text-5xl mb-4 opacity-30">✅</div>
                  <p className="text-lg font-semibold text-white/60">{t('monthlyPlan.empty')}</p>
                </div>
              ) : (
                monthlyPlanByStation.map((group) => (
                  <div key={group.station.id} className="glass rounded-2xl p-5 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-white/80">{group.station.name}</h3>
                      <span className="rounded-md bg-yellow-500/10 border border-yellow-500/30 px-2 py-0.5 text-xs font-bold text-yellow-400">
                        {t('monthlyPlan.countShort', group.relays.length)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {group.relays.map((relay) => (
                        <div key={relay.id} className="flex items-center gap-3 rounded-xl bg-white/5 px-3 py-2.5">
                          <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-yellow-400" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">{relay.name}</p>
                            <p className="text-[10px] font-mono text-white/30">№ {relay.num}{relay.stativ ? ` · ${t('table.stativ')}: ${relay.stativ}` : ''}</p>
                          </div>
                          <p className="text-xs text-white/40 flex-shrink-0">{relay.nextCheck}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeNav === 'add-station' && auth?.id === 'admin' && (
            <div className="glass rounded-2xl p-6 animate-slide-up max-w-2xl">
              <h2 className="text-lg font-bold text-white">{t('addStation.title')}</h2>
              <p className="text-sm text-white/40 mb-5">{t('addStation.subtitle')}</p>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.stationName')}</label>
                  <input value={newStation.name} onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.username')}</label>
                  <input value={newStation.username} onChange={(e) => setNewStation({ ...newStation, username: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.password')}</label>
                  <input type="password" value={newStation.password} onChange={(e) => setNewStation({ ...newStation, password: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60">{t('field.uchastka')}</label>
                  <select value={newStation.uchastkaId} onChange={(e) => setNewStation({ ...newStation, uchastkaId: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50">
                    <option value="" className="bg-neutral-900 text-white">{t('common.notSelected')}</option>
                    {uchastkalar.map((u) => <option key={u.id} value={u.id} className="bg-neutral-900 text-white">{u.name}</option>)}
                  </select>
                </div>
              </div>
              {stationFormError && (
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{stationFormError}</div>
              )}
              <div className="mt-5 flex gap-3">
                <button onClick={handleAddStation}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]">
                  {t('addStation.submit')}
                </button>
                <button onClick={() => { setStationFormError(''); setActiveNav('relays'); }}
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {activeNav === 'uchastkalar' && auth?.id === 'admin' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">{t('nav.uchastkalar')}</h2>
                <p className="text-sm text-white/40 mt-1">{t('uchastkalar.subtitle')}</p>
              </div>

              {uchastkalar.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <p className="text-sm text-white/40">{t('uchastkalar.empty')}</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                          <th className="px-4 py-3 font-medium">{t('table.id')}</th>
                          <th className="px-4 py-3 font-medium">{t('table.uchastka')}</th>
                          <th className="px-4 py-3 font-medium">{t('table.stationCount')}</th>
                          <th className="px-4 py-3 font-medium">{t('table.relayCount')}</th>
                          <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uchastkalar.map((u, idx) => {
                          const stationIds = stations.filter((s) => s.uchastka_id === u.id).map((s) => s.id);
                          const relayCount = relays.filter((r) => stationIds.includes(r.stationId)).length;
                          return (
                            <tr key={u.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                              <td className="px-4 py-3 text-white/60">{idx + 1}</td>
                              <td className="px-4 py-3 font-semibold text-white">{u.name}</td>
                              <td className="px-4 py-3 text-white/60">{stationIds.length}</td>
                              <td className="px-4 py-3 text-white/60">{relayCount}</td>
                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setEditingUchastka({ id: u.id, name: u.name })}
                                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                                    {t('common.edit')}
                                  </button>
                                  <button onClick={() => setDeleteUchastkaId(u.id)}
                                    className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                    {t('common.delete')}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {uchastkalar.map((u) => {
                      const stationIds = stations.filter((s) => s.uchastka_id === u.id).map((s) => s.id);
                      const relayCount = relays.filter((r) => stationIds.includes(r.stationId)).length;
                      return (
                        <div key={u.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-sky-500/20 text-cyan-400 font-bold">
                            {u.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-white">{u.name}</p>
                            <p className="text-xs text-white/40">{t('table.stationCount')}: {stationIds.length} &middot; {t('common.relayCountShort', relayCount)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditingUchastka({ id: u.id, name: u.name })}
                              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                              {t('common.edit')}
                            </button>
                            <button onClick={() => setDeleteUchastkaId(u.id)}
                              className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                              {t('common.delete')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {activeNav === 'add-uchastka' && auth?.id === 'admin' && (
            <div className="glass rounded-2xl p-6 animate-slide-up max-w-md">
              <h2 className="text-lg font-bold text-white">{t('addUchastka.title')}</h2>
              <p className="text-sm text-white/40 mb-5">{t('addUchastka.subtitle')}</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">{t('field.uchastkaName')}</label>
                <input value={newUchastka.name} onChange={(e) => setNewUchastka({ name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
              </div>
              {uchastkaFormError && (
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{uchastkaFormError}</div>
              )}
              <div className="mt-5 flex gap-3">
                <button onClick={handleAddUchastka}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]">
                  {t('addUchastka.submit')}
                </button>
                <button onClick={() => { setUchastkaFormError(''); setActiveNav('uchastkalar'); }}
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {activeNav === 'mexaniklar' && auth?.id === 'admin' && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h2 className="text-2xl font-black text-white">{t('nav.mexaniklar')}</h2>
                <p className="text-sm text-white/40 mt-1">{t('mexaniklar.subtitle')}</p>
              </div>

              {mexaniklar.length === 0 ? (
                <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                  <p className="text-sm text-white/40">{t('mexaniklar.empty')}</p>
                </div>
              ) : (
                <>
                  <div className="hidden md:block glass rounded-2xl overflow-hidden animate-slide-up">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/10 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                          <th className="px-4 py-3 font-medium">{t('table.id')}</th>
                          <th className="px-4 py-3 font-medium">{t('table.mechanicName')}</th>
                          <th className="px-4 py-3 font-medium text-right">{t('table.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mexaniklar.map((m, idx) => (
                          <tr key={m.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.04] transition">
                            <td className="px-4 py-3 text-white/60">{idx + 1}</td>
                            <td className="px-4 py-3">
                              <button onClick={() => setViewMexanik(m.id)}
                                className="font-semibold text-white hover:text-amber-400 transition">
                                {m.name}
                              </button>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => setEditingMexanik({ id: m.id, name: m.name })}
                                  className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                                  {t('common.edit')}
                                </button>
                                <button onClick={() => setDeleteMexanikId(m.id)}
                                  className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                  {t('common.delete')}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="md:hidden space-y-3">
                    {mexaniklar.map((m) => (
                      <div key={m.id} className="glass rounded-2xl p-4 flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-sky-500/20 text-cyan-400 font-bold">
                          {m.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <button onClick={() => setViewMexanik(m.id)}
                            className="text-sm font-bold text-white hover:text-amber-400 transition">
                            {m.name}
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => setEditingMexanik({ id: m.id, name: m.name })}
                            className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
                            {t('common.edit')}
                          </button>
                          <button onClick={() => setDeleteMexanikId(m.id)}
                            className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                            {t('common.delete')}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeNav === 'add-mexanik' && auth?.id === 'admin' && (
            <div className="glass rounded-2xl p-6 animate-slide-up max-w-md">
              <h2 className="text-lg font-bold text-white">{t('addMexanik.title')}</h2>
              <p className="text-sm text-white/40 mb-5">{t('addMexanik.subtitle')}</p>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-white/60">{t('field.mechanicName')}</label>
                <input value={newMexanik.name} onChange={(e) => setNewMexanik({ name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-500/50" />
              </div>
              {mexanikFormError && (
                <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{mexanikFormError}</div>
              )}
              <div className="mt-5 flex gap-3">
                <button onClick={handleAddMexanik}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-sky-500 px-6 py-3 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-cyan-500/25 active:scale-[0.98]">
                  {t('addMexanik.submit')}
                </button>
                <button onClick={() => { setMexanikFormError(''); setActiveNav('mexaniklar'); }}
                  className="rounded-xl bg-white/10 px-6 py-3 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          )}

          {activeNav === 'settings' && auth?.id === 'admin' && (
            <div className="space-y-4 animate-fade-in max-w-2xl">
              <div>
                <h2 className="text-2xl font-black text-white">{t('nav.settings')}</h2>
                <p className="text-sm text-white/40 mt-1">{t('settings.subtitle')}</p>
              </div>
              <div className="glass rounded-2xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-white mb-1">{t('settings.qrUrlHeading')}</h3>
                  <p className="text-xs text-white/40 mb-4">
                    {t('settings.qrUrlDescPre')} <span className="font-mono text-white/60">{window.location.origin}</span> {t('settings.qrUrlDescPost')}
                  </p>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-white/60">{t('field.siteUrl')}</label>
                    <input
                      value={publicUrlInput}
                      onChange={(e) => setPublicUrlInput(e.target.value)}
                      placeholder={t('settings.urlPlaceholder')}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50 focus:bg-white/10 font-mono"
                    />
                    <p className="text-[11px] text-white/30">{t('settings.wifiHint')}</p>
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => {
                        const url = publicUrlInput.trim().replace(/\/$/, '');
                        localStorage.setItem('rc_public_url', url);
                        setPublicUrl(url);
                        setPublicUrlInput(url);
                      }}
                      className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
                      {t('common.save')}
                    </button>
                    {publicUrl && (
                      <button
                        onClick={() => {
                          localStorage.removeItem('rc_public_url');
                          setPublicUrl('');
                          setPublicUrlInput('');
                        }}
                        className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/50 transition hover:bg-white/20 hover:text-white">
                        {t('common.clear')}
                      </button>
                    )}
                  </div>
                </div>
                {publicUrl && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-400">
                    {t('settings.currentUrl')} <span className="font-mono">{publicUrl}/relay/[id]</span>
                  </div>
                )}
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-xs text-amber-400 space-y-1">
                  <p className="font-semibold">{t('settings.ipHintTitle')}</p>
                  <p>• {t('settings.ipHintWin')}</p>
                  <p>• {t('settings.ipHintNext')} <span className="font-mono">http://192.168.x.x:5173</span></p>
                </div>
              </div>
            </div>
          )}
          </>
          )}
        </main>
      </div>

      <Modal isOpen={!!selectedRelay} onClose={() => setSelectedRelay(null)}>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">{t('editRelay.title')}</h2>
          <p className="text-sm text-white/40 mb-5">{selectedRelay?.name}</p>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.name')}</label>
              <input value={selectedRelay?.name || ''}
                onChange={(e) => setSelectedRelay({ ...selectedRelay, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.factoryNum')}</label>
              <input value={selectedRelay?.num || ''}
                onChange={(e) => setSelectedRelay({ ...selectedRelay, num: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('common.station')}</label>
              <div className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                {getStationName(selectedRelay?.stationId)}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.stativNum')}</label>
              <input value={selectedRelay?.stativ || ''}
                onChange={(e) => setSelectedRelay({ ...selectedRelay, stativ: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.lastCheck')}</label>
              <input type="date" value={selectedRelay?.lastCheck || ''}
                onChange={(e) => setSelectedRelay({ ...selectedRelay, lastCheck: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.nextCheck')}</label>
              <input type="date" value={selectedRelay?.nextCheck || ''}
                onChange={(e) => setSelectedRelay({
                  ...selectedRelay,
                  nextCheck: e.target.value,
                  status: getRelayStatusFromDate(e.target.value),
                })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <label className="text-xs font-medium text-white/60">{t('field.checkedBy')}</label>
            <MechanicSelect mexaniklar={mexaniklar} value={selectedRelay?.note || ''}
              onChange={(v) => setSelectedRelay({ ...selectedRelay, note: v })} t={t} />
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleSaveEdit}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
              {t('common.save')}
            </button>
            <button onClick={() => setSelectedRelay(null)}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!editingStation} onClose={() => setEditingStation(null)}>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">{t('editStation.title')}</h2>
          <p className="text-sm text-white/40 mb-5">{editingStation?.name}</p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.stationName')}</label>
              <input value={editingStation?.name || ''} onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.username')}</label>
              <input value={editingStation?.username || ''} onChange={(e) => setEditingStation({ ...editingStation, username: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
              <p className="text-[10px] text-white/30">{t('editStation.usernameHint')}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('editStation.passwordLabel')}</label>
              <input type="password" value={editingStation?.password || ''} onChange={(e) => setEditingStation({ ...editingStation, password: e.target.value })}
                placeholder={t('editStation.passwordPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
              <p className="text-[10px] text-white/30">{t('editStation.passwordHint')}</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-white/60">{t('field.uchastka')}</label>
              <select value={editingStation?.uchastka_id || ''} onChange={(e) => setEditingStation({ ...editingStation, uchastka_id: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50">
                <option value="" className="bg-neutral-900 text-white">{t('common.notSelected')}</option>
                {uchastkalar.map((u) => <option key={u.id} value={u.id} className="bg-neutral-900 text-white">{u.name}</option>)}
              </select>
            </div>
          </div>
          {stationFormError && (
            <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">{stationFormError}</div>
          )}
          <div className="mt-5 flex gap-3">
            <button onClick={handleUpdateStation}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
              {t('common.save')}
            </button>
            <button onClick={() => { setStationFormError(''); setEditingStation(null); }}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!qrPreviewRelay} onClose={() => setQrPreviewRelay(null)}>
        <div className="glass rounded-2xl p-6 text-center">
          <h2 className="text-lg font-bold text-white mb-1">{t('qrPreview.title')}</h2>
          <p className="text-sm text-white/40 mb-5">{qrPreviewRelay?.name} — {qrPreviewRelay?.num}</p>
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-xl p-3">
              <QRCodeSVG value={qrPreviewRelay ? qrUrl(qrPreviewRelay) : ''} size={160} level="H" />
            </div>
          </div>
          <p className="text-xs text-white/40 mb-1">{t('qrPreview.stationLabel')} {getStationName(qrPreviewRelay?.stationId)}</p>
          <p className="text-xs text-white/30">{t('qrPreview.scanHint1')}</p>
          <p className="text-xs text-white/30 mb-5">{t('qrPreview.scanHint2')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => { printQRCode(qrPreviewRelay); setQrPreviewRelay(null); }}
              className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-5 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20">
              {t('common.qrDownload')}
            </button>

            <button onClick={() => setQrPreviewRelay(null)}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20">
              {t('common.close')}
            </button>
          </div>
        </div>
      </Modal>



      <ConfirmModal
        isOpen={!!deleteStationId}
        title={t('confirmStation.title')}
        message={t('confirmStation.message')}
        onConfirm={handleDeleteStation}
        onCancel={() => setDeleteStationId(null)}
        t={t}
      />

      <Modal isOpen={!!editingUchastka} onClose={() => setEditingUchastka(null)}>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">{t('editUchastka.title')}</h2>
          <div className="space-y-1.5 mt-4">
            <label className="text-xs font-medium text-white/60">{t('field.uchastkaName')}</label>
            <input value={editingUchastka?.name || ''} onChange={(e) => setEditingUchastka({ ...editingUchastka, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleUpdateUchastka}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
              {t('common.save')}
            </button>
            <button onClick={() => setEditingUchastka(null)}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteUchastkaId}
        title={t('confirmUchastka.title')}
        message={t('confirmUchastka.message')}
        onConfirm={handleDeleteUchastka}
        onCancel={() => setDeleteUchastkaId(null)}
        t={t}
      />

      <Modal isOpen={!!editingMexanik} onClose={() => setEditingMexanik(null)}>
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-1">{t('editMexanik.title')}</h2>
          <div className="space-y-1.5 mt-4">
            <label className="text-xs font-medium text-white/60">{t('field.mechanicName')}</label>
            <input value={editingMexanik?.name || ''} onChange={(e) => setEditingMexanik({ ...editingMexanik, name: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-amber-500/50" />
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={handleUpdateMexanik}
              className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-bold text-slate-950 transition-all hover:shadow-lg hover:shadow-amber-500/25 active:scale-[0.98]">
              {t('common.save')}
            </button>
            <button onClick={() => setEditingMexanik(null)}
              className="rounded-xl bg-white/10 px-5 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/20 hover:text-white">
              {t('common.cancel')}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteMexanikId}
        title={t('confirmMexanik.title')}
        message={t('confirmMexanik.message')}
        onConfirm={handleDeleteMexanik}
        onCancel={() => setDeleteMexanikId(null)}
        t={t}
      />
    </div>
  );
}
