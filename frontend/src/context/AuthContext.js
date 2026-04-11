import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

// FIX LỖ HỔNG 7: accessToken chỉ lưu trong bộ nhớ (module-level ref)
// Không dùng localStorage → XSS không thể đánh cắp token qua localStorage.getItem()
// Thay thế: Refresh Token (HttpOnly cookie) sẽ phục hồi access token sau khi reload trang
let _inMemoryToken = null;

export function getInMemoryToken() {
  return _inMemoryToken;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    try {
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  // FIX LỖ HỔNG 7: token chỉ sống trong React state (không ghi ra localStorage)
  const [token, setToken] = useState(null);
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
      // FIX LỖ HỔNG 7: Xóa token trong memory, KHÔNG còn trong localStorage
      _inMemoryToken = null;
      localStorage.removeItem('user');
      sessionStorage.removeItem('e2ee_session_pk');
      setToken(null);
      setUser(null);
    }
  }, []);

  const loadUser = useCallback(async () => {
    try {
      // FIX LỖ HỔNG 7: Thay vì đọc từ localStorage, gọi /auth/refresh để lấy token mới
      // Backend dùng HttpOnly cookie (refresh_token) để cấp lại access token
      const refreshData = await api.refreshToken();
      const newToken = refreshData?.accessToken;
      if (!newToken) {
        setLoading(false);
        return;
      }
      _inMemoryToken = newToken;
      setToken(newToken);

      const { user: profile } = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(profile));
      setUser(profile);
    } catch (e) {
      // Refresh thất bại = chưa đăng nhập hoặc phiên hết hạn
      _inMemoryToken = null;
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) {
      try {
        setUser(JSON.parse(u));
      } catch (_) { }
    }
    loadUser();

    // FIX LỖ HỔNG 7: Không còn lắng nghe sự kiện 'accessToken' từ localStorage
    // Tab sync không cần thiết vì token không còn trong localStorage
    // Nếu cần đồng bộ logout nhiều tab, dùng BroadcastChannel
    const bc = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('auth_sync') : null;
    if (bc) {
      bc.onmessage = (e) => {
        if (e.data === 'logout') {
          _inMemoryToken = null;
          setToken(null);
          setUser(null);
          window.location.href = '/login';
        }
      };
    }

    // Heartbeat for Active Status — dùng in-memory token thay vì localStorage
    const interval = setInterval(() => {
      if (_inMemoryToken) {
        api.heartbeat();
      }
    }, 3 * 60 * 1000); // 3 minutes

    return () => {
      clearInterval(interval);
      if (bc) bc.close();
    };
  }, [loadUser]);

  const login = useCallback((data) => {
    const { accessToken, user: u } = data;
    // FIX LỖ HỔNG 7: Token chỉ lưu trong memory, KHÔNG ghi ra localStorage
    _inMemoryToken = accessToken;
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
