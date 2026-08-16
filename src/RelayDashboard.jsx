import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { supabase, toRelay, fromRelay } from './supabase.js';
import { LANGS, createTranslator, formatMonth } from './i18n.js';
import {
  ADMIN_AUTH_EMAIL, getPublicUrl, qrUrl, registerPdfFont, normalizeRelayName,
  getRelayStatusFromDate, statusConfig, csvEscape, parseCSV, downloadTextFile,
  CSV_FIELD_I18N_KEYS, CSV_HEADER_TO_FIELD, navItems, RELAY_DIFF_FIELDS, buildRelayDiff,
  fetchAllRows,
} from './relayHelpers.js';
import { ConfirmModal, AppSidebar, ToastContainer, LanguageToggle, ThemeToggle } from './components';

// Pages
import LoadingScreen from './pages/LoadingScreen.jsx';
import PublicRelayPage from './pages/PublicRelayPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import MexanikPage from './pages/MexanikPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import StationDetailView from './pages/StationDetailView.jsx';
import RelaysPage from './pages/RelaysPage.jsx';
import AddRelayPage from './pages/AddRelayPage.jsx';
import StationsPage from './pages/StationsPage.jsx';
import AddStationPage from './pages/AddStationPage.jsx';
import MonthlyPlanPage from './pages/MonthlyPlanPage.jsx';
import UchastkalarPage from './pages/UchastkalarPage.jsx';
import AddUchastkaPage from './pages/AddUchastkaPage.jsx';
import MexaniklarPage from './pages/MexaniklarPage.jsx';
import AddMexanikPage from './pages/AddMexanikPage.jsx';
import ActivityLogPage from './pages/ActivityLogPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import HelpPage from './pages/HelpPage.jsx';

// Modals
import EditRelayModal from './modals/EditRelayModal.jsx';
import BulkEditModal from './modals/BulkEditModal.jsx';
import ImportModal from './modals/ImportModal.jsx';
import EditStationModal from './modals/EditStationModal.jsx';
import EditUchastkaModal from './modals/EditUchastkaModal.jsx';
import EditMexanikModal from './modals/EditMexanikModal.jsx';
import QrPreviewModal from './modals/QrPreviewModal.jsx';
import GlobalSearchModal from './modals/GlobalSearchModal.jsx';
import { MexanikStatsPanel } from './components';

export default function RelayDashboard() {
  // ── Data ─────────────────────────────────────────────────────────────────
  const [stations, setStations] = useState([]);
  const [relays, setRelays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [publicRelay, setPublicRelay] = useState(null);
  const [uchastkalar, setUchastkalar] = useState([]);
  const [mexaniklar, setMexaniklar] = useState([]);

  // ── Auth ──────────────────────────────────────────────────────────────────
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

  // ── UI ────────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('rc_theme') || 'dark'; } catch { return 'dark'; }
  });
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('rc_lang') || 'uz'; } catch { return 'uz'; }
  });
  const t = createTranslator(lang);
  const [activeNav, setActiveNav] = useState(() => {
    try { return localStorage.getItem('rc_active_nav') || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef({});

  // ── Relay list UI ─────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [adminFilterStation, setAdminFilterStation] = useState('all');
  const [relayPage, setRelayPage] = useState(1);
  const [relayPageSize, setRelayPageSize] = useState(20);
  const [selectedRelayIds, setSelectedRelayIds] = useState([]);

  // ── Editing state ─────────────────────────────────────────────────────────
  const [selectedRelay, setSelectedRelay] = useState(null);
  const [bulkEditOpen, setBulkEditOpen] = useState(false);
  const [bulkEdit, setBulkEdit] = useState({
    applyStation: false, stationId: '',
    applyNextCheck: false, nextCheck: '',
    applyLastCheck: false, lastCheck: '',
    applyStativ: false, stativ: '',
    applyNote: false, note: '',
  });
  const [newRelay, setNewRelay] = useState({
    stationId: '', name: '', num: '', stativ: '', lastCheck: '', nextCheck: '', note: '',
  });
  const [newStation, setNewStation] = useState({ name: '', username: '', password: '', uchastkaId: '' });
  const [editingStation, setEditingStation] = useState(null);
  const [deleteStationId, setDeleteStationId] = useState(null);
  const [stationFormError, setStationFormError] = useState('');
  const [newUchastka, setNewUchastka] = useState({ name: '' });
  const [editingUchastka, setEditingUchastka] = useState(null);
  const [deleteUchastkaId, setDeleteUchastkaId] = useState(null);
  const [uchastkaFormError, setUchastkaFormError] = useState('');
  const [newMexanik, setNewMexanik] = useState({ name: '', username: '', password: '' });
  const [editingMexanik, setEditingMexanik] = useState(null);
  const [deleteMexanikId, setDeleteMexanikId] = useState(null);
  const [mexanikFormError, setMexanikFormError] = useState('');
  const [qrPreviewRelay, setQrPreviewRelay] = useState(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [mexanikSearch, setMexanikSearch] = useState('');
  const [uchastkaSearch, setUchastkaSearch] = useState('');
  const [monthlyPlanSearch, setMonthlyPlanSearch] = useState('');
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // ── Detail views ──────────────────────────────────────────────────────────
  const [viewStation, setViewStation] = useState(null);
  const [viewStationNameFilter, setViewStationNameFilter] = useState(null);
  const [viewMexanik, setViewMexanik] = useState(null);
  const [viewMexanikMonth, setViewMexanikMonth] = useState(null);

  // ── Import ────────────────────────────────────────────────────────────────
  const [importPreview, setImportPreview] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const importFileInputRef = useRef(null);

  // ── Activity log ──────────────────────────────────────────────────────────
  const [activityLog, setActivityLog] = useState([]);
  const [activityLogLoading, setActivityLogLoading] = useState(false);

  // ── Settings ──────────────────────────────────────────────────────────────
  const [publicUrl, setPublicUrl] = useState(() => {
    try { return localStorage.getItem('rc_public_url') || ''; } catch { return ''; }
  });
  const [publicUrlInput, setPublicUrlInput] = useState(publicUrl);

  // ── Effects ───────────────────────────────────────────────────────────────
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

  useEffect(() => {
    const isPublicPage = /^\/relay\/\d+$/.test(window.location.pathname);
    if (isPublicPage) { setLoading(false); return; }
    Promise.all([
      supabase.from('stations').select('id,name,username,uchastka_id'),
      fetchAllRows(supabase, 'relays', '*'),
      supabase.from('uchastkalar').select('*'),
      supabase.from('mexaniklar').select('id,name,username'),
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

  useEffect(() => { setViewStationNameFilter(null); }, [viewStation]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('rc_theme', theme); } catch {}
  }, [theme]);

  useEffect(() => {
    try { localStorage.setItem('rc_lang', lang); } catch {}
  }, [lang]);

  useEffect(() => {
    if (auth?.id !== 'admin') return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        setAuth(null);
        try { localStorage.removeItem('rc_auth'); localStorage.removeItem('rc_active_nav'); } catch {}
      }
    });
  }, []);

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    return () => { Object.values(toastTimersRef.current).forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    if (auth?.id !== 'admin') return;
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setGlobalSearchOpen(true);
      } else if (e.key === 'Escape') {
        setGlobalSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [auth]);

  useEffect(() => {
    setRelayPage(1); setSelectedRelayIds([]);
  }, [searchQuery, filterStatus, adminFilterStation, relayPageSize]);

  useEffect(() => {
    const adminOnlyNav = ['stations', 'settings', 'add-relay', 'add-station', 'uchastkalar', 'add-uchastka', 'mexaniklar', 'add-mexanik', 'monthly-plan', 'activity-log'];
    if (auth && auth.id !== 'admin' && adminOnlyNav.includes(activeNav)) setActiveNav('dashboard');
  }, [auth]);

  useEffect(() => {
    if (auth?.isMexanik) setViewMexanik(auth.id);
  }, [auth]);

  useEffect(() => {
    if (activeNav !== 'activity-log' || auth?.id !== 'admin') return;
    setActivityLogLoading(true);
    supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setActivityLog(data || []); setActivityLogLoading(false); });
  }, [activeNav, auth]);

  // ── Computed values ───────────────────────────────────────────────────────
  const toggleTheme = () => setTheme((cur) => (cur === 'dark' ? 'light' : 'dark'));
  const cycleLang = () => setLang((cur) => LANGS[(LANGS.indexOf(cur) + 1) % LANGS.length]);
  const confirmDiscard = () => !isDirty || window.confirm(t('common.unsavedChangesConfirm'));

  const stationRelays = relays
    .map((r) => ({ ...r, status: getRelayStatusFromDate(r.nextCheck) }))
    .filter((relay) =>
      auth?.id === 'admin'
        ? adminFilterStation === 'all' ? true : relay.stationId === adminFilterStation
        : relay.stationId === auth?.id
    );

  const visibleRelays = stationRelays
    .filter((r) => filterStatus === 'all' || r.status === filterStatus)
    .filter((r) => normalizeRelayName(r.name).includes(normalizeRelayName(searchQuery)) || r.num.includes(searchQuery))
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

  const globalNameCounts = Object.values(
    stationRelays.reduce((acc, r) => {
      const key = normalizeRelayName(r.name) || '—';
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

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

  const visibleMexaniklar = mexaniklar.filter((m) => m.name.toLowerCase().includes(mexanikSearch.toLowerCase()));
  const visibleUchastkalar = uchastkalar.filter((u) => u.name.toLowerCase().includes(uchastkaSearch.toLowerCase()));
  const visibleMonthlyPlan = monthlyPlanByStation
    .map((g) => {
      const q = monthlyPlanSearch.trim().toLowerCase();
      if (!q) return g;
      const stationMatches = g.station.name.toLowerCase().includes(q);
      const rs = stationMatches ? g.relays : g.relays.filter((r) => r.name.toLowerCase().includes(q) || r.num.includes(monthlyPlanSearch));
      return { ...g, relays: rs };
    })
    .filter((g) => g.relays.length > 0);

  const getStationName = (id) => stations.find((s) => s.id === id)?.name || id;
  const getUchastkaName = (id) => uchastkalar.find((u) => u.id === id)?.name || '—';

  const globalSearchResults = (() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return null;
    return {
      relays: relays.filter((r) => r.name.toLowerCase().includes(q) || r.num.toLowerCase().includes(q)).slice(0, 6),
      stations: stations.filter((s) => s.id !== 'admin' && s.name.toLowerCase().includes(q)).slice(0, 6),
      uchastkalar: uchastkalar.filter((u) => u.name.toLowerCase().includes(q)).slice(0, 6),
      mexaniklar: mexaniklar.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 6),
    };
  })();

  const importValidRows = importPreview && !importPreview.error ? importPreview.rows.filter((r) => r.name && r.num && r.stationId) : [];
  const importInvalidCount = importPreview && !importPreview.error ? importPreview.rows.length - importValidRows.length : 0;
  const globalSearchHasResults = globalSearchResults && (
    globalSearchResults.relays.length || globalSearchResults.stations.length ||
    globalSearchResults.uchastkalar.length || globalSearchResults.mexaniklar.length
  );

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
      const key = normalizeRelayName(r.name) || '—';
      acc[key] = acc[key] || { name: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const filteredViewStationRelays = viewStationNameFilter
    ? viewStationRelays.filter((r) => (normalizeRelayName(r.name) || '—') === viewStationNameFilter)
    : viewStationRelays;

  const viewMexanikData = viewMexanik ? mexaniklar.find((m) => m.id === viewMexanik) : null;
  const viewMexanikRelays = viewMexanikData
    ? relays
        .filter((r) => (r.note || '').split(',').map((s) => s.trim()).includes(viewMexanikData.name))
        .map((r) => ({ ...r, status: getRelayStatusFromDate(r.nextCheck) }))
        .sort((a, b) => (b.lastCheck || '').localeCompare(a.lastCheck || ''))
    : [];
  const viewMexanikMonthCounts = Object.values(
    viewMexanikRelays.reduce((acc, r) => {
      const key = r.lastCheck ? r.lastCheck.slice(0, 7) : '';
      acc[key] = acc[key] || { month: key, count: 0 };
      acc[key].count += 1;
      return acc;
    }, {})
  ).sort((a, b) => b.month.localeCompare(a.month));
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const viewMexanikThisMonthRelays = viewMexanikRelays.filter((r) => r.lastCheck && r.lastCheck.slice(0, 7) === thisMonthKey);
  const viewMexanikMonthRelays = viewMexanikMonth !== null
    ? viewMexanikRelays.filter((r) => (r.lastCheck ? r.lastCheck.slice(0, 7) : '') === viewMexanikMonth)
    : [];

  const filteredNav = navItems.filter((item) => (item.adminOnly ? auth?.id === 'admin' : true));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const logActivity = async (action, entityType, entityLabel, details) => {
    try {
      await supabase.from('activity_log').insert({
        actor_id: auth?.id || 'unknown',
        actor_name: auth?.name || 'unknown',
        action, entity_type: entityType, entity_label: entityLabel,
        details: details || null,
      });
    } catch {}
  };

  const pushUndoToast = (message, onCommit, onUndo) => {
    const toastId = `${Date.now()}-${Math.random()}`;
    toastTimersRef.current[toastId] = setTimeout(() => {
      delete toastTimersRef.current[toastId];
      setToasts((cur) => cur.filter((item) => item.id !== toastId));
      onCommit();
    }, 7000);
    setToasts((cur) => [...cur, {
      id: toastId, message,
      undo: () => {
        clearTimeout(toastTimersRef.current[toastId]);
        delete toastTimersRef.current[toastId];
        setToasts((cur2) => cur2.filter((item) => item.id !== toastId));
        onUndo();
      },
    }]);
  };

  const printQRCode = async (relay) => {
    const canvas = document.createElement('canvas');
    await QRCode.toCanvas(canvas, qrUrl(relay), { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' } });
    const link = document.createElement('a');
    link.download = `QR-${relay.num}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loginStation.startsWith('mexanik:')) {
      const mexId = loginStation.slice('mexanik:'.length);
      const { data, error } = await supabase.rpc('verify_mexanik_login', { p_id: mexId, p_username: loginUsername, p_password: loginPassword });
      const mech = data?.[0];
      if (error || !mech) { setLoginError(t('login.error')); return; }
      const authObj = { id: mech.id, name: mech.name, isMexanik: true };
      setAuth(authObj);
      try { localStorage.setItem('rc_auth', JSON.stringify(authObj)); } catch {}
      setViewMexanik(mech.id); setLoginError(''); setLoginPassword(''); setLoginUsername('');
      return;
    }
    if (loginStation === 'admin') {
      const { data, error } = await supabase.auth.signInWithPassword({ email: ADMIN_AUTH_EMAIL, password: loginPassword });
      if (error || !data?.user) { setLoginError(t('login.error')); return; }
      const authObj = { id: 'admin', name: 'ADMIN (Barcha stansiyalar)' };
      setAuth(authObj);
      try { localStorage.setItem('rc_auth', JSON.stringify(authObj)); } catch {}
      setLoginError(''); setSearchQuery(''); setFilterStatus('all'); setSelectedRelay(null); setActiveNav('dashboard'); setLoginPassword(''); setLoginUsername('');
      return;
    }
    const { data, error } = await supabase.rpc('verify_station_login', { p_id: loginStation, p_username: loginUsername, p_password: loginPassword });
    const station = data?.[0];
    if (error || !station) { setLoginError(t('login.error')); return; }
    setAuth(station);
    try { localStorage.setItem('rc_auth', JSON.stringify({ id: station.id, name: station.name })); } catch {}
    setLoginError(''); setSearchQuery(''); setFilterStatus('all'); setSelectedRelay(null); setActiveNav('dashboard');
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setAuth(null); setActiveNav('dashboard');
    try { localStorage.removeItem('rc_auth'); localStorage.removeItem('rc_active_nav'); } catch {}
    setSelectedRelay(null); setViewStation(null); setViewMexanik(null); setViewMexanikMonth(null);
    setIsDirty(false); setLoginPassword(''); setLoginUsername(''); setLoginError('');
  };

  const handleSaveEdit = async () => {
    const before = relays.find((r) => r.id === selectedRelay.id);
    const relay = fromRelay(selectedRelay);
    const { error } = await supabase.rpc('update_relay_anon', {
      p_id: selectedRelay.id,
      p_station_id: relay.station_id,
      p_name: relay.name,
      p_num: relay.num,
      p_stativ: relay.stativ || null,
      p_last_check: relay.last_check || null,
      p_next_check: relay.next_check || null,
      p_note: relay.note || null,
      p_object: relay.object || null,
      p_manzil: relay.manzil || null,
    });
    if (error) { alert(error.message); return; }
    setRelays(relays.map((r) => r.id === selectedRelay.id ? { ...selectedRelay } : r));
    const diff = buildRelayDiff(before, selectedRelay, getStationName);
    logActivity('update', 'relay', `${selectedRelay.name} (${selectedRelay.num})`, diff.length ? JSON.stringify(diff) : null);
    setIsDirty(false); setSelectedRelay(null);
  };

  const handleSaveBulkEdit = async () => {
    const dbUpdates = {}; const localUpdates = {};
    if (bulkEdit.applyStation && bulkEdit.stationId) { dbUpdates.station_id = bulkEdit.stationId; localUpdates.stationId = bulkEdit.stationId; }
    if (bulkEdit.applyNextCheck && bulkEdit.nextCheck) { dbUpdates.next_check = bulkEdit.nextCheck; localUpdates.nextCheck = bulkEdit.nextCheck; }
    if (bulkEdit.applyLastCheck && bulkEdit.lastCheck) { dbUpdates.last_check = bulkEdit.lastCheck; localUpdates.lastCheck = bulkEdit.lastCheck; }
    if (bulkEdit.applyStativ && bulkEdit.stativ.trim()) { dbUpdates.stativ = bulkEdit.stativ.trim(); localUpdates.stativ = bulkEdit.stativ.trim(); }
    if (bulkEdit.applyNote) { dbUpdates.note = bulkEdit.note || null; localUpdates.note = bulkEdit.note; }
    if (Object.keys(dbUpdates).length === 0) return;
    const ids = selectedRelayIds;
    await supabase.from('relays').update(dbUpdates).in('id', ids);
    setRelays((cur) => cur.map((r) => ids.includes(r.id) ? { ...r, ...localUpdates } : r));
    const bulkChanges = RELAY_DIFF_FIELDS.filter((f) => f.key in localUpdates)
      .map((f) => ({ field: f.key, after: f.key === 'stationId' ? getStationName(localUpdates[f.key]) : localUpdates[f.key] }));
    logActivity('update', 'relay', t('bulkEdit.logLabel', ids.length), bulkChanges.length ? JSON.stringify(bulkChanges) : null);
    setBulkEditOpen(false); setSelectedRelayIds([]);
    setBulkEdit({ applyStation: false, stationId: '', applyNextCheck: false, nextCheck: '', applyLastCheck: false, lastCheck: '', applyStativ: false, stativ: '', applyNote: false, note: '' });
  };

  const handleAddRelay = async () => {
    const { data } = await supabase.from('relays').insert(fromRelay(newRelay)).select().single();
    if (data) {
      const added = toRelay(data);
      setRelays([...relays, added]);
      setQrPreviewRelay(added);
      logActivity('create', 'relay', `${added.name} (${added.num})`);
    }
    setIsDirty(false);
    setNewRelay({ stationId: newRelay.stationId, name: '', num: '', stativ: '', lastCheck: '', nextCheck: '', note: '' });
  };

  const handleAddStation = async () => {
    setStationFormError('');
    if (!newStation.name.trim() || !newStation.username.trim() || !newStation.password.trim()) return;
    const newId = newStation.username.trim().toLowerCase().replace(/\s+/g, '-');
    if (stations.some((s) => s.id === newId)) { setStationFormError(t('errors.usernameTaken', newStation.username)); return; }
    const row = { id: newId, name: newStation.name, username: newStation.username, uchastka_id: newStation.uchastkaId || null };
    const { error } = await supabase.from('stations').insert(row);
    if (error) { setStationFormError(error.message); return; }
    const { error: pwError } = await supabase.rpc('set_station_password', { p_id: newId, p_password: newStation.password });
    if (pwError) { setStationFormError(pwError.message); return; }
    setStations([...stations, row]);
    logActivity('create', 'station', row.name);
    setIsDirty(false); setNewStation({ name: '', username: '', password: '', uchastkaId: '' });
  };

  const handleUpdateStation = async () => {
    if (!editingStation) return;
    setStationFormError('');
    const oldId = editingStation._originalId;
    const newId = editingStation.username.trim().toLowerCase().replace(/\s+/g, '-');
    if (newId !== oldId && stations.some((s) => s.id === newId)) { setStationFormError(t('errors.usernameTaken', editingStation.username)); return; }
    const row = { id: newId, name: editingStation.name, username: editingStation.username, uchastka_id: editingStation.uchastka_id || null };
    if (oldId !== newId) {
      const { error: renameError } = await supabase.rpc('rename_station', { p_old_id: oldId, p_new_id: newId, p_name: row.name, p_username: row.username, p_uchastka_id: row.uchastka_id });
      if (renameError) { setStationFormError(renameError.message); return; }
      setRelays(relays.map((r) => r.stationId === oldId ? { ...r, stationId: newId } : r));
    } else {
      const { error } = await supabase.from('stations').update({ name: row.name, username: row.username, uchastka_id: row.uchastka_id }).eq('id', oldId);
      if (error) { setStationFormError(error.message); return; }
    }
    if (editingStation.password.trim()) {
      const { error: pwError } = await supabase.rpc('set_station_password', { p_id: newId, p_password: editingStation.password.trim() });
      if (pwError) { setStationFormError(pwError.message); return; }
    }
    setStations(stations.map((s) => s.id === oldId ? row : s));
    logActivity('update', 'station', row.name);
    setIsDirty(false); setEditingStation(null);
  };

  const handleDeleteRelay = (id) => {
    const relay = relays.find((r) => r.id === id);
    if (!relay) return;
    setRelays((cur) => cur.filter((r) => r.id !== id));
    pushUndoToast(
      t('toast.deleted', `${relay.name} (${relay.num})`),
      async () => { await supabase.from('relays').delete().eq('id', id); logActivity('delete', 'relay', `${relay.name} (${relay.num})`); },
      () => setRelays((cur) => [...cur, relay]),
    );
  };

  const handleDeleteStation = () => {
    if (!deleteStationId) return;
    const stationId = deleteStationId;
    const station = stations.find((s) => s.id === stationId);
    const stationRelaysSnapshot = relays.filter((r) => r.stationId === stationId);
    setStations((cur) => cur.filter((s) => s.id !== stationId));
    setRelays((cur) => cur.filter((r) => r.stationId !== stationId));
    setDeleteStationId(null);
    if (!station) return;
    pushUndoToast(
      t('toast.deleted', station.name),
      async () => { await supabase.from('relays').delete().eq('station_id', stationId); await supabase.from('stations').delete().eq('id', stationId); logActivity('delete', 'station', station.name); },
      () => { setStations((cur) => [...cur, station]); setRelays((cur) => [...cur, ...stationRelaysSnapshot]); },
    );
  };

  const handleAddUchastka = async () => {
    setUchastkaFormError('');
    if (!newUchastka.name.trim()) return;
    const newId = newUchastka.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (uchastkalar.some((u) => u.id === newId)) { setUchastkaFormError(t('errors.uchastkaExists', newUchastka.name)); return; }
    const row = { id: newId, name: newUchastka.name };
    const { error } = await supabase.from('uchastkalar').insert(row);
    if (error) { setUchastkaFormError(error.message); return; }
    setUchastkalar([...uchastkalar, row]);
    logActivity('create', 'uchastka', row.name);
    setIsDirty(false); setNewUchastka({ name: '' });
  };

  const handleUpdateUchastka = async () => {
    if (!editingUchastka) return;
    const row = { id: editingUchastka.id, name: editingUchastka.name };
    const { error } = await supabase.from('uchastkalar').update(row).eq('id', row.id);
    if (error) return;
    setUchastkalar(uchastkalar.map((u) => u.id === row.id ? row : u));
    logActivity('update', 'uchastka', row.name);
    setIsDirty(false); setEditingUchastka(null);
  };

  const handleDeleteUchastka = () => {
    if (!deleteUchastkaId) return;
    const uchastkaId = deleteUchastkaId;
    const uchastka = uchastkalar.find((u) => u.id === uchastkaId);
    const affectedStationIds = stations.filter((s) => s.uchastka_id === uchastkaId).map((s) => s.id);
    setStations((cur) => cur.map((s) => s.uchastka_id === uchastkaId ? { ...s, uchastka_id: null } : s));
    setUchastkalar((cur) => cur.filter((u) => u.id !== uchastkaId));
    setDeleteUchastkaId(null);
    if (!uchastka) return;
    pushUndoToast(
      t('toast.deleted', uchastka.name),
      async () => { await supabase.from('stations').update({ uchastka_id: null }).eq('uchastka_id', uchastkaId); await supabase.from('uchastkalar').delete().eq('id', uchastkaId); logActivity('delete', 'uchastka', uchastka.name); },
      () => { setUchastkalar((cur) => [...cur, uchastka]); setStations((cur) => cur.map((s) => affectedStationIds.includes(s.id) ? { ...s, uchastka_id: uchastkaId } : s)); },
    );
  };

  const handleAddMexanik = async () => {
    setMexanikFormError('');
    if (!newMexanik.name.trim()) return;
    const newId = newMexanik.name.trim().toLowerCase().replace(/\s+/g, '-');
    if (mexaniklar.some((m) => m.id === newId)) { setMexanikFormError(t('errors.mexanikExists', newMexanik.name)); return; }
    const row = { id: newId, name: newMexanik.name, username: newMexanik.username.trim() || null };
    const { error } = await supabase.from('mexaniklar').insert(row);
    if (error) { setMexanikFormError(error.message); return; }
    if (newMexanik.username.trim() && newMexanik.password.trim()) {
      const { error: pwError } = await supabase.rpc('set_mexanik_password', { p_id: newId, p_password: newMexanik.password.trim() });
      if (pwError) { setMexanikFormError(pwError.message); return; }
    }
    setMexaniklar([...mexaniklar, row]);
    logActivity('create', 'mexanik', row.name);
    setIsDirty(false); setNewMexanik({ name: '', username: '', password: '' });
  };

  const handleUpdateMexanik = async () => {
    if (!editingMexanik) return;
    const row = { id: editingMexanik.id, name: editingMexanik.name, username: editingMexanik.username.trim() || null };
    const { error } = await supabase.from('mexaniklar').update(row).eq('id', row.id);
    if (error) return;
    if (editingMexanik.password.trim()) {
      const { error: pwError } = await supabase.rpc('set_mexanik_password', { p_id: row.id, p_password: editingMexanik.password.trim() });
      if (pwError) return;
    }
    setMexaniklar(mexaniklar.map((m) => m.id === row.id ? row : m));
    logActivity('update', 'mexanik', row.name);
    setIsDirty(false); setEditingMexanik(null);
  };

  const handleDeleteMexanik = () => {
    if (!deleteMexanikId) return;
    const mexanikId = deleteMexanikId;
    const mexanik = mexaniklar.find((m) => m.id === mexanikId);
    setMexaniklar((cur) => cur.filter((m) => m.id !== mexanikId));
    setDeleteMexanikId(null);
    if (!mexanik) return;
    pushUndoToast(
      t('toast.deleted', mexanik.name),
      async () => { await supabase.from('mexaniklar').delete().eq('id', mexanikId); logActivity('delete', 'mexanik', mexanik.name); },
      () => setMexaniklar((cur) => [...cur, mexanik]),
    );
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    await registerPdfFont(doc);
    doc.setFontSize(16);
    doc.text(`Rele-Control — ${auth?.id === 'admin' ? 'ADMIN hisobot' : auth?.name || 'Hisobot'}`, 14, 16);
    doc.setFontSize(10);
    let y = 30;
    stationRelays.forEach((r, i) => { doc.text(`${i + 1}. ${r.name} (${r.num}) | ${r.nextCheck} [${r.status.toUpperCase()}]`, 14, y); y += 8; });
    doc.save('rele-hisobot.pdf');
  };

  const csvHeaders = [t('field.name'), t('field.factoryNum'), t('common.station'), t('field.stativNum'), t('field.lastCheck'), t('field.nextCheck'), t('field.checkedBy')];

  const exportRelaysToCSV = () => {
    const rows = visibleRelays.map((r) => [r.name, r.num, getStationName(r.stationId), r.stativ, r.lastCheck, r.nextCheck, r.note]);
    const csv = [csvHeaders, ...rows].map((row) => row.map(csvEscape).join(',')).join('\r\n');
    downloadTextFile('relelar.csv', csv);
  };

  const downloadRelayImportTemplate = () => {
    const example = ['RPU-3', '12345', stations.find((s) => s.id !== 'admin')?.name || '', '1-2', '2026-01-15', '2026-07-15', ''];
    const csv = [csvHeaders, example].map((row) => row.map(csvEscape).join(',')).join('\r\n');
    downloadTextFile('rele-shablon.csv', csv);
  };

  const handleRelayImportFile = async (file) => {
    const text = await file.text();
    const rows = parseCSV(text);
    if (rows.length < 2) { setImportPreview({ error: t('bulkImport.emptyFile'), rows: [] }); setImportModalOpen(true); return; }
    const headerRow = rows[0].map((h) => h.trim().toLowerCase());
    const fieldIndexes = {};
    headerRow.forEach((h, idx) => { const fieldKey = CSV_HEADER_TO_FIELD[h]; if (fieldKey) fieldIndexes[fieldKey] = idx; });
    if (fieldIndexes.name === undefined || fieldIndexes.num === undefined || fieldIndexes.station === undefined) {
      setImportPreview({ error: t('bulkImport.missingColumns'), rows: [] }); setImportModalOpen(true); return;
    }
    const parsed = rows.slice(1).map((cols) => {
      const stationName = (cols[fieldIndexes.station] || '').trim();
      const station = stations.find((s) => s.id !== 'admin' && s.name.trim().toLowerCase() === stationName.toLowerCase());
      return {
        name: (cols[fieldIndexes.name] || '').trim(), num: (cols[fieldIndexes.num] || '').trim(),
        stationName, stationId: station?.id || null,
        stativ: fieldIndexes.stativ !== undefined ? (cols[fieldIndexes.stativ] || '').trim() : '',
        lastCheck: fieldIndexes.lastCheck !== undefined ? (cols[fieldIndexes.lastCheck] || '').trim() : '',
        nextCheck: fieldIndexes.nextCheck !== undefined ? (cols[fieldIndexes.nextCheck] || '').trim() : '',
        note: fieldIndexes.note !== undefined ? (cols[fieldIndexes.note] || '').trim() : '',
      };
    });
    setImportPreview({ rows: parsed }); setImportModalOpen(true);
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    const validRows = importPreview.rows.filter((r) => r.name && r.num && r.stationId);
    if (validRows.length === 0) return;
    const toInsert = validRows.map((r) => ({
      station_id: r.stationId, name: r.name, num: r.num,
      stativ: r.stativ || null, last_check: r.lastCheck || null,
      next_check: r.nextCheck || null, note: r.note || null,
    }));
    const { data } = await supabase.from('relays').insert(toInsert).select();
    if (data) { setRelays((cur) => [...cur, ...data.map(toRelay)]); logActivity('create', 'relay', t('bulkImport.logLabel', data.length)); }
    setImportModalOpen(false); setImportPreview(null);
  };

  const exportMonthlyPlanPDF = async () => {
    const doc = new jsPDF();
    await registerPdfFont(doc);
    doc.setFontSize(16); doc.text("Oylik tekshiruv rejasi (muddati yaqin relelar)", 14, 16);
    doc.setFontSize(10); let y = 30;
    monthlyPlanByStation.forEach((group) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.setFont('Roboto', 'bold'); doc.text(`${group.station.name} (${group.relays.length} ta)`, 14, y); y += 7;
      doc.setFont('Roboto', 'normal');
      group.relays.forEach((r, i) => { if (y > 280) { doc.addPage(); y = 20; } doc.text(`  ${i + 1}. ${r.name} (${r.num}) — ${r.nextCheck}`, 14, y); y += 7; });
      y += 4;
    });
    doc.save('oylik-reja.pdf');
  };

  const exportMexanikMonthPDF = async () => {
    if (!viewMexanikData) return;
    const monthLabel = formatMonth(thisMonthKey, 'uz');
    const doc = new jsPDF();
    await registerPdfFont(doc);
    let y = 16;
    doc.setFontSize(16); doc.text(viewMexanikData.name, 14, y); y += 10;
    doc.setFontSize(10); doc.text(`Jami tekshirilgan relelar: ${viewMexanikRelays.length} ta`, 14, y); y += 10;
    doc.setFont('Roboto', 'bold'); doc.text(`${monthLabel} oyida tekshirilgan: ${viewMexanikThisMonthRelays.length} ta`, 14, y); y += 8;
    doc.setFont('Roboto', 'normal');
    if (viewMexanikThisMonthRelays.length === 0) { doc.text("Bu oyda tekshirilgan rele yo'q", 14, y); y += 8; }
    else { viewMexanikThisMonthRelays.forEach((r, i) => { if (y > 280) { doc.addPage(); y = 20; } doc.text(`  ${i + 1}. ${r.name} (${r.num}) — ${getStationName(r.stationId)} — ${r.lastCheck}`, 14, y); y += 8; }); }
    y += 4;
    if (y > 260) { doc.addPage(); y = 20; }
    doc.setFont('Roboto', 'bold'); doc.text("Oylar bo'yicha statistika", 14, y); y += 8;
    doc.setFont('Roboto', 'normal');
    viewMexanikMonthCounts.forEach((item) => { if (y > 280) { doc.addPage(); y = 20; } const label = item.month ? formatMonth(item.month, 'uz') : 'Sana kiritilmagan'; doc.text(`  ${label} — ${item.count} ta`, 14, y); y += 7; });
    doc.save(`mexanik-${viewMexanikData.id}-${thisMonthKey}.pdf`);
  };

  const openGlobalSearchRelay = (relay) => { setGlobalSearchOpen(false); setGlobalSearchQuery(''); setActiveNav('relays'); setIsDirty(false); setSelectedRelay({ ...relay }); };
  const openGlobalSearchStation = (station) => { setGlobalSearchOpen(false); setGlobalSearchQuery(''); setActiveNav('stations'); setViewStation(station.id); };
  const openGlobalSearchUchastka = (uchastka) => { setGlobalSearchOpen(false); setGlobalSearchQuery(''); setActiveNav('uchastkalar'); setIsDirty(false); setEditingUchastka({ id: uchastka.id, name: uchastka.name }); };
  const openGlobalSearchMexanik = (mexanik) => { setGlobalSearchOpen(false); setGlobalSearchQuery(''); setActiveNav('mexaniklar'); setViewMexanik(mexanik.id); setViewMexanikMonth(null); };

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading && !/^\/relay\/\d+$/.test(window.location.pathname)) {
    return <LoadingScreen t={t} />;
  }

  if (publicRelay) {
    return <PublicRelayPage relay={publicRelay} lang={lang} cycleLang={cycleLang} t={t} getStationName={getStationName} />;
  }

  if (!auth) {
    return (
      <LoginPage
        lang={lang} cycleLang={cycleLang} theme={theme} toggleTheme={toggleTheme} t={t}
        relays={relays} stations={stations} mexaniklar={mexaniklar}
        loginStation={loginStation} setLoginStation={setLoginStation}
        loginUsername={loginUsername} setLoginUsername={setLoginUsername}
        loginPassword={loginPassword} setLoginPassword={setLoginPassword}
        showLoginPassword={showLoginPassword} setShowLoginPassword={setShowLoginPassword}
        loginError={loginError} handleLogin={handleLogin}
      />
    );
  }

  if (auth?.isMexanik) {
    return (
      <MexanikPage
        lang={lang} cycleLang={cycleLang} theme={theme} toggleTheme={toggleTheme} t={t}
        viewMexanikData={viewMexanikData} viewMexanikRelays={viewMexanikRelays}
        viewMexanikThisMonthRelays={viewMexanikThisMonthRelays} thisMonthKey={thisMonthKey}
        viewMexanikMonthCounts={viewMexanikMonthCounts} viewMexanikMonth={viewMexanikMonth} setViewMexanikMonth={setViewMexanikMonth}
        viewMexanikMonthRelays={viewMexanikMonthRelays} getStationName={getStationName}
        exportMexanikMonthPDF={exportMexanikMonthPDF} handleLogout={handleLogout}
      />
    );
  }

  // ── Main layout ───────────────────────────────────────────────────────────
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans transition-colors duration-300">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-amber-500/10 blur-[120px] animate-float" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 h-14 flex items-center gap-3 px-4 glass border-b border-white/5">
        <button onClick={() => setSidebarOpen(true)}
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
        <div className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="relative flex min-h-screen">
        <AppSidebar
          t={t} auth={auth} lang={lang} cycleLang={cycleLang} theme={theme} toggleTheme={toggleTheme}
          filteredNav={filteredNav} activeNav={activeNav} setActiveNav={setActiveNav}
          sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
          setViewStation={setViewStation} setViewMexanik={setViewMexanik} setViewMexanikMonth={setViewMexanikMonth}
          setGlobalSearchOpen={setGlobalSearchOpen} handleLogout={handleLogout}
        />

        <main className="lg:ml-64 flex-1 pt-14 px-4 pb-4 lg:pt-6 lg:px-6 lg:pb-6 space-y-6">
          {viewStation ? (
            <StationDetailView
              t={t} auth={auth}
              viewStationData={viewStationData} viewStationStats={viewStationStats}
              viewStationRelays={viewStationRelays} viewStationNameCounts={viewStationNameCounts}
              viewStationNameFilter={viewStationNameFilter} setViewStationNameFilter={setViewStationNameFilter}
              filteredViewStationRelays={filteredViewStationRelays}
              setViewStation={setViewStation} setSelectedRelay={setSelectedRelay} setIsDirty={setIsDirty}
              printQRCode={printQRCode} handleDeleteRelay={handleDeleteRelay}
              setEditingStation={setEditingStation}
            />
          ) : viewMexanik ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => { setViewMexanik(null); setViewMexanikMonth(null); }}
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
                {viewMexanikRelays.length > 0 && (
                  <button onClick={exportMexanikMonthPDF}
                    className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
                    {t('common.pdfExport')}
                  </button>
                )}
              </div>
              <MexanikStatsPanel
                t={t} lang={lang} relays={viewMexanikRelays}
                thisMonthRelays={viewMexanikThisMonthRelays} thisMonthKey={thisMonthKey}
                monthCounts={viewMexanikMonthCounts} selectedMonth={viewMexanikMonth}
                onSelectMonth={setViewMexanikMonth} monthRelays={viewMexanikMonthRelays}
                getStationName={getStationName}
              />
            </div>
          ) : (
            <>
              {activeNav === 'dashboard' && (
                <DashboardPage
                  t={t} stats={stats} stationRelays={stationRelays}
                  visibleStations={visibleStations} globalNameCounts={globalNameCounts}
                  relays={relays} getRelayStatusFromDate={getRelayStatusFromDate}
                  setActiveNav={setActiveNav} setFilterStatus={setFilterStatus}
                  setSearchQuery={setSearchQuery} setViewStation={setViewStation}
                />
              )}
              {activeNav === 'relays' && (
                <RelaysPage
                  t={t} auth={auth} pagedRelays={pagedRelays} visibleRelays={visibleRelays}
                  stations={stations} getStationName={getStationName}
                  searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                  filterStatus={filterStatus} setFilterStatus={setFilterStatus}
                  adminFilterStation={adminFilterStation} setAdminFilterStation={setAdminFilterStation}
                  selectedRelayIds={selectedRelayIds} setSelectedRelayIds={setSelectedRelayIds}
                  setBulkEditOpen={setBulkEditOpen}
                  relayPage={relayPage} setRelayPage={setRelayPage}
                  relayPageCount={relayPageCount} relayPageSize={relayPageSize} setRelayPageSize={setRelayPageSize}
                  importFileInputRef={importFileInputRef} handleRelayImportFile={handleRelayImportFile}
                  exportToPDF={exportToPDF} exportRelaysToCSV={exportRelaysToCSV}
                  downloadRelayImportTemplate={downloadRelayImportTemplate}
                  setSelectedRelay={setSelectedRelay} setIsDirty={setIsDirty}
                  printQRCode={printQRCode} handleDeleteRelay={handleDeleteRelay}
                />
              )}
              {activeNav === 'add-relay' && auth?.id === 'admin' && (
                <AddRelayPage
                  t={t} newRelay={newRelay} setNewRelay={setNewRelay}
                  stations={stations} mexaniklar={mexaniklar}
                  handleAddRelay={handleAddRelay} confirmDiscard={confirmDiscard}
                  setIsDirty={setIsDirty} setActiveNav={setActiveNav}
                />
              )}
              {activeNav === 'stations' && auth?.id === 'admin' && (
                <StationsPage
                  t={t} stations={stations} relays={relays}
                  setEditingStation={setEditingStation} setDeleteStationId={setDeleteStationId}
                  setIsDirty={setIsDirty} getUchastkaName={getUchastkaName}
                />
              )}
              {activeNav === 'add-station' && auth?.id === 'admin' && (
                <AddStationPage
                  t={t} newStation={newStation} setNewStation={setNewStation}
                  uchastkalar={uchastkalar} handleAddStation={handleAddStation}
                  stationFormError={stationFormError} confirmDiscard={confirmDiscard}
                  setIsDirty={setIsDirty} setStationFormError={setStationFormError} setActiveNav={setActiveNav}
                />
              )}
              {activeNav === 'monthly-plan' && auth?.id === 'admin' && (
                <MonthlyPlanPage
                  t={t} monthlyPlanByStation={monthlyPlanByStation}
                  visibleMonthlyPlan={visibleMonthlyPlan}
                  monthlyPlanSearch={monthlyPlanSearch} setMonthlyPlanSearch={setMonthlyPlanSearch}
                  exportMonthlyPlanPDF={exportMonthlyPlanPDF}
                />
              )}
              {activeNav === 'uchastkalar' && auth?.id === 'admin' && (
                <UchastkalarPage
                  t={t} uchastkalar={uchastkalar} visibleUchastkalar={visibleUchastkalar}
                  uchastkaSearch={uchastkaSearch} setUchastkaSearch={setUchastkaSearch}
                  stations={stations} relays={relays}
                  setEditingUchastka={setEditingUchastka} setDeleteUchastkaId={setDeleteUchastkaId} setIsDirty={setIsDirty}
                />
              )}
              {activeNav === 'add-uchastka' && auth?.id === 'admin' && (
                <AddUchastkaPage
                  t={t} newUchastka={newUchastka} setNewUchastka={setNewUchastka}
                  handleAddUchastka={handleAddUchastka} uchastkaFormError={uchastkaFormError}
                  confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
                  setUchastkaFormError={setUchastkaFormError} setActiveNav={setActiveNav}
                />
              )}
              {activeNav === 'mexaniklar' && auth?.id === 'admin' && (
                <MexaniklarPage
                  t={t} mexaniklar={mexaniklar} visibleMexaniklar={visibleMexaniklar}
                  mexanikSearch={mexanikSearch} setMexanikSearch={setMexanikSearch}
                  setEditingMexanik={setEditingMexanik} setDeleteMexanikId={setDeleteMexanikId}
                  setViewMexanik={setViewMexanik} setViewMexanikMonth={setViewMexanikMonth} setIsDirty={setIsDirty}
                />
              )}
              {activeNav === 'add-mexanik' && auth?.id === 'admin' && (
                <AddMexanikPage
                  t={t} newMexanik={newMexanik} setNewMexanik={setNewMexanik}
                  handleAddMexanik={handleAddMexanik} mexanikFormError={mexanikFormError}
                  confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
                  setMexanikFormError={setMexanikFormError} setActiveNav={setActiveNav}
                />
              )}
              {activeNav === 'activity-log' && auth?.id === 'admin' && (
                <ActivityLogPage t={t} lang={lang} activityLog={activityLog} activityLogLoading={activityLogLoading} />
              )}
              {activeNav === 'settings' && auth?.id === 'admin' && (
                <SettingsPage
                  t={t} publicUrl={publicUrl} publicUrlInput={publicUrlInput}
                  setPublicUrlInput={setPublicUrlInput} setPublicUrl={setPublicUrl}
                />
              )}
              {activeNav === 'help' && (
                <HelpPage t={t} auth={auth} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <EditRelayModal
        t={t} auth={auth} selectedRelay={selectedRelay} setSelectedRelay={setSelectedRelay}
        stations={stations} mexaniklar={mexaniklar}
        handleSaveEdit={handleSaveEdit} confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
      />
      <BulkEditModal
        t={t} bulkEditOpen={bulkEditOpen} setBulkEditOpen={setBulkEditOpen}
        bulkEdit={bulkEdit} setBulkEdit={setBulkEdit}
        stations={stations} mexaniklar={mexaniklar}
        handleSaveBulkEdit={handleSaveBulkEdit} selectedRelayIds={selectedRelayIds}
      />
      <ImportModal
        t={t} importModalOpen={importModalOpen} setImportModalOpen={setImportModalOpen}
        importPreview={importPreview} setImportPreview={setImportPreview}
        importValidRows={importValidRows} importInvalidCount={importInvalidCount}
        handleConfirmImport={handleConfirmImport}
      />
      <EditStationModal
        t={t} editingStation={editingStation} setEditingStation={setEditingStation}
        uchastkalar={uchastkalar} handleUpdateStation={handleUpdateStation}
        stationFormError={stationFormError} setStationFormError={setStationFormError}
        confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
      />
      <ConfirmModal
        isOpen={!!deleteStationId} title={t('confirmStation.title')}
        message={t('confirmStation.message')}
        onConfirm={handleDeleteStation} onCancel={() => setDeleteStationId(null)} t={t}
      />
      <EditUchastkaModal
        t={t} editingUchastka={editingUchastka} setEditingUchastka={setEditingUchastka}
        handleUpdateUchastka={handleUpdateUchastka} confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
      />
      <ConfirmModal
        isOpen={!!deleteUchastkaId} title={t('confirmUchastka.title')}
        message={t('confirmUchastka.message')}
        onConfirm={handleDeleteUchastka} onCancel={() => setDeleteUchastkaId(null)} t={t}
      />
      <EditMexanikModal
        t={t} editingMexanik={editingMexanik} setEditingMexanik={setEditingMexanik}
        handleUpdateMexanik={handleUpdateMexanik} confirmDiscard={confirmDiscard} setIsDirty={setIsDirty}
      />
      <ConfirmModal
        isOpen={!!deleteMexanikId} title={t('confirmMexanik.title')}
        message={t('confirmMexanik.message')}
        onConfirm={handleDeleteMexanik} onCancel={() => setDeleteMexanikId(null)} t={t}
      />
      <QrPreviewModal
        t={t} qrPreviewRelay={qrPreviewRelay} setQrPreviewRelay={setQrPreviewRelay}
        printQRCode={printQRCode} getStationName={getStationName}
      />
      <GlobalSearchModal
        t={t} globalSearchOpen={globalSearchOpen} setGlobalSearchOpen={setGlobalSearchOpen}
        globalSearchQuery={globalSearchQuery} setGlobalSearchQuery={setGlobalSearchQuery}
        globalSearchResults={globalSearchResults} globalSearchHasResults={globalSearchHasResults}
        openGlobalSearchRelay={openGlobalSearchRelay} openGlobalSearchStation={openGlobalSearchStation}
        openGlobalSearchUchastka={openGlobalSearchUchastka} openGlobalSearchMexanik={openGlobalSearchMexanik}
        getStationName={getStationName}
      />

      <ToastContainer t={t} toasts={toasts} />
    </div>
  );
}
