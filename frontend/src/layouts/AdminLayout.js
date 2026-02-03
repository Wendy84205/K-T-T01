// src/layouts/AdminLayout.js
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/admin.css';

const navItems = [
  { to: '/admin/dashboard', icon: 'bx bxs-dashboard', label: 'Dashboard' },
  { to: '/admin/logs', icon: 'bx bx-list-ul', label: 'System Logs' },
  { to: '/admin/users', icon: 'bx bxs-user-account', label: 'User Management' },
  { to: '/admin/network', icon: 'bx bx-pulse', label: 'Network Traffic' },
  { to: '/admin/rules', icon: 'bx bx-shield-quarter', label: 'Security Rules' },
  { to: '/admin/settings', icon: 'bx bxs-cog', label: 'Settings' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const consoleEndRef = useRef(null);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const [consoleInput, setConsoleInput] = useState('');
  const [consoleHistory, setConsoleHistory] = useState([
    { type: 'output', content: 'SENTINEL v2.4.0 Secure Shell - Node: secure-node-01' },
    { type: 'output', content: 'Connection established via TLS 1.3. Identity verified.' },
    { type: 'output', content: 'Type "help" to see available commands.' },
  ]);

  const [notifications, setNotifications] = useState([
    { id: 1, type: 'CRITICAL', title: 'Brute Force Detected', time: '2 mins ago', icon: 'bx-error-alt', color: 'var(--accent-red)', read: false },
    { id: 2, type: 'HIGH', title: 'MFA Bypass Attempt', time: '15 mins ago', icon: 'bx-shield-quarter', color: 'var(--accent-amber)', read: false },
    { id: 3, type: 'INFO', title: 'System Backup Complete', time: '1 hour ago', icon: 'bx-check-circle', color: 'var(--accent-emerald)', read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isConsoleOpen) {
      scrollToBottom();
    }
  }, [consoleHistory, isConsoleOpen]);

  const scrollToBottom = () => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const clearNotifications = () => {
    setNotifications([]);
    setIsNotifOpen(false);
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const getPageTitle = () => {
    if (location.pathname === '/admin/dashboard') return 'Overview';
    if (location.pathname === '/admin/logs') return 'Audit Logs';
    if (location.pathname === '/admin/users') return 'User Management';
    return 'SOC Dashboard';
  };

  const handleContextAction = () => {
    if (location.pathname === '/admin/dashboard') {
      setIsHelpOpen(true);
    } else if (location.pathname === '/admin/logs') {
      setIsConsoleOpen(true);
    }
  };

  const handleConsoleSubmit = (e) => {
    e.preventDefault();
    if (!consoleInput.trim()) return;

    const cmd = consoleInput.toLowerCase().trim();
    const newHistory = [...consoleHistory, { type: 'command', content: consoleInput }];

    // Processing commands
    switch (cmd) {
      case 'help':
        newHistory.push({ type: 'output', content: 'Available commands: help, status, whoami, clear, ls, netstat, exit' });
        break;
      case 'status':
        newHistory.push({ type: 'output', content: 'SYSTEM STATUS: [OK]' });
        newHistory.push({ type: 'output', content: 'CPU: 12% | RAM: 4.2GB/16GB | DISK: 24% used' });
        newHistory.push({ type: 'output', content: 'Firewall: Active | Intrusion Detection: 4 blocks/hr' });
        break;
      case 'whoami':
        newHistory.push({ type: 'output', content: `Current User: ${user?.firstName} ${user?.lastName} (Super Admin)` });
        newHistory.push({ type: 'output', content: `Access Level: ROOT_ACCESS` });
        break;
      case 'clear':
        setConsoleHistory([{ type: 'output', content: 'Terminal cleared.' }]);
        setConsoleInput('');
        return;
      case 'ls':
        newHistory.push({ type: 'output', content: 'bin  etc  home  lib  logs  root  tmp  usr  var' });
        break;
      case 'netstat':
        newHistory.push({ type: 'output', content: 'Active Connections:' });
        newHistory.push({ type: 'output', content: 'TCP  192.168.1.5:443  ESTABLISHED' });
        newHistory.push({ type: 'output', content: 'TCP  127.0.0.1:5432   LISTEN' });
        break;
      case 'exit':
        setIsConsoleOpen(false);
        break;
      default:
        newHistory.push({ type: 'output', content: `Command not found: ${cmd}. Type "help" for options.` });
    }

    setConsoleHistory(newHistory);
    setConsoleInput('');
  };

  return (
    <div className="admin-dashboard-container">
      {/* Modals & Overlays */}
      {isMobileOpen && <div className="admin-sidebar-overlay" onClick={() => setIsMobileOpen(false)} />}

      {/* Help Documentation Modal */}
      {isHelpOpen && (
        <div className="soc-modal-overlay" onClick={() => setIsHelpOpen(false)}>
          <div className="soc-modal help-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className='bx bx-help-circle'></i> SOC Security Documentation</h3>
              <button className="close-modal" onClick={() => setIsHelpOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            <div className="modal-content">
              <div className="doc-section">
                <h4>Threat Level Indicators</h4>
                <p>The system uses 3 tiers of threat evaluation: <strong>Secure</strong> (Green), <strong>Warning</strong> (Amber), and <strong>Critical</strong> (Red). Critical threats trigger automatic session termination for non-privileged IPs.</p>
              </div>
              <div className="doc-section">
                <h4>Attack Vectors Analysis</h4>
                <p>Monitors patterns for SQLi, XSS, and Brute Force. Distributed Denial of Service (DDoS) attempts are mitigated by the global firewall edge.</p>
              </div>
              <div className="doc-section">
                <h4>Response Protocol</h4>
                <p>In case of a breach, use the <strong>Run Diagnostics</strong> tool to purge unauthorized session tokens and re-encrypt the audit log chain.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Remote Console Modal */}
      {isConsoleOpen && (
        <div className="soc-modal-overlay" onClick={() => setIsConsoleOpen(false)}>
          <div className="soc-modal console-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><i className='bx bx-laptop'></i> Remote Admin Console: secure-node-01</h3>
              <button className="close-modal" onClick={() => setIsConsoleOpen(false)}><i className='bx bx-x'></i></button>
            </div>
            <div className="console-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {consoleHistory.map((line, idx) => (
                <div key={idx} className="console-line">
                  {line.type === 'command' && <span className="c-prompt">root@sentinel:~$</span>}
                  <span className={line.type === 'output' ? 'c-output' : ''}>{line.content}</span>
                </div>
              ))}
              <form onSubmit={handleConsoleSubmit} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="c-prompt">root@sentinel:~$</span>
                <input
                  autoFocus
                  type="text"
                  className="console-input"
                  value={consoleInput}
                  onChange={(e) => setConsoleInput(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    outline: 'none',
                    flex: 1
                  }}
                />
              </form>
              <div ref={consoleEndRef} />
            </div>
          </div>
        </div>
      )}

      {/* Premium Sidebar */}
      <aside className={`admin-sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-logo">
          <div className="admin-logo-icon">
            <i className='bx bxs-shield-alt-2' style={{ color: 'white', fontSize: '20px' }}></i>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>SENTINEL</span>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '600' }}>v2.4.0 ADMIN</span>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <div className="nav-item" key={item.to}>
              <NavLink to={item.to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`} onClick={() => setIsMobileOpen(false)}>
                <i className={item.icon} style={{ fontSize: '20px' }}></i>
                <span>{item.label}</span>
              </NavLink>
            </div>
          ))}
        </nav>

        <div className="admin-user-card-container">
          <div className="admin-user-card">
            <div className="admin-avatar" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user?.firstName?.charAt(0) || 'A'
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={`${user?.firstName} ${user?.lastName}`}>
                {user?.firstName} {user?.lastName}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={user?.email}>
                {user?.email}
              </span>
            </div>
          </div>
          <button className="sign-out-btn" onClick={handleLogout}>
            <i className='bx bx-log-out'></i>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <div className="admin-body">
        <header className="admin-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              className="admin-mobile-toggle"
              onClick={toggleSidebar}
            >
              <i className={`bx ${isMobileOpen ? 'bx-x' : 'bx-menu'}`}></i>
            </button>
            <div className="admin-breadcrumb">
              {location.pathname === '/admin/logs' ? (
                <>System <span style={{ margin: '0 4px', opacity: 0.5 }}>›</span> <span style={{ color: '#58a6ff' }}>Audit Logs</span></>
              ) : (
                <>Admin <span style={{ margin: '0 4px', opacity: 0.5 }}>›</span> <span style={{ color: '#58a6ff' }}>{getPageTitle()}</span></>
              )}
            </div>
          </div>

          <div className="admin-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {location.pathname === '/admin/dashboard' ? (
              <div className="search-container">
                <i className='bx bx-search'></i>
                <input type="text" className="search-input" placeholder="Search IP, Log ID, User..." />
              </div>
            ) : location.pathname === '/admin/logs' ? (
              <div className="live-badge" style={{ margin: 0 }}>
                <div className="live-dot"></div>
                LIVE MONITORING
              </div>
            ) : null}

            <div className="notif-wrapper" style={{ position: 'relative' }}>
              <div
                className={`notif-bell-btn ${isNotifOpen ? 'active' : ''}`}
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                style={{ position: 'relative', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'all 0.2s' }}
              >
                <i className='bx bx-bell' style={{ fontSize: '22px', color: isNotifOpen ? 'var(--accent-blue)' : 'var(--text-secondary)' }}></i>
                {unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', background: 'var(--accent-red)', borderRadius: '50%', border: '2px solid #030712', boxShadow: '0 0 10px var(--accent-red)' }}></div>
                )}
              </div>

              {isNotifOpen && (
                <div className="notif-dropdown">
                  <div className="notif-header">
                    <span>Notifications</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button onClick={markAllRead} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', fontSize: '11px', cursor: 'pointer', fontWeight: '600' }}>Mark all read</button>
                    </div>
                  </div>
                  <div className="notif-list">
                    {notifications.length > 0 ? notifications.map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`}>
                        <div className="notif-icon" style={{ background: `${n.color}20`, color: n.color }}>
                          <i className={`bx ${n.icon}`}></i>
                        </div>
                        <div className="notif-info">
                          <div className="notif-title">{n.title}</div>
                          <div className="notif-time">{n.time}</div>
                        </div>
                      </div>
                    )) : (
                      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <i className='bx bx-check-double' style={{ fontSize: '32px', marginBottom: '8px', display: 'block' }}></i>
                        All clear! No alerts.
                      </div>
                    )}
                  </div>
                  <div className="notif-footer">
                    <button className="notif-clear-btn" onClick={clearNotifications}>Clear All</button>
                    <button
                      className="notif-view-all"
                      onClick={() => {
                        navigate('/admin/logs');
                        setIsNotifOpen(false);
                      }}
                    >
                      View All Logs
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{ cursor: 'pointer', color: '#8b949e', display: 'flex' }}
              onClick={handleContextAction}
            >
              <i className={`bx ${location.pathname === '/admin/logs' ? 'bx-laptop' : 'bx-help-circle'}`} style={{ fontSize: '22px' }}></i>
            </div>
          </div>
        </header>

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
