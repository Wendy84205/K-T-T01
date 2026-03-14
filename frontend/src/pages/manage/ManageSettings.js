import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
    User, Mail, Shield, Lock, Bell, Moon, 
    Save, RefreshCw, ChevronRight, Check, Monitor, 
    Smartphone, Trash2, ShieldCheck, MapPin, Clock, 
    AlertCircle, LogOut, Camera, ExternalLink, Eye, Sun
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

export default function ManageSettings() {
    const { darkMode, setDarkMode } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [sessions, setSessions] = useState([]);
    const [activity, setActivity] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);
    const [activityLoading, setActivityLoading] = useState(false);
    const fileInputRef = useRef(null);
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mfaEnabled: true
    });

    const loadProfile = useCallback(async () => {
        try {
            const profile = await api.getProfile();
            const userData = profile.user || profile;
            setUser(userData);
            setFormData({
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                email: userData.email || '',
                mfaEnabled: userData.mfaEnabled || false
            });
        } catch (err) {
            console.error('Failed to load profile:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchSessions = useCallback(async () => {
        try {
            setSessionsLoading(true);
            const data = await api.getUserSessions();
            setSessions(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch sessions:', err);
        } finally {
            setSessionsLoading(false);
        }
    }, []);

    const fetchActivity = useCallback(async () => {
        try {
            setActivityLoading(true);
            const data = await api.getUserActivity();
            setActivity(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch activity:', err);
        } finally {
            setActivityLoading(false);
        }
    }, []);

    const fetchNotifications = useCallback(async () => {
        try {
            const data = await api.getNotifications(1, 10);
            setNotifications(data.notifications || data || []);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        if (activeTab === 'security') {
            fetchSessions();
            fetchActivity();
        } else if (activeTab === 'notifications') {
            fetchNotifications();
        }
    }, [activeTab, fetchSessions, fetchActivity, fetchNotifications]);

    const handleSave = async (e) => {
        if (e) e.preventDefault();
        setSaving(true);
        try {
            await api.updateProfile(formData);
            await loadProfile();
            alert('Protocol settings updated and synchronized.');
        } catch (err) {
            console.error('Update failed:', err);
            alert('Failed to update settings: ' + (err.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarClick = () => fileInputRef.current?.click();

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            setSaving(true);
            await api.uploadAvatar(file);
            await loadProfile();
            alert('Operational avatar updated.');
        } catch (err) {
            console.error('Avatar upload failed:', err);
            alert('Avatar update failed.');
        } finally {
            setSaving(false);
        }
    };

    const handleRevokeSession = async (id) => {
        if (!window.confirm('Terminate this connection? The device will lose access immediately.')) return;
        try {
            await api.revokeSession(id);
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch (err) {
            alert('Termination failed: ' + err.message);
        }
    };

    const handleClearNotifications = async () => {
        if (!window.confirm('Wipe all alert logs from this node?')) return;
        try {
            await api.deleteAllNotifications();
            setNotifications([]);
        } catch (err) {
            alert('Wipe failed.');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p className="font-bold text-[10px] uppercase tracking-[0.2em]">Acquiring Personnel Protocol...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', height: '100%', overflowY: 'auto', background: 'var(--bg-app)', color: 'var(--text-main)' }}>
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', shadow: 'var(--shadow-primary)' }}>
                            <Shield size={20} color="#fff" />
                        </div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Manager Intelligence Center</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px', fontWeight: '600' }}>Modify operational identity, security clearance, and active access nodes.</p>
                </div>
                <div style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', textAlign: 'right' }}>
                    LAST SYNC: {new Date().toLocaleTimeString()} <br/>
                    NODE STATUS: <span style={{ color: '#10b981' }}>ENCRYPTED</span>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px' }}>
                {/* Tabs Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        { id: 'profile', label: 'Identity Profile', icon: <User size={18} /> },
                        { id: 'security', label: 'Security & Nodes', icon: <ShieldCheck size={18} /> },
                        { id: 'notifications', label: 'Alert History', icon: <Bell size={18} /> },
                        { id: 'display', label: 'Interface Theme', icon: darkMode ? <Moon size={18} /> : <Sun size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '16px 20px', borderRadius: '16px',
                                border: '1px solid transparent', cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: activeTab === tab.id ? 'var(--primary-light)' : 'var(--bg-panel)',
                                color: activeTab === tab.id ? 'var(--primary)' : 'var(--text-secondary)',
                                fontWeight: activeTab === tab.id ? '800' : '600',
                                fontSize: '14px',
                                shadow: activeTab === tab.id ? 'var(--shadow-primary-soft)' : 'none'
                            }}
                        >
                            {tab.icon}
                            <span style={{ flex: 1, textAlign: 'left' }}>{tab.label}</span>
                            {activeTab === tab.id && <ChevronRight size={14} />}
                        </button>
                    ))}

                    <div style={{ marginTop: 'auto', padding: '20px', background: 'rgba(239, 68, 68, 0.03)', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.1)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', marginBottom: '8px' }}>
                            <AlertCircle size={14} />
                            <span style={{ fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Security Policy</span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.4', fontWeight: '600' }}>Changes to MFA or Identity require immediate re-authentication across all active nodes.</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div style={{ 
                    background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                    borderRadius: '24px', padding: '40px', shadow: 'var(--shadow)',
                    minHeight: '650px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden'
                }}>
                    {/* Floating Glow */}
                    <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '200px', height: '200px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.05, pointerEvents: 'none' }} />

                    <form onSubmit={handleSave} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        {activeTab === 'profile' && (
                            <div className="animate-fade-in" style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={20} color="var(--primary)" /> Personnel Details
                                </h3>
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '40px', padding: '32px', background: 'var(--bg-app)', borderRadius: '24px', border: '1px solid var(--border-color)', position: 'relative' }}>
                                    <div 
                                        onClick={handleAvatarClick}
                                        style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '900', cursor: 'pointer', overflow: 'hidden', position: 'relative' }}
                                    >
                                        {user?.avatar ? <img src={user.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /> : user?.firstName?.charAt(0)}
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="avatar-hover">
                                            <Camera size={24} />
                                        </div>
                                    </div>
                                    <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleAvatarChange} />
                                    
                                    <div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{user?.firstName} {user?.lastName}</div>
                                        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--primary)', textTransform: 'uppercase', background: 'var(--primary-light)', padding: '2px 10px', borderRadius: '6px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>{user?.role} NODE</span>
                                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 10px', borderRadius: '6px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>VERIFIED</span>
                                        </div>
                                    </div>
                                    
                                    <button type="button" onClick={handleAvatarClick} style={{ position: 'absolute', right: '32px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px 16px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>
                                        Modify Avatar
                                    </button>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>First Designation</label>
                                        <input
                                            value={formData.firstName}
                                            onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px', color: 'var(--text-main)', outline: 'none', fontWeight: '600', transition: 'all 0.2s' }}
                                            className="focus-ring"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Last Designation</label>
                                        <input
                                            value={formData.lastName}
                                            onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px', color: 'var(--text-main)', outline: 'none', fontWeight: '600', transition: 'all 0.2s' }}
                                            className="focus-ring"
                                        />
                                    </div>
                                </div>
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Secure Email Vector</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={16} style={{ position: 'absolute', left: '16px', top: '16px', color: 'var(--text-muted)' }} />
                                        <input
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '14px 16px 14px 44px', color: 'var(--text-main)', outline: 'none', fontWeight: '600', transition: 'all 0.2s' }}
                                            className="focus-ring"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="animate-fade-in" style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <ShieldCheck size={20} color="var(--primary)" /> Security & Liaison Nodes
                                </h3>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                    <div style={{ padding: '24px', background: 'var(--bg-app)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                                <Lock size={18} />
                                            </div>
                                            <span style={{ fontWeight: '800', fontSize: '14px' }}>Two-Factor Auth</span>
                                        </div>
                                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>Secure every liaison attempt with a physical token or biometric request.</p>
                                        <button 
                                            type="button"
                                            onClick={() => setFormData({ ...formData, mfaEnabled: !formData.mfaEnabled })}
                                            style={{ 
                                                width: '100%', padding: '12px', borderRadius: '12px', 
                                                background: formData.mfaEnabled ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                                                border: 'none', color: '#fff', fontWeight: '900', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s'
                                            }}
                                        >
                                            {formData.mfaEnabled ? 'ACTIVE PROTOCOL' : 'ENABLE MFA'}
                                        </button>
                                    </div>

                                    <div style={{ padding: '24px', background: 'var(--bg-app)', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                            <div style={{ width: '36px', height: '36px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                                                <Eye size={18} />
                                            </div>
                                            <span style={{ fontWeight: '800', fontSize: '14px' }}>Activity Audit Log</span>
                                        </div>
                                        <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '10px' }}>
                                            {activity.slice(0, 3).map((a, i) => (
                                                <div key={i} style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', gap: '8px' }}>
                                                    <div style={{ width: '4px', height: '4px', background: 'var(--primary)', borderRadius: '50%', marginTop: '5px' }} />
                                                    {a.action || a.message || 'Node state change'}
                                                </div>
                                            ))}
                                        </div>
                                        <button type="button" style={{ width: '100%', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '10px', borderRadius: '10px', fontSize: '11px', fontWeight: '800', cursor: 'pointer' }}>
                                            Full Audit Report
                                        </button>
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-app)', borderRadius: '24px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Authorized Access Nodes</div>
                                        <button type="button" onClick={fetchSessions} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
                                            <RefreshCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
                                        </button>
                                    </div>
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {sessions.map(session => (
                                            <div key={session.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px 24px', borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                                                {session.device?.includes('iPhone') ? <Smartphone size={16} /> : <Monitor size={16} />}
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '13px', fontWeight: '800' }}>{session.device || 'System Node'}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>IP: {session.ipAddress} • {new Date(session.lastActive).toLocaleDateString()}</div>
                                                </div>
                                                {!session.isCurrent && (
                                                    <button type="button" onClick={() => handleRevokeSession(session.id)} style={{ color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <div className="animate-fade-in" style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <Bell size={20} color="var(--primary)" /> Operational Alert logs
                                    </h3>
                                    <button type="button" onClick={handleClearNotifications} style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '8px 16px', borderRadius: '10px', fontSize: '11px', fontWeight: '900', cursor: 'pointer' }}>
                                        Wipe Logs
                                    </button>
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {notifications.length > 0 ? notifications.map(n => (
                                        <div key={n.id} style={{ padding: '16px 20px', background: 'var(--bg-app)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: n.type === 'error' ? '#ef4444' : 'var(--primary)' }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '13px', fontWeight: '800' }}>{n.title}</div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{n.message || n.content}</div>
                                            </div>
                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    )) : (
                                        <div style={{ padding: '100px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            <Bell size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                                            <p style={{ fontWeight: '800', fontSize: '12px', textTransform: 'uppercase' }}>No tactical alerts recorded.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'display' && (
                            <div className="animate-fade-in" style={{ flex: 1 }}>
                                <h3 style={{ margin: '0 0 24px 0', color: 'var(--text-main)', fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {darkMode ? <Moon size={20} color="var(--primary)" /> : <Sun size={20} color="var(--primary)" />} Interface Protocol
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    {[
                                        { id: 'dark', label: 'Dark Ops Mode', icon: <Moon size={14} />, isDark: true },
                                        { id: 'light', label: 'Light Ops Mode', icon: <Sun size={14} />, isDark: false }
                                    ].map(t => {
                                        const isSelected = darkMode === t.isDark;
                                        return (
                                            <div 
                                                key={t.id}
                                                onClick={() => setDarkMode(t.isDark)}
                                                style={{ 
                                                    padding: '32px', borderRadius: '28px', border: '2px solid',
                                                    borderColor: isSelected ? 'var(--primary)' : 'var(--border-color)',
                                                    background: t.isDark ? '#0f172a' : '#fff',
                                                    cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                    shadow: isSelected ? 'var(--shadow-primary-soft)' : 'none',
                                                    position: 'relative'
                                                }}
                                                className="theme-card"
                                            >
                                                <div style={{ color: t.isDark ? '#fff' : '#000', fontWeight: '900', textTransform: 'uppercase', fontSize: '14px', letterSpacing: '0.1em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {t.icon} {t.label}
                                                </div>
                                                <div style={{ height: '80px', background: t.isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '12px' }}>
                                                    <div style={{ height: '8px', width: '60%', background: 'var(--primary)', borderRadius: '4px', marginBottom: '8px', opacity: 0.3 }} />
                                                    <div style={{ height: '8px', width: '40%', background: 'var(--primary)', borderRadius: '4px', opacity: 0.2 }} />
                                                </div>
                                                {isSelected && (
                                                    <div style={{ position: 'absolute', top: '16px', right: '16px', width: '28px', height: '28px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <Check size={16} color="#fff" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Sticky Action Footer */}
                        <div style={{ marginTop: 'auto', paddingTop: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                <span style={{ fontSize: '10px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>All systems functional</span>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    type="button"
                                    onClick={() => loadProfile()}
                                    style={{
                                        background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)',
                                        padding: '14px 28px', borderRadius: '14px', fontWeight: '800',
                                        fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    className="hover-bright"
                                >
                                    Revert
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    style={{
                                        background: 'var(--primary)', color: '#fff', border: 'none',
                                        padding: '14px 36px', borderRadius: '14px', fontWeight: '900',
                                        fontSize: '13px', textTransform: 'uppercase', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: '12px',
                                        shadow: 'var(--shadow-primary)', transition: 'all 0.2s'
                                    }}
                                    className="hover-scale"
                                >
                                    {saving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                                    Commence Sync
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <style>{`
                .animate-fade-in { animation: fadeIn 0.4s ease-out; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
                .focus-ring:focus { border-color: var(--primary) !important; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
                .hover-scale:hover { transform: scale(1.02); filter: brightness(1.1); }
                .hover-bright:hover { border-color: var(--text-muted); color: var(--text-main); }
                .avatar-hover { border-radius: 24px; }
                [onClick]:hover .avatar-hover { opacity: 1 !important; }
                .theme-card:hover { transform: translateY(-4px); border-color: rgba(59, 130, 246, 0.4); }
                @media (max-width: 1024px) {
                    div[style*="gridTemplateColumns: 280px"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
