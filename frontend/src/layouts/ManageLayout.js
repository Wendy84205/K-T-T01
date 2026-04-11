import React, { useState, useEffect, useCallback } from 'react';
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
    const [unreadCount,       setUnreadCount]       = useState(0);
    const [loading,           setLoading]           = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await api.getNotifications(1, 10);
            // Backend ResponseInterceptor unwraps: shape is { items, total, unreadCount }
            const items = res?.items || res?.data || (Array.isArray(res) ? res : []);
            const count = res?.unreadCount ?? items.filter(n => !n.isRead).length;
            setNotifications(items);
            setUnreadCount(count);
        } catch (err) {
            // Reset to 0 on error — avoid ghost badge from stale socket events
            setUnreadCount(0);
            setNotifications([]);
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const profileRes = await api.getProfile();
                setUser(profileRes.user || profileRes);
            } catch (err) {
                console.error('Failed to load profile:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
        fetchNotifications();
        // Poll notifications every 30 seconds
        const pollInterval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(pollInterval);
    }, [fetchNotifications]);

    const handleMarkAllRead = async () => {
        try {
            await api.markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Mark all read failed:', err);
        }
    };

    const handleClearAll = async () => {
        try {
            await api.deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
            setShowNotifications(false);
        } catch (err) {
            console.error('Clear all failed:', err);
        }
    };

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
                                            position: 'absolute', top: '-4px', right: '-4px',
                                            minWidth: '18px', height: '18px', padding: '0 4px',
                                            background: '#ef4444', borderRadius: '9px',
                                            border: '2px solid var(--bg-main)',
                                            boxShadow: '0 0 8px rgba(239,68,68,0.5)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '9px', fontWeight: 900, color: '#fff',
                                        }}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </div>
                                    )}
                                </button>

                                {showNotifications && (
                                    <div
                                        onClick={e => e.stopPropagation()}
                                        style={{
                                            position: 'absolute', top: 'calc(100% + 12px)', right: 0,
                                            width: '390px', background: 'var(--bg-panel)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '20px',
                                            boxShadow: '0 24px 64px rgba(0,0,0,0.28), 0 0 0 1px rgba(99,102,241,0.08)',
                                            zIndex: 1001, overflow: 'hidden',
                                            animation: 'slideDown 0.25s cubic-bezier(0.4,0,0.2,1)',
                                        }}
                                    >
                                        {/* Panel Header */}
                                        <div style={{
                                            padding: '18px 20px 14px',
                                            background: 'linear-gradient(135deg, rgba(99,102,241,0.07) 0%, transparent 100%)',
                                            borderBottom: '1px solid var(--border-color)',
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: unreadCount > 0 ? '12px' : '0' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '11px',
                                                        background: 'rgba(99,102,241,0.12)',
                                                        border: '1px solid rgba(99,102,241,0.28)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    }}>
                                                        <Bell size={16} color="var(--primary)" />
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)', lineHeight: 1.1 }}>Alert Center</div>
                                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>System notifications</div>
                                                    </div>
                                                </div>
                                                {unreadCount > 0 ? (
                                                    <span style={{
                                                        fontSize: '10px', background: 'var(--primary)', color: '#fff',
                                                        padding: '4px 12px', borderRadius: '100px', fontWeight: 800,
                                                        boxShadow: '0 0 14px rgba(99,102,241,0.4)',
                                                        letterSpacing: '0.04em',
                                                    }}>
                                                        {unreadCount} new
                                                    </span>
                                                ) : (
                                                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, padding: '4px 12px', background: 'var(--bg-light)', borderRadius: '100px', border: '1px solid var(--border-color)' }}>
                                                        All read
                                                    </span>
                                                )}
                                            </div>
                                            {unreadCount > 0 && (
                                                <button onClick={handleMarkAllRead} style={{
                                                    background: 'rgba(99,102,241,0.09)', border: '1px solid rgba(99,102,241,0.2)',
                                                    color: 'var(--primary)', fontSize: '11px', cursor: 'pointer',
                                                    fontWeight: 700, padding: '6px 14px', borderRadius: '9px',
                                                    fontFamily: 'inherit', transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: '6px',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.16)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.09)'}
                                                >
                                                    <span style={{ fontSize: '12px' }}>✓</span> Mark all as read
                                                </button>
                                            )}
                                        </div>

                                        {/* Notifications List */}
                                        <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                                            {notifications.length === 0 ? (
                                                <div style={{ padding: '52px 20px', textAlign: 'center' }}>
                                                    <div style={{
                                                        width: '56px', height: '56px', borderRadius: '18px',
                                                        background: 'rgba(99,102,241,0.06)', border: '1px dashed rgba(99,102,241,0.22)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        margin: '0 auto 16px',
                                                    }}>
                                                        <Bell size={24} color="var(--text-muted)" style={{ opacity: 0.35 }} />
                                                    </div>
                                                    <div style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '13px', marginBottom: '5px' }}>No Active Alerts</div>
                                                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500 }}>All systems operational</div>
                                                </div>
                                            ) : notifications.map((n, i) => {
                                                const isCritical = n.priority === 'critical' || n.type === 'CRITICAL';
                                                const isHigh = n.priority === 'high' || n.type === 'HIGH';
                                                const isError = n.type === 'error';
                                                const accentColor = isCritical || isError ? '#ef4444' : isHigh ? '#f59e0b' : 'var(--primary)';
                                                const accentBg = isCritical || isError ? 'rgba(239,68,68,0.08)' : isHigh ? 'rgba(245,158,11,0.08)' : 'rgba(99,102,241,0.08)';
                                                const timeStr = n.createdAt ? new Date(n.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : '';
                                                return (
                                                    <div key={n.id || i} style={{
                                                        display: 'flex', gap: '14px', padding: '14px 20px',
                                                        borderBottom: '1px solid var(--border-color)',
                                                        alignItems: 'flex-start',
                                                        background: n.isRead ? 'transparent' : 'rgba(99,102,241,0.03)',
                                                        transition: 'background 0.18s',
                                                        cursor: 'pointer', position: 'relative',
                                                    }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.025)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = n.isRead ? 'transparent' : 'rgba(99,102,241,0.03)'}
                                                    >
                                                        {!n.isRead && (
                                                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: accentColor, borderRadius: '0 3px 3px 0' }} />
                                                        )}
                                                        <div style={{
                                                            width: '38px', height: '38px', borderRadius: '11px',
                                                            background: accentBg, border: `1px solid ${accentColor}28`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px',
                                                        }}>
                                                            <Bell size={16} color={accentColor} />
                                                        </div>
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '4px' }}>
                                                                <div style={{ fontSize: '13px', fontWeight: n.isRead ? 600 : 800, color: 'var(--text-main)', lineHeight: '1.3' }}>{n.title}</div>
                                                                {!n.isRead && <div style={{ width: '7px', height: '7px', background: accentColor, borderRadius: '50%', flexShrink: 0, marginTop: '4px', boxShadow: `0 0 6px ${accentColor}` }} />}
                                                            </div>
                                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '6px', lineHeight: '1.5', fontWeight: 500 }}>{n.message || n.content || ''}</div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                                {(isCritical || isHigh || isError) && (
                                                                    <span style={{
                                                                        fontSize: '9px', fontWeight: 800, textTransform: 'uppercase',
                                                                        letterSpacing: '0.08em', color: accentColor,
                                                                        background: accentBg, padding: '2px 8px', borderRadius: '5px',
                                                                    }}>{isCritical ? 'Critical' : isError ? 'Error' : 'High'}</span>
                                                                )}
                                                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>{timeStr}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Actions */}
                                        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.06)' }}>
                                            <button
                                                onClick={handleClearAll}
                                                style={{
                                                    flex: 1, padding: '9px 12px',
                                                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                                                    borderRadius: '10px', color: '#ef4444', fontWeight: 700, fontSize: '11px',
                                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.07)'}
                                            >
                                                Clear All
                                            </button>
                                            <button
                                                onClick={() => setShowNotifications(false)}
                                                style={{
                                                    flex: 1, padding: '9px 12px',
                                                    background: 'var(--bg-light)', border: '1px solid var(--border-color)',
                                                    borderRadius: '10px', color: 'var(--text-secondary)', fontWeight: 700, fontSize: '11px',
                                                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
                                                    textTransform: 'uppercase', letterSpacing: '0.05em',
                                                }}
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
