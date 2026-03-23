import React, { useState, useEffect } from 'react';
import { 
    BarChart3, Layers, CheckCircle2, Users, Clock, 
    RefreshCw, MessageSquare, Shield, AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import { useNavigate } from 'react-router-dom';

export default function ManageOverview() {
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeTasks: 0,
        teamSize: 0,
        securityAlerts: 0
    });
    const [projects, setProjects] = useState([]);
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectData, userData, securityData] = await Promise.all([
                api.getProjects().catch(() => []),
                api.getChatUsers().catch(() => []),
                api.getSecurityAlerts(true).catch(() => ({ alerts: [] }))
            ]);

            setProjects(projectData || []);
            setTeam(userData?.slice(0, 5) || []);
            
            const allTasks = projectData?.reduce((acc, p) => [...acc, ...(p.tasks || [])], []) || [];
            const pendingTasks = allTasks.filter(t => t.status !== 'completed' && t.status !== 'done').length;

            setStats({
                totalProjects: projectData?.length || 0,
                activeTasks: pendingTasks,
                teamSize: userData?.length || 0,
                securityAlerts: securityData?.alerts?.length || 0
            });
        } catch (error) {
            console.error('Failed to load overview data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const getStatusColor = (status) => ({
        active: '#10b981', planned: '#667eea', on_hold: '#f59e0b', completed: '#8b98a5'
    }[status] || '#8b98a5');

    const calculateProgress = (tasks) => {
        if (!tasks || tasks.length === 0) return 0;
        const completed = tasks.filter(t => t.status === 'completed' || t.status === 'done').length;
        return Math.round((completed / tasks.length) * 100);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p className="font-black text-[10px] uppercase tracking-[0.2em]">Analyzing System Vectors...</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div>
                    <h1 style={{ color: 'var(--text-main)', margin: '0 0 8px 0', fontSize: '26px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Command Center</h1>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em' }}>Operational Intelligence Overwatch</p>
                </div>
                <button 
                    onClick={loadData}
                    style={{ 
                        background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                        padding: '10px 16px', borderRadius: '12px', color: 'var(--text-main)',
                        display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                        fontSize: '11px', fontWeight: '900', textTransform: 'uppercase'
                    }}
                >
                    <RefreshCw size={14} /> Sync Data
                </button>
            </div>

            {/* Main Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {[
                    { label: 'Strategic Assets', value: stats.totalProjects, icon: <Layers size={22} />, color: 'var(--primary)', desc: 'Active Projects' },
                    { label: 'Personnel', value: stats.teamSize, icon: <Users size={22} />, color: '#10b981', desc: 'Managed Staff' },
                    { label: 'Task Load', value: stats.activeTasks, icon: <CheckCircle2 size={22} />, color: '#f59e0b', desc: 'Pending Actions' },
                    { label: 'Security Status', value: stats.securityAlerts > 0 ? stats.securityAlerts : 'CLEAN', icon: <Shield size={22} />, color: stats.securityAlerts > 0 ? '#ef4444' : '#10b981', desc: 'Integrity Alerts' },
                ].map((s, i) => (
                    <div key={i} style={{ 
                        background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                        borderRadius: '24px', padding: '28px', position: 'relative', 
                        overflow: 'hidden', shadow: 'var(--shadow)',
                        transition: 'transform 0.2s'
                    }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                            <div style={{ background: `${s.color}15`, padding: '12px', borderRadius: '16px', color: s.color }}>
                                {s.icon}
                            </div>
                            <div style={{ height: '4px', width: '40px', background: s.color, borderRadius: '2px', opacity: 0.3 }} />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '900', marginBottom: '8px', textTransform: 'uppercase', tracking: '0.1em' }}>{s.label}</div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                <div style={{ fontSize: '32px', fontWeight: '900', color: 'var(--text-main)' }}>{s.value}</div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>{s.desc}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                {/* Recent Projects List */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', shadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase', tracking: '0.05em' }}>Deployment Status</h3>
                        <button onClick={() => navigate('/manage/projects')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>Full Repository</button>
                    </div>
                    {projects.length === 0 ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <AlertCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.1 }} />
                            <p className="text-xs font-bold uppercase tracking-widest">No Active Deployments</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '12px' }}>
                            {projects.slice(0, 5).map(p => {
                                const progress = calculateProgress(p.tasks);
                                return (
                                    <div key={p.id} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', 
                                        background: 'var(--bg-app)', border: '1px solid var(--border-color)', 
                                        borderRadius: '16px', transition: 'all 0.2s'
                                    }} onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'} onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${getStatusColor(p.status)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getStatusColor(p.status) }}>
                                            <Layers size={20} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: '800', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>{p.name}</div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(p.status) }} />
                                                <span style={{ color: 'var(--text-secondary)', fontSize: '10px', textTransform: 'uppercase', fontWeight: '800' }}>{p.status?.replace('_', ' ')}</span>
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: '900' }}>{progress}%</div>
                                            <div style={{ width: '60px', height: '4px', background: 'var(--bg-light)', borderRadius: '2px', marginTop: '4px', overflow: 'hidden' }}>
                                                <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '2px' }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Team Quick Liaison */}
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', shadow: 'var(--shadow)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase', tracking: '0.05em' }}>Personnel Status</h3>
                        <button onClick={() => navigate('/manage/team')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontSize: '11px', fontWeight: '900', cursor: 'pointer', textTransform: 'uppercase' }}>View All</button>
                    </div>
                    {team.length === 0 ? (
                        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Users size={32} style={{ margin: '0 auto 12px', opacity: 0.1 }} />
                            <p className="text-xs font-bold uppercase tracking-widest">No Personnel Linked</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gap: '16px' }}>
                            {team.map((u) => (
                                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ 
                                        width: '42px', height: '42px', borderRadius: '12px', 
                                        background: 'var(--bg-light)', border: '1px solid var(--border-color)', 
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontWeight: '900', color: 'var(--primary)',
                                        fontSize: '14px'
                                    }}>
                                        {u.firstName?.charAt(0) || u.username?.charAt(0)}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '800' }}>{u.firstName} {u.lastName}</div>
                                        <div style={{ color: u.status === 'active' ? '#10b981' : '#f59e0b', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                                            {u.status === 'active' ? 'Station Active' : 'Limited Access'}
                                        </div>
                                    </div>
                                    <div style={{ padding: '8px', background: 'var(--primary-light)', borderRadius: '10px', cursor: 'pointer' }} onClick={() => navigate('/manage/chat')}>
                                        <MessageSquare size={16} color="var(--primary)" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
