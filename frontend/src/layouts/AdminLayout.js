// src/layouts/AdminLayout.js
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import E2EESecurityGate from '../components/Auth/E2EESecurityGate';
import '../styles/admin.css';

const navItems = [
  { to: '/admin/dashboard', icon: 'bx bxs-dashboard',          label: 'Dashboard' },
  { to: '/user/home',       icon: 'bx bxs-message-square-detail', label: 'Secure Messenger' },
  { to: '/admin/logs',      icon: 'bx bx-list-ul',             label: 'System Logs' },
  { to: '/admin/users',     icon: 'bx bxs-user-account',       label: 'User Management' },
  { to: '/admin/network',   icon: 'bx bx-pulse',               label: 'Network Traffic' },
  { to: '/admin/rules',     icon: 'bx bx-shield-quarter',      label: 'Security Rules' },
  { to: '/admin/settings',  icon: 'bx bxs-cog',                label: 'Settings' },
];

const breadcrumbMap = {
  '/admin/dashboard': ['Admin', 'Overview'],
  '/admin/logs':      ['System', 'Audit Logs'],
  '/admin/users':     ['Admin', 'User Management'],
  '/admin/network':   ['System', 'Network Traffic'],
  '/admin/rules':     ['System', 'Security Rules'],
  '/admin/settings':  ['Admin', 'Settings'],
  '/user/home':       ['Admin', 'Secure Messenger'],
};

export default function AdminLayout() {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const consoleEndRef = useRef(null);

  const [isMobileOpen,  setIsMobileOpen]  = useState(false);
  const [isNotifOpen,   setIsNotifOpen]   = useState(false);
  const [isHelpOpen,    setIsHelpOpen]    = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);
  const [consoleInput,  setConsoleInput]  = useState('');
  const [consoleHistory, setConsoleHistory] = useState([
    { type: 'output', content: 'KTT01 v2.4.0 Secure Shell | Node: secure-node-01' },
    { type: 'output', content: 'Connection established via TLS 1.3. Identity verified.' },
    { type: 'output', content: 'Type "help" to see available commands.' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'CRITICAL', title: 'Brute Force Detected',   time: '2 mins ago',   icon: 'bx-error-alt',       color: '#f87171',  read: false },
    { id: 2, type: 'HIGH',     title: 'MFA Bypass Attempt',     time: '15 mins ago',  icon: 'bx-shield-quarter',  color: '#fbbf24',  read: false },
    { id: 3, type: 'INFO',     title: 'System Backup Complete', time: '1 hour ago',   icon: 'bx-check-circle',    color: '#10b981',  read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;
  const breadcrumb   = breadcrumbMap[location.pathname] || ['Admin', 'Dashboard'];

  // Apply dark/light mode class on body
  useEffect(() => {
    document.body.classList.toggle('light', !darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (isConsoleOpen) consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [consoleHistory, isConsoleOpen]);

  // Close panels on outside click
  useEffect(() => {
    const close = () => { setIsNotifOpen(false); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleConsoleSubmit = (e) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;
    const cmd = consoleInput.toLowerCase().trim();
    const hist = [...consoleHistory, { type: 'command', content: consoleInput }];

    switch (cmd) {
      case 'help':
        hist.push({ type: 'output', content: 'Commands: help, status, whoami, clear, ls, netstat, exit' });
        break;
      case 'status':
        hist.push({ type: 'output', content: 'SYSTEM STATUS: [OK]' });
        hist.push({ type: 'output', content: 'CPU: 12% | RAM: 4.2GB/16GB | DISK: 24% used' });
        hist.push({ type: 'output', content: 'Firewall: Active | IDS: 4 blocks/hr' });
        break;
      case 'whoami':
        hist.push({ type: 'output', content: `User: ${user?.firstName} ${user?.lastName} (Super Admin)` });
        hist.push({ type: 'output', content: 'Access Level: ROOT_ACCESS' });
        break;
      case 'clear':
        setConsoleHistory([{ type: 'output', content: 'Terminal cleared.' }]);
        setConsoleInput('');
        return;
      case 'ls':
        hist.push({ type: 'output', content: 'bin  etc  home  lib  logs  root  tmp  usr  var' });
        break;
      case 'netstat':
        hist.push({ type: 'output', content: 'Active: TCP 192.168.1.5:443 ESTABLISHED | TCP 127.0.0.1:5432 LISTEN' });
        break;
      case 'exit':
        setIsConsoleOpen(false);
        return;
      default:
        hist.push({ type: 'output', content: `Command not found: ${cmd}` });
    }
    setConsoleHistory(hist);
    setConsoleInput('');
  };

  // ── Stop propagation from notif button to document listener
  const handleNotifClick = (e) => {
    e.stopPropagation();
    setIsNotifOpen(p => !p);
  };

  return (
    <div className="admin-dashboard-container">

      {/* ── Mobile overlay ── */}
      {isMobileOpen && <div className="admin-sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      {/* ── Help Modal ── */}
      {isHelpOpen && (
        <div className="soc-modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="soc-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bx bx-help-circle" /> KTT01 Security Documentation</h3>
              <button className="close-modal" onClick={() => setIsHelpOpen(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="modal-content">
              {[
                { title: 'Threat Level Indicators', body: 'The system uses 3 tiers: Secure (Green), Warning (Amber), and Critical (Red). Critical threats trigger automatic session termination for non-privileged IPs.' },
                { title: 'Attack Vectors Analysis', body: 'Monitors patterns for SQLi, XSS, and Brute Force. DDoS attempts are mitigated by the global firewall edge.' },
                { title: 'Response Protocol', body: 'In case of a breach, use Run Diagnostics to purge unauthorized session tokens and re-encrypt the audit log chain.' },
              ].map((s, i) => (
                <div className="doc-section" key={i}>
                  <h4>{s.title}</h4>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Console Modal ── */}
      {isConsoleOpen && (
        <div className="soc-modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="soc-modal console-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className="bx bx-laptop" /> Remote Admin Console: secure-node-01</h3>
              <button className="close-modal" onClick={() => setIsConsoleOpen(false)}><i className="bx bx-x" /></button>
            </div>
            <div className="console-body">
              {consoleHistory.map((line, idx) => (
                <div key={idx} className="console-line">
                  {line.type === 'command' && <span className="c-prompt">root@ktt01:~$</span>}
                  <span className={line.type === 'output' ? 'c-output' : ''}>{line.content}</span>
                </div>
              ))}
              <form onSubmit={handleConsoleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                <span className="c-prompt">root@ktt01:~$</span>
                <input
                  autoFocus
                  type="text"
                  value={consoleInput}
                  onChange={e => setConsoleInput(e.target.value)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: '#e6edf3', fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '13px', outline: 'none', flex: 1,
                  }}
                />
              </form>
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          SIDEBAR
      ════════════════════════════════ */}
      <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>

        {/* Brand */}
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <img
              src="/ktt01_logo_square.png"
              alt="KTT01"
              style={{ width: '24px', height: '24px', borderRadius: '6px', position: 'relative', zIndex: 1 }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.3px', color: 'var(--text-main)' }}>KTT01</span>
            <span style={{ fontSize: '9px', color: 'var(--primary)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>v2 · ADMIN</span>
          </div>
        </div>

        {/* Nav label */}
        <div style={{ padding: '12px 20px 4px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
          Navigation
        </div>

        {/* Nav */}
        <nav className="nav-list">
          {navItems.map(item => (
            <div className="nav-item" key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                <i className={item.icon} />
                <span>{item.label}</span>
              </NavLink>
            </div>
          ))}
        </nav>

        {/* User card + logout */}
        <div className="admin-user-card-container">
          <div className="admin-user-card">
            <div className="admin-avatar">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (user?.firstName?.charAt(0) || 'A')
              }
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleLogout}>
            <i className="bx bx-log-out" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ════════════════════════════════
          MAIN BODY
      ════════════════════════════════ */}
      <E2EESecurityGate>
        <div className="admin-body">

          {/* Top header */}
          <header className="admin-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <button className="admin-mobile-toggle" onClick={() => setIsMobileOpen(p => !p)}>
                <i className={`bx ${isMobileOpen ? 'bx-x' : 'bx-menu'}`} />
              </button>

              {/* Breadcrumb */}
              <div className="admin-breadcrumb">
                <span style={{ color: 'var(--text-muted)' }}>{breadcrumb[0]}</span>
                <i className="bx bx-chevron-right" style={{ fontSize: '14px', color: 'var(--text-muted)' }} />
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{breadcrumb[1]}</span>
              </div>
            </div>

            {/* Right actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

              {/* Context search / live badge */}
              {location.pathname === '/admin/dashboard' && (
                <div className="search-container">
                  <i className="bx bx-search" />
                  <input type="text" className="search-input" placeholder="Search IP, Log ID, User..." />
                </div>
              )}

              {location.pathname === '/admin/logs' && (
                <div className="live-badge">
                  <div className="live-dot" />
                  LIVE MONITORING
                </div>
              )}

              {/* Notification bell */}
              <div className="notif-wrapper">
                <div
                  className={`notif-bell-btn ${isNotifOpen ? 'active' : ''}`}
                  onClick={handleNotifClick}
                >
                  <i className="bx bx-bell" style={{ fontSize: '20px', color: isNotifOpen ? 'var(--primary)' : 'var(--text-secondary)' }} />
                  {unreadCount > 0 && (
                    <div style={{
                      position: 'absolute', top: '6px', right: '6px',
                      width: '8px', height: '8px',
                      background: 'var(--red-color)',
                      borderRadius: '50%', border: '2px solid var(--bg-main)',
                      boxShadow: '0 0 8px var(--red-color)',
                    }} />
                  )}
                </div>

                {isNotifOpen && (
                  <div className="notif-dropdown" onClick={e => e.stopPropagation()}>
                    <div className="notif-header">
                      <span>Notifications</span>
                      <button
                        onClick={() => setNotifications(n => n.map(x => ({ ...x, read: true })))}
                        style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}
                      >Mark all read</button>
                    </div>
                    <div className="notif-list">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`}>
                          <div className="notif-icon" style={{ background: `${n.color}18`, color: n.color }}>
                            <i className={`bx ${n.icon}`} />
                          </div>
                          <div className="notif-info">
                            <div className="notif-title">{n.title}</div>
                            <div className="notif-time">{n.time}</div>
                          </div>
                        </div>
                      )) : (
                        <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                          <i className="bx bx-check-double" style={{ fontSize: '32px', marginBottom: '8px', display: 'block', color: 'var(--green-color)' }} />
                          All clear! No alerts.
                        </div>
                      )}
                    </div>
                    <div className="notif-footer">
                      <button className="notif-clear-btn" onClick={() => { setNotifications([]); setIsNotifOpen(false); }}>Clear All</button>
                      <button className="notif-view-all" onClick={() => { navigate('/admin/logs'); setIsNotifOpen(false); }}>View All Logs</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Dark / Light toggle */}
              <button
                onClick={toggleDarkMode}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                style={{
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: darkMode ? '#fbbf24' : '#6366f1',
                  transition: 'all 0.2s',
                }}
              >
                <i className={`bx ${darkMode ? 'bx-sun' : 'bx-moon'}`} style={{ fontSize: '17px' }} />
              </button>

              {/* Context action (help / console) */}
              <button
                onClick={() => location.pathname === '/admin/logs' ? setIsConsoleOpen(true) : setIsHelpOpen(true)}
                style={{
                  background: 'var(--bg-light)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  width: '36px', height: '36px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: 'var(--text-secondary)',
                  transition: 'all 0.2s',
                }}
              >
                <i className={`bx ${location.pathname === '/admin/logs' ? 'bx-laptop' : 'bx-help-circle'}`} style={{ fontSize: '17px' }} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="admin-main-content">
            <Outlet />
          </main>
        </div>
      </E2EESecurityGate>
    </div>
  );
}
