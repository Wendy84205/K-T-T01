import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import MfaSetupBanner from '../components/MfaSetupBanner';
import {
    LayoutDashboard,
    MessageSquare,
    FileText,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Settings,
    Shield,
    Bell,
    Building2,
    Sun,
    Moon
} from 'lucide-react';

const navItems = [
    { to: '/manage/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { to: '/user/home', label: 'Secure Messenger', icon: <MessageSquare size={20} /> },
    { to: '/manage/documents', label: 'Team Documents', icon: <FileText size={20} /> },
    { to: '/manage/reports', label: 'Analytics', icon: <BarChart3 size={20} /> },
];

export default function ManageLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout, darkMode, toggleDarkMode } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.style.setProperty('--bg-app', '#0e1621');
            root.style.setProperty('--bg-panel', '#17212b');
            root.style.setProperty('--bg-main', '#0e1621');
            root.style.setProperty('--bg-light', '#242f3d');
            root.style.setProperty('--bg-selected', '#2b5278');
            root.style.setProperty('--border-color', '#242f3d');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-secondary', '#8b98a5');
            root.style.setProperty('--text-muted', '#707579');
            root.style.setProperty('--primary', '#667eea');
            root.style.setProperty('--green-color', '#10b981');
            root.style.setProperty('--accent-amber', '#f59e0b');
            root.style.setProperty('--red-color', '#ef4444');
            root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.3)');
            root.style.setProperty('--shadow-primary', 'rgba(102, 126, 234, 0.3)');
            root.style.setProperty('--primary-light', 'rgba(102, 126, 234, 0.1)');
            root.style.setProperty('--bg-primary-soft', 'rgba(102, 126, 234, 0.1)');
            root.style.setProperty('--border-primary-soft', 'rgba(102, 126, 234, 0.2)');
            root.style.setProperty('--bg-green-soft', 'rgba(16, 185, 129, 0.1)');
            root.style.setProperty('--bg-red-soft', 'rgba(239, 68, 68, 0.1)');
        } else {
            root.style.setProperty('--bg-app', '#f0f2f5');
            root.style.setProperty('--bg-panel', '#ffffff');
            root.style.setProperty('--bg-main', '#ffffff');
            root.style.setProperty('--bg-light', '#f8f9fa');
            root.style.setProperty('--bg-selected', '#e9ecef');
            root.style.setProperty('--border-color', '#dee2e6');
            root.style.setProperty('--text-main', '#1c1e21');
            root.style.setProperty('--text-secondary', '#65676b');
            root.style.setProperty('--text-muted', '#8d949e');
            root.style.setProperty('--primary', '#007bff');
            root.style.setProperty('--primary-light', 'rgba(0, 123, 255, 0.1)');
            root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.05)');
            root.style.setProperty('--shadow-primary', 'rgba(0, 123, 255, 0.3)');
            root.style.setProperty('--bg-primary-soft', 'rgba(0, 123, 255, 0.05)');
            root.style.setProperty('--border-primary-soft', 'rgba(0, 123, 255, 0.1)');
            root.style.setProperty('--bg-green-soft', 'rgba(40, 167, 69, 0.1)');
            root.style.setProperty('--green-color', '#28a745');
            root.style.setProperty('--bg-red-soft', 'rgba(220, 53, 69, 0.1)');
            root.style.setProperty('--red-color', '#dc3545');
        }
    }, [darkMode]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-panel)', display: 'flex', color: 'var(--text-main)', transition: 'all 0.3s ease' }}>
            <MfaSetupBanner user={user} />

            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarOpen ? '260px' : '80px',
                    background: 'var(--bg-main)',
                    borderRight: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 50,
                    boxShadow: 'var(--shadow)'
                }}
            >
                {/* Logo Area */}
                <div style={{
                    padding: '24px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        minWidth: '38px', height: '38px', background: 'var(--primary)',
                        borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 10px rgba(0,123,255,0.2)'
                    }}>
                        <Building2 size={20} color="#fff" />
                    </div>
                    {sidebarOpen && (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: '900', fontSize: '16px', letterSpacing: '-0.02em', color: 'var(--text-main)', textTransform: 'uppercase' }}>TECHCORP</span>
                            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Management</span>
                        </div>
                    )}
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: '20px 12px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 14px',
                                borderRadius: '10px',
                                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                                background: isActive ? 'var(--active-bg)' : 'transparent',
                                textDecoration: 'none',
                                marginBottom: '4px',
                                transition: 'all 0.15s ease',
                                border: isActive ? '1px solid var(--active-bg)' : '1px solid transparent'
                            })}
                        >
                            <span style={{ color: 'inherit' }}>{item.icon}</span>
                            {sidebarOpen && <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* Theme Toggle in Sidebar */}
                <div style={{ padding: '0 12px 12px' }}>
                    <button
                        onClick={toggleDarkMode}
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '10px',
                            background: 'var(--bg-panel)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        {sidebarOpen && <span style={{ fontSize: '13px', fontWeight: '800', textTransform: 'uppercase' }}>{darkMode ? 'Light mode' : 'Dark mode'}</span>}
                    </button>
                </div>

                {/* User Area */}
                <div style={{ padding: '20px 12px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px', borderRadius: '10px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', background: 'var(--primary)',
                            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: '900', color: '#fff'
                        }}>
                            {user?.firstName?.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: '900', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-main)' }}>
                                    {user?.firstName}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.role}
                                </div>
                            </div>
                        )}
                        {sidebarOpen && (
                            <button
                                onClick={handleLogout}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px' }}
                            >
                                <LogOut size={16} color="#dc2626" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'absolute', right: '-12px', top: '32px',
                        width: '24px', height: '24px', background: 'var(--bg-main)',
                        borderRadius: '50%', border: '1px solid var(--border-color)', color: 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        zIndex: 100
                    }}
                >
                    {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header style={{
                    height: '86px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifySelf: 'stretch', padding: '0 32px',
                    justifyContent: 'space-between'
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '-0.02em', margin: 0 }}>Executive Control</h2>
                        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Manager Authorization Required</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer', padding: '10px', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
                            <Bell size={18} color="var(--text-muted)" />
                            <div style={{ position: 'absolute', top: '8px', right: '8px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid var(--bg-main)' }} />
                        </div>
                        <div style={{ padding: '10px', borderRadius: '12px', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
                            <Settings size={18} color="var(--text-muted)" />
                        </div>
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-panel)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
