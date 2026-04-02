import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, MessageSquare, Users, Layers,
    FileText, BarChart3, LogOut, Bell, Settings,
    Loader2, Sun, Moon, ChevronRight
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import E2EESecurityGate from '../components/Auth/E2EESecurityGate';

const navItems = [
    { id: 'overview',  label: 'Command Hub',        icon: <LayoutDashboard size={18} />, path: '/manage/dashboard' },
    { id: 'chat',      label: 'Secure Messenger',   icon: <MessageSquare size={18} />,   path: '/manage/chat' },
    { id: 'team',      label: 'Intelligence Team',  icon: <Users size={18} />,           path: '/manage/team' },
    { id: 'projects',  label: 'Asset Repository',   icon: <Layers size={18} />,         path: '/manage/projects' },
    { id: 'docs',      label: 'Intelligence Vault', icon: <FileText size={18} />,       path: '/manage/documents' },
    { id: 'reports',   label: 'Opex Metrics',       icon: <BarChart3 size={18} />,      path: '/manage/reports' },
];

export default function ManageLayout() {
    const { darkMode, toggleDarkMode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu,   setShowProfileMenu]   = useState(false);
    const [user,              setUser]              = useState(null);
    const [notifications,     setNotifications]     = useState([]);
    const [loading,           setLoading]           = useState(true);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [profileRes, notifyRes] = await Promise.all([
                    api.getProfile(),
                    api.getNotifications(1, 5),
                ]);
                setUser(profileRes.user || profileRes);
                const notificationData = notifyRes?.data || notifyRes?.notifications || (Array.isArray(notifyRes) ? notifyRes : []);
                setNotifications(notificationData);
            } catch (err) {
                console.error('Failed to load layout data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Apply dark/light body class
    useEffect(() => {
        document.body.classList.toggle('light', !darkMode);
    }, [darkMode]);

    // Close menus on outside click
    useEffect(() => {
        const close = () => { setShowNotifications(false); setShowProfileMenu(false); };
        document.addEventListener('click', close);
        return () => document.removeEventListener('click', close);
    }, []);

    const handleLogout = () => {
        if (window.confirm('Terminate secure session?')) {
            localStorage.clear();
            navigate('/login');
        }
    };

    const unreadCount = notifications.length;

    return (
        <div style={{
            display: 'flex', height: '100vh', width: '100vw',
            background: 'var(--bg-app)', color: 'var(--text-main)',
            overflow: 'hidden', fontFamily: "'Inter', -apple-system, sans-serif",
        }}>

            {/* ════════════════ SIDEBAR ════════════════ */}
            <aside style={{
                width: '256px', flexShrink: 0,
                background: 'var(--bg-main)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column',
                zIndex: 100,
                transition: 'background 0.3s',
            }}>

                {/* Brand */}
                <div style={{
                    padding: '20px 20px 16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    borderBottom: '1px solid var(--border-color)',
                    flexShrink: 0,
                }}>
                    <div style={{
                        width: '38px', height: '38px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, #818cf8 100%)',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
                        flexShrink: 0, position: 'relative', overflow: 'hidden',
                    }}>
                        <img
                            src="/ktt01_logo_square.png"
                            alt="KTT01"
                            style={{ width: '24px', height: '24px', borderRadius: '6px', zIndex: 1, position: 'relative' }}
                            onError={e => { e.target.style.display = 'none'; }}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>KTT01</div>
                        <div style={{ fontSize: '9px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Manager Console</div>
                    </div>
                </div>

                {/* Section label */}
                <div style={{ padding: '14px 20px 6px', fontSize: '9px', fontWeight: 800, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Strategic Operations
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto' }}>
                    {navItems.map(item => {
                        const isActive = location.pathname.startsWith(item.path);
                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '11px',
                                    padding: '10px 14px', borderRadius: '10px',
                                    textDecoration: 'none', transition: 'all 0.2s',
                                    background: isActive ? 'var(--primary-light)' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? 700 : 600,
                                    fontSize: '13px',
                                    border: `1px solid ${isActive ? 'var(--primary-border)' : 'transparent'}`,
                                    position: 'relative',
                                }}
                            >
                                {/* Active left bar */}
                                {isActive && (
                                    <div style={{
                                        position: 'absolute', left: 0, top: '20%', height: '60%',
                                        width: '3px', background: 'var(--primary)',
                                        borderRadius: '0 4px 4px 0',
                                        boxShadow: '0 0 8px var(--primary)',
                                    }} />
                                )}
                                <span style={{ opacity: isActive ? 1 : 0.7, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {isActive && <ChevronRight size={12} />}
                            </NavLink>
                        );
                    })}
                </nav>


            </aside>

            {/* ════════════════ MAIN BODY ════════════════ */}
            <E2EESecurityGate>
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', minWidth: 0 }}>

                    {/* Ambient glow decoration */}
                    <div style={{
                        position: 'absolute', top: '-5%', right: '-5%',
                        width: '350px', height: '350px',
                        background: 'var(--primary)', filter: 'blur(180px)', opacity: 0.04,
                        borderRadius: '50%', zIndex: 0, pointerEvents: 'none',
                    }} />

                    {/* ── Top Header ── */}
                    <header style={{
                        height: '64px', padding: '0 28px',
                        background: 'var(--bg-main)',
                        backdropFilter: 'blur(12px)',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        position: 'sticky', top: 0, zIndex: 100, flexShrink: 0,
                    }}>
                        {/* Left: status indicator */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--green-color)', boxShadow: '0 0 8px var(--green-color)', animation: 'pulse 2s infinite' }} />
                                <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Secure</span>
                            </div>
                            <div style={{ width: '1px', height: '16px', background: 'var(--border-color)' }} />
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Manager Console'}
                            </span>
                        </div>

                        {/* Right actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                            {/* Dark/Light toggle */}
                            <button
                                onClick={e => { e.stopPropagation(); toggleDarkMode(); }}
                                style={{
                                    width: '36px', height: '36px',
                                    background: 'var(--bg-light)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: darkMode ? '#fbbf24' : '#6366f1',
                                    transition: 'all 0.2s', flexShrink: 0,
                                }}
                                title={darkMode ? 'Light Mode' : 'Dark Mode'}
                            >
                                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
                            </button>

                            {/* Settings shortcut */}
                            <button
                                onClick={e => { e.stopPropagation(); navigate('/manage/settings'); }}
                                style={{
                                    width: '36px', height: '36px',
                                    background: 'var(--bg-light)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '10px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--text-secondary)', transition: 'all 0.2s', flexShrink: 0,
                                }}
                            >
                                <Settings size={15} />
                            </button>

                            {/* Notification bell */}
                            <div style={{ position: 'relative' }}>
                                <button
                                    onClick={e => { e.stopPropagation(); setShowNotifications(p => !p); setShowProfileMenu(false); }}
                                    style={{
                                        width: '36px', height: '36px',
                                        background: showNotifications ? 'var(--primary-light)' : 'var(--bg-light)',
                                        border: `1px solid ${showNotifications ? 'var(--primary-border)' : 'var(--border-color)'}`,
                                        borderRadius: '10px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: showNotifications ? 'var(--primary)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s', position: 'relative', flexShrink: 0,
                                    }}
                                >
                                    <Bell size={15} />
                                    {unreadCount > 0 && (
                                        <div style={{
                                            position: 'absolute', top: '6px', right: '6px',
                                            width: '8px', height: '8px',
                                            background: 'var(--red-color)', borderRadius: '50%',
                                            border: '2px solid var(--bg-main)',
                                            boxShadow: '0 0 6px var(--red-color)',
                                        }} />
                                    )}
                                </button>

                                {showNotifications && (
                                    <div
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                            width: '300px', background: 'var(--bg-panel)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '16px', boxShadow: 'var(--shadow-lg)',
                                            zIndex: 1001, overflow: 'hidden',
                                            animation: 'slideDown 0.2s ease',
                                        }}
                                    >
                                        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: 700, fontSize: '13px' }}>Alert Center</span>
                                            {unreadCount > 0 && (
                                                <span style={{ fontSize: '10px', background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '100px', fontWeight: 700 }}>
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                                                    No active alerts
                                                </div>
                                            ) : notifications.map((n, i) => (
                                                <div key={n.id || i} style={{
                                                    display: 'flex', gap: '12px', padding: '14px 18px',
                                                    borderBottom: '1px solid var(--border-color)',
                                                    alignItems: 'flex-start',
                                                    transition: 'background 0.15s', cursor: 'pointer',
                                                }}>
                                                    <div style={{ width: '8px', height: '8px', background: n.type === 'error' ? 'var(--red-color)' : 'var(--green-color)', borderRadius: '50%', marginTop: '5px', flexShrink: 0 }} />
                                                    <div>
                                                        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>{n.title}</div>
                                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{n.message || n.content || ''}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                style={{ flex: 1, padding: '8px', background: 'var(--bg-light)', border: 'none', borderRadius: '8px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Divider */}
                            <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }} />

                            {/* Profile */}
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={e => { e.stopPropagation(); setShowProfileMenu(p => !p); setShowNotifications(false); }}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: '10px',
                                        cursor: 'pointer', padding: '5px 8px',
                                        background: showProfileMenu ? 'var(--bg-light)' : 'transparent',
                                        borderRadius: '10px', transition: 'all 0.2s',
                                        border: '1px solid transparent',
                                        borderColor: showProfileMenu ? 'var(--border-color)' : 'transparent',
                                    }}
                                >
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
                                            {user ? `${user.firstName} ${user.lastName}` : 'Manager Unit'}
                                        </div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                                            Manager
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '34px', height: '34px', borderRadius: '10px',
                                        background: 'linear-gradient(135deg, var(--primary), #818cf8)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', fontSize: '14px', fontWeight: 800, flexShrink: 0,
                                    }}>
                                        {loading ? <Loader2 size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> : (user?.firstName?.charAt(0) || 'M')}
                                    </div>
                                </div>

                                {showProfileMenu && (
                                    <div
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                                            width: '210px', background: 'var(--bg-panel)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '14px', boxShadow: 'var(--shadow-lg)',
                                            zIndex: 1001, overflow: 'hidden',
                                            animation: 'slideDown 0.2s ease',
                                        }}
                                    >
                                        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-color)' }}>
                                            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '2px' }}>
                                                {user ? `${user.firstName} ${user.lastName}` : 'Manager'}
                                            </div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{user?.email || ''}</div>
                                        </div>
                                        <div style={{ padding: '8px' }}>
                                            <button
                                                onClick={() => { navigate('/manage/settings'); setShowProfileMenu(false); }}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '8px', textAlign: 'left', transition: 'all 0.2s', fontFamily: 'inherit' }}
                                            >
                                                <Settings size={14} /> Settings
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', background: 'var(--red-soft)', border: 'none', color: 'var(--red-color)', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '8px', textAlign: 'left', marginTop: '4px', fontFamily: 'inherit' }}
                                            >
                                                <LogOut size={14} /> Terminate Session
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </header>

                    {/* ── Page content ── */}
                    <div style={{ flex: 1, overflow: 'auto', position: 'relative', zIndex: 1 }}>
                        <Outlet />
                    </div>
                </main>
            </E2EESecurityGate>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-8px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.6; }
                }
            `}</style>
        </div>
    );
}
