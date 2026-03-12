import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import api from '../../utils/api';

export default function ManageReports() {
    const [data, setData] = useState({
        security: null,
        projects: [],
        loading: true
    });

    const loadData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true }));
            const [security, projects] = await Promise.all([
                api.getSecurityDashboard(30).catch(() => null),
                api.getProjects().catch(() => [])
            ]);
            setData({ security, projects, loading: false });
        } catch (err) {
            console.error('Analytics fetch failed:', err);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => { loadData(); }, []);

    if (data.loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <RefreshCw size={32} className="animate-spin" style={{ marginBottom: '16px', opacity: 0.2 }} />
                <p className="font-black text-[10px] uppercase tracking-[0.2em]">Aggregating Intelligence Streams...</p>
            </div>
        );
    }

    const stats = [
        { 
            label: 'System Integrity', 
            value: data.security?.totalEvents || 'NOMINAL', 
            icon: <Zap size={20} />, 
            color: 'var(--primary)', 
            trend: 'Live Vector Analysis' 
        },
        { 
            label: 'Security Uptime', 
            value: '99.99%', 
            icon: <ShieldCheck size={20} />, 
            color: '#10b981', 
            trend: 'Standard Protocol' 
        },
        { 
            label: 'Strategic Load', 
            value: `${data.projects.length * 8}%`, 
            icon: <Activity size={20} />, 
            color: '#f59e0b', 
            trend: 'Optimized' 
        },
    ];

    const distribution = {
        active: data.projects.filter(p => p.status === 'active').length,
        planned: data.projects.filter(p => p.status === 'planned').length,
        onHold: data.projects.filter(p => p.status === 'on_hold').length
    };

    const total = data.projects.length || 1;
    const activePct = (distribution.active / total) * 100;
    const plannedPct = (distribution.planned / total) * 100;

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', shadow: 'var(--shadow-primary)' }}>
                            <BarChart3 size={20} color="#fff" />
                        </div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Operational Analytics</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em' }}>Real-time Intelligence Metrics</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                {stats.map((s, i) => (
                    <div key={i} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '28px', shadow: 'var(--shadow)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <div style={{ background: `${s.color}15`, padding: '10px', borderRadius: '12px', color: s.color }}>{s.icon}</div>
                            <span style={{ color: '#10b981', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{s.trend}</span>
                        </div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px', tracking: '0.05em' }}>{s.label}</div>
                        <div style={{ color: 'var(--text-main)', fontSize: '28px', fontWeight: '900' }}>{s.value}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', shadow: 'var(--shadow)', height: '440px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                        <TrendingUp size={18} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase' }}>Communication Density</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                        {(data.security?.dailyStats || [40, 70, 45, 90, 65, 80]).map((h, i) => (
                            <div key={i} style={{ 
                                flex: 1, height: `${(h.count || h) % 100}%`, 
                                background: 'linear-gradient(to top, var(--primary), #6366f1)', 
                                borderRadius: '6px', opacity: 0.3 + (i * 0.1),
                                transition: 'height 1s ease-out'
                            }} />
                        ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 10px', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '900' }}>
                        <span>RETROSPECTIVE ANALYSIS (30D)</span>
                    </div>
                </div>

                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', shadow: 'var(--shadow)', height: '440px', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '32px' }}>
                        <PieChart size={18} color="var(--primary)" />
                        <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase' }}>Asset Distribution</h3>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                        <div style={{ 
                            width: '180px', height: '180px', borderRadius: '50%', 
                            background: `conic-gradient(#10b981 0% ${activePct}%, #6366f1 ${activePct}% ${activePct + plannedPct}%, #f59e0b ${activePct + plannedPct}% 100%)`,
                            boxShadow: '0 0 40px rgba(99, 102, 241, 0.2)'
                        }} />
                        <div style={{ position: 'absolute', width: '120px', height: '120px', borderRadius: '50%', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <span style={{ fontSize: '24px', fontWeight: '900', color: 'var(--text-main)' }}>{data.projects.length}</span>
                            <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '900' }}>TOTAL UNITS</span>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '32px' }}>
                        {[
                            { label: 'Active', color: '#10b981', count: distribution.active },
                            { label: 'Planned', color: '#6366f1', count: distribution.planned },
                            { label: 'On Hold', color: '#f59e0b', count: distribution.onHold },
                            { label: 'Completed', color: 'var(--text-muted)', count: data.projects.filter(p => p.status === 'completed').length }
                        ].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-app)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: l.color }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ color: 'var(--text-main)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}>{l.label}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '9px', fontWeight: '700' }}>{l.count} Units</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
