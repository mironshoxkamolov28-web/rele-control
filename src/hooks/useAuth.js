import { useState, useEffect } from 'react';
import { supabase } from '../supabase.js';
import { ADMIN_AUTH_EMAIL } from '../relayHelpers.js';

export function useAuth({ auth, setAuth, t, stations, mexaniklar, activeNav, setActiveNav, setViewMexanik, onLoginReset, onLogoutReset }) {
  // ── Login form state ───────────────────────────────────────────────────────
  const [loginStation, setLoginStation] = useState('admin');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Effects ────────────────────────────────────────────────────────────────

  // Admin session check
  useEffect(() => {
    if (auth?.id !== 'admin') return;
    supabase.auth.getSession().then(({ data }) => {
      if (!data?.session) {
        setAuth(null);
        try { localStorage.removeItem('rc_auth'); localStorage.removeItem('rc_active_nav'); } catch {}
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Admin-only nav redirect
  useEffect(() => {
    const adminOnlyNav = ['stations', 'settings', 'add-relay', 'add-station', 'uchastkalar', 'add-uchastka', 'mexaniklar', 'add-mexanik', 'monthly-plan', 'activity-log'];
    if (auth && auth.id !== 'admin' && adminOnlyNav.includes(activeNav)) setActiveNav('dashboard');
  }, [auth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mexanik auth redirect
  useEffect(() => {
    if (auth?.isMexanik) setViewMexanik(auth.id);
  }, [auth]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loginLoading) return;
    setLoginLoading(true);
    setLoginError('');
    try {
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
      setLoginError(''); setLoginPassword(''); setLoginUsername('');
      if (onLoginReset) onLoginReset();
      return;
    }
    const { data, error } = await supabase.rpc('verify_station_login', { p_id: loginStation, p_username: loginUsername, p_password: loginPassword });
    const station = data?.[0];
    if (error || !station) { setLoginError(t('login.error')); return; }
    setAuth(station);
    try { localStorage.setItem('rc_auth', JSON.stringify({ id: station.id, name: station.name })); } catch {}
    setLoginError('');
    if (onLoginReset) onLoginReset();
    } catch {
      setLoginError(t('login.error'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    supabase.auth.signOut();
    setAuth(null);
    try { localStorage.removeItem('rc_auth'); localStorage.removeItem('rc_active_nav'); } catch {}
    setLoginPassword(''); setLoginUsername(''); setLoginError('');
    if (onLogoutReset) onLogoutReset();
  };

  return {
    loginStation, setLoginStation,
    loginUsername, setLoginUsername,
    loginPassword, setLoginPassword,
    loginError, setLoginError,
    showLoginPassword, setShowLoginPassword,
    loginLoading,
    handleLogin, handleLogout,
  };
}
