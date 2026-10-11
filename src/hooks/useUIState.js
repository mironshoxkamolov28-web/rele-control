import { useState, useEffect, useRef, useMemo } from 'react';
import { LANGS, createTranslator } from '../i18n.js';

export function useUIState() {
  // ── Theme ──────────────────────────────────────────────────────────────────
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('rc_theme') || 'dark'; } catch { return 'dark'; }
  });

  // ── Language ───────────────────────────────────────────────────────────────
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('rc_lang') || 'uz'; } catch { return 'uz'; }
  });
  const t = useMemo(() => createTranslator(lang), [lang]);

  // ── Navigation ─────────────────────────────────────────────────────────────
  const [activeNav, setActiveNav] = useState(() => {
    try { return localStorage.getItem('rc_active_nav') || 'dashboard'; } catch { return 'dashboard'; }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // ── Dirty state ────────────────────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);

  // ── Toasts ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toastTimersRef = useRef({});

  // ── Detail views ───────────────────────────────────────────────────────────
  const [viewStation, setViewStation] = useState(null);
  const [viewStationNameFilter, setViewStationNameFilter] = useState(null);
  const [viewMexanik, setViewMexanik] = useState(null);
  const [viewMexanikMonth, setViewMexanikMonth] = useState(null);

  // ── Search ─────────────────────────────────────────────────────────────────
  const [monthlyPlanSearch, setMonthlyPlanSearch] = useState('');

  // ── Settings ───────────────────────────────────────────────────────────────
  const [publicUrl, setPublicUrl] = useState(() => {
    try { return localStorage.getItem('rc_public_url') || ''; } catch { return ''; }
  });
  const [publicUrlInput, setPublicUrlInput] = useState(publicUrl);

  // ── Effects ────────────────────────────────────────────────────────────────
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
    if (!isDirty) return;
    const handler = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  useEffect(() => {
    return () => { Object.values(toastTimersRef.current).forEach(clearTimeout); };
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const toggleTheme = () => setTheme((cur) => (cur === 'dark' ? 'light' : 'dark'));
  const cycleLang = () => setLang((cur) => LANGS[(LANGS.indexOf(cur) + 1) % LANGS.length]);
  const confirmDiscard = () => !isDirty || window.confirm(t('common.unsavedChangesConfirm'));

  const pushToast = (message, type = 'info', duration = 4000) => {
    const toastId = `${Date.now()}-${Math.random()}`;
    toastTimersRef.current[toastId] = setTimeout(() => {
      delete toastTimersRef.current[toastId];
      setToasts((cur) => cur.filter((item) => item.id !== toastId));
    }, duration);
    setToasts((cur) => [...cur, {
      id: toastId, message, type,
      onClose: () => {
        clearTimeout(toastTimersRef.current[toastId]);
        delete toastTimersRef.current[toastId];
        setToasts((cur2) => cur2.filter((item) => item.id !== toastId));
      },
    }]);
  };

  const pushUndoToast = (message, onCommit, onUndo) => {
    const toastId = `${Date.now()}-${Math.random()}`;
    toastTimersRef.current[toastId] = setTimeout(() => {
      delete toastTimersRef.current[toastId];
      setToasts((cur) => cur.filter((item) => item.id !== toastId));
      onCommit();
    }, 7000);
    setToasts((cur) => [...cur, {
      id: toastId, message, type: 'undo',
      undo: () => {
        clearTimeout(toastTimersRef.current[toastId]);
        delete toastTimersRef.current[toastId];
        setToasts((cur2) => cur2.filter((item) => item.id !== toastId));
        onUndo();
      },
    }]);
  };

  return {
    theme, setTheme, toggleTheme,
    lang, setLang, cycleLang, t,
    activeNav, setActiveNav,
    sidebarOpen, setSidebarOpen,
    isDirty, setIsDirty, confirmDiscard,
    toasts, pushToast, pushUndoToast,
    viewStation, setViewStation,
    viewStationNameFilter, setViewStationNameFilter,
    viewMexanik, setViewMexanik,
    viewMexanikMonth, setViewMexanikMonth,
    monthlyPlanSearch, setMonthlyPlanSearch,
    publicUrl, setPublicUrl,
    publicUrlInput, setPublicUrlInput,
  };
}
