import React, { useState, useEffect } from 'react';
import { Search, MessageSquare, Loader2, Users } from 'lucide-react';
import api from '../../utils/api';

export default function ManageTeam({ onStartChat }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const loadUsers = async () => {
            try {
                setLoading(true);
                const data = await api.getChatUsers();
                setUsers(data || []);
            } catch (err) {
                console.error('Failed to load team users:', err);
            } finally {
                setLoading(false);
            }
        };
        loadUsers();
    }, []);

    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase().includes(q);
    });

    const getRoleColor = (role) => ({ 
        admin: '#ef4444', 
        manager: '#f59e0b', 
        user: '#10b981' 
    }[role?.toLowerCase()] || 'linear-gradient(135deg, #667eea, #764ba2)');

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <Loader2 size={32} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.3 }} />
                <p className="font-black text-[10px] uppercase tracking-[0.2em]">Synchronizing Personnel Data...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', shadow: 'var(--shadow-primary)' }}>
                            <Users size={20} color="#fff" />
                        </div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Intelligence Directory</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em' }}>
                        {users.length} Active Protocol Personnel Linked
                    </p>
                </div>
                <div style={{ 
                    background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                    borderRadius: '14px', padding: '12px 16px', display: 'flex', 
                    alignItems: 'center', gap: '10px', width: '300px',
                    shadow: 'var(--shadow)'
                }}>
                    <Search size={16} color="var(--text-muted)" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter by subject, role or ID..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '13px', fontWeight: '600' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {filtered.map(u => (
                    <div key={u.id} style={{
                        background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px',
                        padding: '28px', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative',
                        overflow: 'hidden', shadow: 'var(--shadow)'
                    }}
                        onMouseEnter={e => { 
                            e.currentTarget.style.borderColor = 'var(--primary)'; 
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.1)';
                        }}
                        onMouseLeave={e => { 
                            e.currentTarget.style.borderColor = 'var(--border-color)'; 
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'var(--shadow)';
                        }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'var(--bg-light)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)', fontWeight: '900', fontSize: '20px', flexShrink: 0
                            }}>
                                {u.firstName?.charAt(0) || u.username?.charAt(0) || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '16px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {u.firstName} {u.lastName}
                                </div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {u.email || u.username}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <span style={{
                                background: 'var(--bg-light)', border: '1px solid var(--border-color)',
                                color: getRoleColor(u.role),
                                fontSize: '10px', fontWeight: '900', padding: '6px 14px', borderRadius: '8px',
                                textTransform: 'uppercase', flexShrink: 0, tracking: '0.1em'
                            }}>{u.role}</span>
                            <span style={{
                                color: u.status === 'active' ? '#10b981' : '#ef4444',
                                fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px',
                                textTransform: 'uppercase', tracking: '0.05em'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', shadow: '0 0 8px currentColor' }} />
                                {u.status === 'active' ? 'Operational' : 'Restricted'}
                            </span>
                        </div>

                        <button
                            onClick={() => onStartChat?.(u.id)}
                            style={{
                                width: '100%', background: 'var(--primary)', border: 'none',
                                color: '#fff', padding: '14px', borderRadius: '12px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                                fontSize: '12px', fontWeight: '900', transition: 'all 0.2s', textTransform: 'uppercase',
                                shadow: 'var(--shadow-primary)'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <MessageSquare size={16} /> Establish Liaison
                        </button>
                    </div>
                ))}
            </div>
            {filtered.length === 0 && (
                <div style={{ padding: '100px', textAlign: 'center', opacity: 0.3 }}>
                    <Users size={64} style={{ margin: '0 auto 20px' }} />
                    <p className="font-black text-sm uppercase tracking-widest">No Protocol Match Found</p>
                </div>
            )}
        </div >
    );
}
