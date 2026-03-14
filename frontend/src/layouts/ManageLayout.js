import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
    LayoutDashboard, MessageSquare, Users, Layers, 
    FileText, BarChart3, LogOut, Shield, ChevronRight,
    Bell, User, Settings, Info, Loader2, Moon, Sun
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function ManageLayout() {
    const { darkMode, toggleDarkMode } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [profileRes, notifyRes] = await Promise.all([
                    api.getProfile(),
                    api.getNotifications(1, 5)
                ]);
                setUser(profileRes.user || profileRes);
                setNotifications(notifyRes.notifications || notifyRes || []);
            } catch (err) {
                console.error('Failed to load layout data:', err);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const navItems = [
        { id: 'overview', label: 'Command Hub', icon: <LayoutDashboard size={20} />, path: '/manage/dashboard' },
        { id: 'chat', label: 'Secure Messenger', icon: <MessageSquare size={20} />, path: '/manage/chat' },
        { id: 'team', label: 'Intelligence Team', icon: <Users size={20} />, path: '/manage/team' },
        { id: 'projects', label: 'Asset Repository', icon: <Layers size={20} />, path: '/manage/projects' },
        { id: 'docs', label: 'Intelligence Vault', icon: <FileText size={20} />, path: '/manage/documents' },
        { id: 'reports', label: 'Operational Metrics', icon: <BarChart3 size={20} />, path: '/manage/reports' },
    ];

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
            overflow: 'hidden', fontFamily: "'Inter', sans-serif" 
        }}>
            {/* Unified Sidebar */}
            <aside style={{ 
                width: '280px', flexShrink: 0, 
                background: darkMode ? 'rgba(23, 25, 29, 0.7)' : 'rgba(255, 255, 255, 0.8)', 
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column',
                zIndex: 100
            }}>
                {/* Branding */}
                <div style={{ padding: '32px 28px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ 
                        width: '42px', height: '42px', background: 'var(--primary)', 
                        borderRadius: '12px', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', shadow: 'var(--shadow-primary)',
                        position: 'relative', overflow: 'hidden'
                    }}>
                        <img src="/ktt01_logo_square.png" alt="KTT01" style={{ width: '28px', height: '28px', zIndex: 2, borderRadius: '6px' }} />
                        <div className="animate-scan" style={{ 
                            position: 'absolute', inset: 0, background: 'linear-gradient(transparent, rgba(255,255,255,0.4), transparent)',
                            height: '100%', width: '100%', zIndex: 1 
                        }} />
                    </div>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', letterSpacing: '-0.02em', color: 'var(--text-main)' }}>KTT01</h2>
                        <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', tracking: '0.1em' }}>Manager Console</span>
                    </div>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ padding: '0 12px 12px 12px', fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', tracking: '0.1em' }}>Strategic Operations</div>
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink 
                                key={item.id} 
                                to={item.path}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '14px',
                                    padding: '14px 16px', borderRadius: '12px',
                                    textDecoration: 'none', transition: 'all 0.2s',
                                    background: isActive ? 'var(--primary-light)' : 'transparent',
                                    color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                                    fontWeight: isActive ? '800' : '600',
                                    fontSize: '14px',
                                    border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent'}`
                                }}
                            >
                                <span style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
                                <span style={{ flex: 1 }}>{item.label}</span>
                                {isActive && <ChevronRight size={14} />}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Logout Action */}
                <div style={{ padding: '24px 16px', borderTop: `1px solid ${darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` }}>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                            padding: '14px 16px', background: 'rgba(239, 68, 68, 0.05)', 
                            border: '1px solid rgba(239, 68, 68, 0.1)', borderRadius: '12px',
                            color: '#ef4444', cursor: 'pointer', fontSize: '13px', 
                            fontWeight: '800', transition: 'all 0.2s', textTransform: 'uppercase'
                        }}
                    >
                        <LogOut size={18} />
                        Terminate Access
                    </button>
                </div>
            </aside>

            {/* Main Viewport */}
            <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                {/* Background Decoration */}
                <div style={{ 
                    position: 'absolute', top: '-10%', right: '-10%', width: '400px', height: '400px',
                    background: 'var(--primary)', filter: 'blur(150px)', opacity: 0.05, borderRadius: '50%', zIndex: -1
                }} />
                
                {/* Top Bar */}
                <header style={{ 
                    height: '80px', padding: '0 40px', 
                    background: darkMode ? 'rgba(23, 25, 29, 0.4)' : 'rgba(255, 255, 255, 0.5)', backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    position: 'relative', zIndex: 1000
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-muted)' }}>
                        <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em' }}>Secure Station:</span>
                        <span style={{ fontSize: '11px', fontWeight: '900', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 10px', borderRadius: '6px' }}>ONLINE</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
                            <button 
                                onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}
                                style={{ 
                                    background: showNotifications ? 'var(--primary-light)' : 'transparent', 
                                    border: 'none', color: showNotifications ? 'var(--primary)' : 'var(--text-muted)', 
                                    cursor: 'pointer', padding: '8px', position: 'relative', borderRadius: '10px', transition: 'all 0.2s' 
                                }}
                            >
                                <Bell size={20} />
                                {notifications.length > 0 && <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-app)' }} />}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div style={{ 
                                    position: 'absolute', top: '50px', right: 0, width: '300px', 
                                    background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                                    borderRadius: '16px', shadow: 'var(--shadow)', padding: '20px', zIndex: 1001,
                                    animation: 'slideDown 0.2s ease'
                                }}>
                                    <h4 style={{ margin: '0 0 16px 0', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text-main)' }}>Alert Center</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                                                <div style={{ fontSize: '11px', fontWeight: '700' }}>NO ACTIVE THREATS</div>
                                            </div>
                                        ) : notifications.map(n => (
                                            <div key={n.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                                <div style={{ width: '8px', height: '8px', background: n.type === 'error' ? '#ef4444' : '#10b981', borderRadius: '50%', marginTop: '4px' }} />
                                                <div>
                                                    <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--text-main)', marginBottom: '2px' }}>{n.title}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.message || n.content}</div>
                                                </div>
                                            </div>
                                        ))}
                                        <button 
                                            onClick={() => setShowNotifications(false)}
                                            style={{ width: '100%', padding: '10px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', cursor: 'pointer' }}
                                        >
                                            Dismiss Dashboard
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(255,255,255,0.05)' }} />
                        
                        <div style={{ position: 'relative' }}>
                            <div 
                                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px', borderRadius: '12px', transition: 'all 0.2s', background: showProfileMenu ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                            >
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>{user ? `${user.firstName} ${user.lastName}` : 'Manager Unit'}</div>
                                    <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{user?.role || 'Classification L4'}</div>
                                </div>
                                <div style={{ 
                                    width: '38px', height: '38px', borderRadius: '10px', 
                                    background: showProfileMenu ? 'var(--primary)' : 'var(--bg-light)', 
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: showProfileMenu ? '#fff' : 'var(--primary)',
                                    transition: 'all 0.2s'
                                }}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <User size={20} />}
                                </div>
                            </div>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div style={{ 
                                    position: 'absolute', top: '50px', right: 0, width: '220px', 
                                    background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                                    borderRadius: '16px', shadow: 'var(--shadow)', padding: '8px', zIndex: 1001,
                                    animation: 'slideDown 0.2s ease'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '900', color: 'var(--text-main)', marginBottom: '2px' }}>{user ? `${user.firstName} ${user.lastName}` : 'Active Node'}</div>
                                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{user?.email || 'admin_protocol_01'}</div>
                                    </div>
                                    <button 
                                        onClick={() => { navigate('/manage/settings'); setShowProfileMenu(false); }}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', borderRadius: '8px' }}
                                    >
                                        <Settings size={16} /> Setting
                                    </button>
                                    <button 
                                        onClick={handleLogout}
                                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', background: 'rgba(239, 68, 68, 0.05)', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: '800', cursor: 'pointer', borderRadius: '8px', textTransform: 'uppercase', marginTop: '8px' }}
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Sub-page Content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
