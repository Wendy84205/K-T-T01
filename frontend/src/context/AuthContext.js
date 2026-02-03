import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken'));
  const [loading, setLoading] = useState(true);

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

    // Heartbeat for Active Status
    const interval = setInterval(() => {
      if (localStorage.getItem('accessToken')) {
        api.heartbeat();
      }
    }, 3 * 60 * 1000); // 3 minutes

    return () => clearInterval(interval);
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
    return roleName === 'Admin';
  }));

  const isManager = Boolean(user?.roles?.length && user.roles.some(r => {
    const roleName = typeof r === 'string' ? r : r.name;
    return roleName === 'Manager';
  }));

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    loadUser,
    isAdmin,
    isManager,
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
