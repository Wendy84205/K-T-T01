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
    Bell
} from 'lucide-react';

const navItems = [
    { to: '/manage/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, end: true },
    { to: '/user/home', label: 'Secure Messenger', icon: <MessageSquare size={20} /> },
    { to: '/manage/documents', label: 'Team Documents', icon: <FileText size={20} /> },
    { to: '/manage/reports', label: 'Analytics', icon: <BarChart3 size={20} /> },
];

export default function ManageLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#0e1621', display: 'flex', color: '#fff' }}>
            <MfaSetupBanner user={user} />

            {/* Sidebar */}
            <aside
                style={{
                    width: sidebarOpen ? '250px' : '80px',
                    background: '#151f2e',
                    borderRight: '1px solid #2a3441',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 50
                }}
            >
                {/* Logo Area */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid #2a3441',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        minWidth: '32px', height: '32px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Shield size={18} color="#fff" />
                    </div>
                    {sidebarOpen && <span style={{ fontWeight: '800', fontSize: '18px', letterSpacing: '-0.5px' }}>SAFECORE</span>}
                </div>

                {/* Nav items */}
                <nav style={{ flex: 1, padding: '24px 12px' }}>
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
                                borderRadius: '12px',
                                color: isActive ? '#fff' : '#8b98a5',
                                background: isActive ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
                                textDecoration: 'none',
                                marginBottom: '8px',
                                transition: 'all 0.2s',
                                border: isActive ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent'
                            })}
                        >
                            <span style={{ color: 'inherit' }}>{item.icon}</span>
                            {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: '600' }}>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                {/* User Area */}
                <div style={{ padding: '24px 12px', borderTop: '1px solid #2a3441' }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)'
                    }}>
                        <div style={{
                            width: '32px', height: '32px', background: '#667eea',
                            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '14px', fontWeight: '700'
                        }}>
                            {user?.firstName?.charAt(0)}
                        </div>
                        {sidebarOpen && (
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                                <div style={{ fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.firstName}
                                </div>
                                <div style={{ fontSize: '11px', color: '#8b98a5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user?.role}
                                </div>
                            </div>
                        )}
                        {sidebarOpen && <LogOut size={16} color="#8b98a5" style={{ cursor: 'pointer' }} onClick={handleLogout} />}
                    </div>
                </div>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'absolute', right: '-12px', top: '76px',
                        width: '24px', height: '24px', background: '#667eea',
                        borderRadius: '50%', border: 'none', color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}
                >
                    {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                </button>
            </aside>

            {/* Main Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
                <header style={{
                    height: '70px', background: '#151f2e', borderBottom: '1px solid #2a3441',
                    display: 'flex', alignItems: 'center', justifySelf: 'stretch', padding: '0 32px',
                    justifyContent: 'space-between'
                }}>
                    <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#fff' }}>Manager Workspace</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ position: 'relative', cursor: 'pointer' }}>
                            <Bell size={20} color="#8b98a5" />
                            <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid #151f2e' }} />
                        </div>
                        <Settings size={20} color="#8b98a5" style={{ cursor: 'pointer' }} />
                    </div>
                </header>

                <main style={{ flex: 1, overflowY: 'auto', background: '#0e1621' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
