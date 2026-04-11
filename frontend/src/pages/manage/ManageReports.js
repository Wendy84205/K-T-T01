import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, PieChart, Activity, ShieldCheck, Zap, RefreshCw, ClipboardList, Clock, Flag, CheckCircle2, AlertCircle, MessageSquare, FileText } from 'lucide-react';
import api from '../../utils/api';

export default function ManageReports() {
    const [data, setData] = useState({ projects: [], allTasks: [], loading: true });
    const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'progress'

    const loadData = async () => {
        try {
            setData(prev => ({ ...prev, loading: true }));
            const projects = await api.getProjects().catch(() => []);
            // Flatten all tasks from projects, keeping project reference
            const allTasks = (projects || []).flatMap(p =>
                (p.tasks || []).map(t => ({ ...t, project: { id: p.id, name: p.name } }))
            );
            setData({ projects: projects || [], allTasks, loading: false });
        } catch (err) {
            console.error('Analytics fetch failed:', err);
            setData(prev => ({ ...prev, loading: false }));
        }
    };

    useEffect(() => { loadData(); }, []);

    if (data.loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
                <RefreshCw size={32} style={{ marginBottom: '16px', opacity: 0.2, animation: 'spin 1s linear infinite' }} />
                <p style={{ fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Aggregating Intelligence Streams...</p>
            </div>
        );
    }

    const distribution = {
        active: data.projects.filter(p => p.status === 'active').length,
        planned: data.projects.filter(p => p.status === 'planned').length,
        onHold: data.projects.filter(p => p.status === 'on_hold').length,
        completed: data.projects.filter(p => p.status === 'completed').length,
    };
    const total = data.projects.length || 1;
    const activePct = (distribution.active / total) * 100;
    const plannedPct = (distribution.planned / total) * 100;
    const onHoldPct = (distribution.onHold / total) * 100;
    const completedPct = (distribution.completed / total) * 100;

    // Task progress notes – tasks that have a progressNote from an assignee
    const tasksWithNotes = data.allTasks.filter(t => t.progressNote);
    const overdueCount = data.allTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done' && t.status !== 'completed').length;

    const PRIORITY_COLOR = { low: '#8b98a5', medium: '#667eea', high: '#f59e0b', critical: '#ef4444' };
    const STATUS_COLOR = { todo: '#8b98a5', in_progress: '#667eea', done: '#10b981', pending: '#f59e0b', completed: '#10b981' };

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <BarChart3 size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Operational Reports</h2>
                        <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>Real-time Intelligence & Task Progress</p>
                    </div>
                </div>
                <button onClick={loadData} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>
                    <RefreshCw size={13} /> Refresh
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '28px' }}>
                {[
                    { id: 'analytics', label: 'Analytics', icon: <Activity size={15} /> },
                    { id: 'progress', label: `Progress Reports ${tasksWithNotes.length > 0 ? `(${tasksWithNotes.length})` : ''}`, icon: <FileText size={15} /> },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '10px 20px', background: activeTab === tab.id ? 'var(--primary)' : 'var(--bg-panel)',
                        color: activeTab === tab.id ? '#fff' : 'var(--text-muted)',
                        border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--border-color)'}`,
                        borderRadius: '12px', cursor: 'pointer', fontWeight: '900', fontSize: '12px',
                        textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '8px',
                        transition: 'all 0.2s'
                    }}>
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ---- ANALYTICS TAB ---- */}
            {activeTab === 'analytics' && (
                <div>
                    {/* Summary cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                        {[
                            { label: 'Total Tasks', value: data.allTasks.length, icon: <ClipboardList size={18} />, color: 'var(--primary)' },
                            { label: 'Completed', value: data.allTasks.filter(t => t.status === 'done' || t.status === 'completed').length, icon: <CheckCircle2 size={18} />, color: '#10b981' },
                            { label: 'In Progress', value: data.allTasks.filter(t => t.status === 'in_progress').length, icon: <Activity size={18} />, color: '#667eea' },
                            { label: 'Overdue', value: overdueCount, icon: <AlertCircle size={18} />, color: overdueCount > 0 ? '#ef4444' : '#8b98a5' },
                            { label: 'Progress Reports', value: tasksWithNotes.length, icon: <MessageSquare size={18} />, color: '#f59e0b' },
                        ].map((s, i) => (
                            <div key={i} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ background: `${s.color}15`, padding: '8px', borderRadius: '10px', color: s.color, width: 'fit-content' }}>{s.icon}</div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
                                <div style={{ color: 'var(--text-main)', fontSize: '28px', fontWeight: '900' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Charts */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
                        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', height: '380px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <TrendingUp size={18} color="var(--primary)" />
                                {(() => {
                                    const days = Array.from({length: 7}).map((_, i) => {
                                        const d = new Date();
                                        d.setDate(d.getDate() - (6 - i));
                                        d.setHours(0,0,0,0);
                                        return d;
                                    });
                                    const activityData = days.map(d => {
                                        const nextD = new Date(d);
                                        nextD.setDate(nextD.getDate() + 1);
                                        const count = data.allTasks.filter(t => {
                                            const updated = new Date(t.updatedAt || t.createdAt || new Date());
                                            return updated >= d && updated < nextD;
                                        }).length;
                                        return { date: d, count };
                                    });
                                    
                                    const maxVal = Math.max(...activityData.map(d => d.count), 5);
                                    return activityData.map((item, i) => {
                                        const heightPct = Math.max(8, Math.round((item.count / maxVal) * 100));
                                        const isToday = i === 6;
                                        return (
                                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', height: '100%', justifyContent: 'flex-end', position: 'relative' }}>
                                                <div title={`${item.count} tasks updated`} style={{
                                                    width: '100%',
                                                    height: `${heightPct}%`,
                                                    background: isToday ? `linear-gradient(to top, var(--primary), #818cf8)` : `linear-gradient(to top, rgba(99,102,241,0.1), rgba(99,102,241,0.5))`,
                                                    borderRadius: '6px 6px 0 0',
                                                    transition: 'all 0.3s ease',
                                                    boxShadow: isToday ? '0 0 12px rgba(99,102,241,0.4)' : 'none',
                                                    cursor: 'pointer'
                                                }} />
                                                <div style={{ fontSize: '9px', fontWeight: isToday ? '900' : '700', color: isToday ? 'var(--text-main)' : 'var(--text-muted)', textTransform: 'uppercase' }}>
                                                    {item.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                        <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '32px', height: '380px', display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
                                <PieChart size={18} color="var(--primary)" />
                                <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase' }}>Project Distribution</h3>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                <style>
                                    {`
                                        @keyframes ringDrawScale {
                                            from { transform: scale(0.85); opacity: 0; }
                                            to { transform: scale(1); opacity: 1; }
                                        }
                                        .donut-segment {
                                            animation: ringDrawScale 0.8s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
                                        }
                                    `}
                                </style>
                                <svg viewBox="0 0 36 36" style={{ width: '160px', height: '160px', transform: 'rotate(-90deg)', filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.2))' }}>
                                    {/* Background ring */}
                                    <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(139,152,165,0.15)" strokeWidth="3" />
                                    {(() => {
                                        if (data.projects.length === 0) return null;
                                        let cum = 0;
                                        return [
                                            { val: activePct, color: '#10b981' },
                                            { val: plannedPct, color: '#6366f1' },
                                            { val: onHoldPct, color: '#f59e0b' },
                                            { val: completedPct, color: 'rgba(139,152,165,0.4)' }
                                        ].map((slice, i) => {
                                            if (slice.val === 0) return null;
                                            const offset = 100 - cum;
                                            cum += slice.val;
                                            return (
                                                <circle key={i} cx="18" cy="18" r="15.915" fill="none" stroke={slice.color} strokeWidth="3.5"
                                                    strokeDasharray={`${slice.val} ${100 - slice.val}`} strokeDashoffset={offset}
                                                    className="donut-segment"
                                                    style={{ animationDelay: `${i * 0.15}s`, opacity: 0, transformOrigin: 'center' }}
                                                />
                                            );
                                        });
                                    })()}
                                </svg>
                                <div style={{ position: 'absolute', width: '100px', height: '100px', borderRadius: '50%', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                    <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)' }}>{data.projects.length}</span>
                                    <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: '900' }}>PROJECTS</span>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                                {[
                                    { label: 'Active', color: '#10b981', count: distribution.active },
                                    { label: 'Planned', color: '#6366f1', count: distribution.planned },
                                    { label: 'On Hold', color: '#f59e0b', count: distribution.onHold },
                                    { label: 'Done', color: 'var(--text-muted)', count: distribution.completed }
                                ].map(l => (
                                    <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-app)', padding: '8px 10px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                                        <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: l.color }} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: 'var(--text-main)', fontSize: '9px', fontWeight: '900', textTransform: 'uppercase' }}>{l.label}</div>
                                            <div style={{ color: 'var(--text-muted)', fontSize: '8px', fontWeight: '700' }}>{l.count}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ---- PROGRESS REPORTS TAB ---- */}
            {activeTab === 'progress' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {tasksWithNotes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '80px 40px', background: 'var(--bg-panel)', borderRadius: '24px', border: '1px dashed var(--border-color)' }}>
                            <ClipboardList size={48} style={{ margin: '0 auto 16px', opacity: 0.15, display: 'block' }} />
                            <p style={{ color: 'var(--text-muted)', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                No progress reports submitted yet.
                            </p>
                            <p style={{ color: 'var(--text-muted)', fontWeight: '500', fontSize: '12px', marginTop: '8px' }}>
                                Users will appear here when they submit progress notes from their Task Board.
                            </p>
                        </div>
                    ) : (
                        tasksWithNotes.map(task => {
                            const priorityColor = PRIORITY_COLOR[task.priority] || '#8b98a5';
                            const statusColor = STATUS_COLOR[task.status] || '#8b98a5';
                            const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' && task.status !== 'completed';
                            return (
                                <div key={task.id} style={{ background: 'var(--bg-panel)', borderRadius: '20px', border: `1px solid ${overdue ? '#ef444430' : 'var(--border-color)'}`, padding: '20px 24px' }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                                        <div>
                                            <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '15px' }}>{task.title}</div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: '600', marginTop: '3px' }}>
                                                Project: {task.project?.name || 'Unknown'}
                                                {task.assignee && ` · Assigned to: ${task.assignee.firstName} ${task.assignee.lastName}`}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                                            <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: statusColor, background: `${statusColor}15`, padding: '3px 8px', borderRadius: '6px' }}>
                                                {task.status}
                                            </span>
                                            {task.priority && (
                                                <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: priorityColor, background: `${priorityColor}15`, padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                                    <Flag size={8} />{task.priority}
                                                </span>
                                            )}
                                            {overdue && (
                                                <span style={{ fontSize: '9px', fontWeight: '900', color: '#ef4444', background: '#ef444415', padding: '3px 8px', borderRadius: '6px' }}>
                                                    OVERDUE
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Note */}
                                    <div style={{ background: 'rgba(102,126,234,0.06)', border: '1px solid rgba(102,126,234,0.15)', borderRadius: '12px', padding: '14px 16px' }}>
                                        <div style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <MessageSquare size={11} /> Progress Report
                                        </div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-main)', fontWeight: '500', lineHeight: '1.6' }}>
                                            {task.progressNote}
                                        </div>
                                        {task.lastProgressNoteAt && (
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Clock size={10} />
                                                {new Date(task.lastProgressNoteAt).toLocaleString('vi-VN')}
                                            </div>
                                        )}
                                    </div>

                                    {task.dueDate && (
                                        <div style={{ marginTop: '10px', fontSize: '11px', color: overdue ? '#ef4444' : 'var(--text-muted)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Clock size={11} /> Due: {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
