import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');

      // ── Dark Theme CSS Variables ──────────────────────────────────────
      root.style.setProperty('--bg-app', '#0e1621');
      root.style.setProperty('--bg-panel', '#17212b');
      root.style.setProperty('--bg-main', '#0e1621');
      root.style.setProperty('--bg-sidebar', '#17212b');
      root.style.setProperty('--bg-light', '#242f3d');
      root.style.setProperty('--bg-selected', '#2b5278');
      root.style.setProperty('--border-color', '#242f3d');
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-secondary', '#8b98a5');
      root.style.setProperty('--text-muted', '#707579');
      root.style.setProperty('--primary', '#667eea');
      root.style.setProperty('--primary-light', 'rgba(102, 126, 234, 0.15)');
      root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.3)');
      root.style.setProperty('--shadow-primary', '0 4px 15px rgba(102, 126, 234, 0.4)');
      root.style.setProperty('--bg-primary-soft', 'rgba(102, 126, 234, 0.1)');
      root.style.setProperty('--border-primary-soft', 'rgba(102, 126, 234, 0.2)');
      root.style.setProperty('--bg-green-soft', 'rgba(16, 185, 129, 0.1)');
      root.style.setProperty('--green-color', '#10b981');
      root.style.setProperty('--bg-red-soft', 'rgba(239, 68, 68, 0.1)');
      root.style.setProperty('--red-color', '#ef4444');
      root.style.setProperty('--active-bg', 'rgba(102, 126, 234, 0.15)');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');

      // ── Light Theme CSS Variables ─────────────────────────────────────
      root.style.setProperty('--bg-app', '#f0f2f5');
      root.style.setProperty('--bg-panel', '#ffffff');
      root.style.setProperty('--bg-main', '#ffffff');
      root.style.setProperty('--bg-sidebar', '#ffffff');
      root.style.setProperty('--bg-light', '#f8f9fa');
      root.style.setProperty('--bg-selected', '#e9ecef');
      root.style.setProperty('--border-color', '#dee2e6');
      root.style.setProperty('--text-main', '#1c1e21');
      root.style.setProperty('--text-secondary', '#65676b');
      root.style.setProperty('--text-muted', '#8d949e');
      root.style.setProperty('--primary', '#007bff');
      root.style.setProperty('--primary-light', 'rgba(0, 123, 255, 0.1)');
      root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.05)');
      root.style.setProperty('--shadow-primary', '0 4px 15px rgba(0, 123, 255, 0.3)');
      root.style.setProperty('--bg-primary-soft', 'rgba(0, 123, 255, 0.05)');
      root.style.setProperty('--border-primary-soft', 'rgba(0, 123, 255, 0.1)');
      root.style.setProperty('--bg-green-soft', 'rgba(40, 167, 69, 0.1)');
      root.style.setProperty('--green-color', '#28a745');
      root.style.setProperty('--bg-red-soft', 'rgba(220, 53, 69, 0.1)');
      root.style.setProperty('--red-color', '#dc3545');
      root.style.setProperty('--active-bg', 'rgba(0, 123, 255, 0.08)');
    }
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Logout failed on server:', err);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    const t = localStorage.getItem('accessToken');
    if (!t) {
      logout();
      setLoading(false);
      return;
    }
    try {
      const { user: profile } = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
      setToken(t);
    } catch (e) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (_) { }
    }
    loadUser();

    // Sync across tabs
    const handleStorageChange = (e) => {
      if (e.key === 'accessToken') {
        if (!e.newValue) {
          // Logout in another tab
          setUser(null);
          setToken(null);
          window.location.href = '/login';
        } else {
          // Token changed (login in another tab)
          // We reload to ensure a completely clean state for the new user
          window.location.reload();
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Heartbeat for Active Status
    const interval = setInterval(() => {
      if (localStorage.getItem('accessToken')) {
        api.heartbeat();
      }
    }, 3 * 60 * 1000); // 3 minutes

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadUser]);

  const login = useCallback((data) => {
    const { accessToken, user: u } = data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('user', JSON.stringify(u));
    setToken(accessToken);
    setUser(u);
  }, []);

  const isAdmin = Boolean(user?.roles?.length && user.roles.some(r => {
    const roleName = typeof r === 'string' ? r : r.name;
    const match = roleName === 'Admin';
    if (match) console.log("[DEBUG] AuthContext: Found Admin role");
    return match;
  }));

  const isManager = Boolean(user?.roles?.length && user.roles.some(r => {
    const roleName = typeof r === 'string' ? r : r.name;
    const match = roleName === 'Manager' || roleName === 'Admin';
    if (match) console.log("[DEBUG] AuthContext: Found Manager/Admin role:", roleName);
    return match;
  }));
  
  if (user) {
    console.log("[DEBUG] AuthContext: Current user roles:", user.roles.map(r => typeof r === 'string' ? r : r.name));
    console.log("[DEBUG] AuthContext: Derived suggests - isAdmin:", isAdmin, "isManager:", isManager);
  }

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    loadUser,
    isAdmin,
    isManager,
    darkMode,
    setDarkMode,
    toggleDarkMode,
    isAuthenticated: Boolean(token && user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
