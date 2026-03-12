import React, { useState, useEffect } from 'react';
import { 
    Layers, Plus, Search, Calendar, Users, 
    RefreshCw, MoreHorizontal, CheckCircle2, Circle,
    AlertCircle, Shield, ChevronRight, X
} from 'lucide-react';
import api from '../../utils/api';

export default function ManageProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [newTaskName, setNewTaskName] = useState('');
    const [search, setSearch] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await api.getProjects();
            setProjects(data || []);
        } catch (error) {
            console.error('Failed to load projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const fetchTasks = async (projectId) => {
        try {
            setLoadingTasks(true);
            const data = await api.getProjectTasks(projectId);
            setTasks(data || []);
        } catch (err) {
            console.error('Task fetch failed:', err);
        } finally {
            setLoadingTasks(false);
        }
    };

    const handleProjectClick = (project) => {
        setSelectedProject(project);
        fetchTasks(project.id);
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskName.trim() || !selectedProject) return;
        try {
            await api.createTask(selectedProject.id, { title: newTaskName, status: 'pending' });
            setNewTaskName('');
            fetchTasks(selectedProject.id);
            loadData(); // Update progress in list
        } catch (err) {
            alert('Task creation failed: ' + err.message);
        }
    };

    const toggleTaskStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
        try {
            await api.updateTask(task.id, { status: newStatus });
            fetchTasks(selectedProject.id);
            loadData();
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const filtered = projects.filter(p => 
        p.name?.toLowerCase().includes(search.toLowerCase()) || 
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status) => ({
        active: '#10b981', planned: '#667eea', on_hold: '#f59e0b', completed: '#8b98a5'
    }[status] || '#8b98a5');

    const calculateProgress = (projectTasks) => {
        if (!projectTasks || projectTasks.length === 0) return 0;
        const completed = projectTasks.filter(t => t.status === 'completed').length;
        return Math.round((completed / projectTasks.length) * 100);
    };

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            {/* Header section */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', shadow: 'var(--shadow-primary)' }}>
                            <Layers size={20} color="#fff" />
                        </div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Asset Repository</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', tracking: '0.05em' }}>
                        {projects.length} Strategic Assets Under Overwatch
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ 
                        background: 'var(--bg-panel)', border: '1px solid var(--border-color)', 
                        borderRadius: '14px', padding: '0 16px', display: 'flex', 
                        alignItems: 'center', gap: '10px', width: '260px', height: '48px'
                    }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Filter by asset ID..."
                            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '13px', fontWeight: '600' }}
                        />
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        style={{ 
                            background: 'var(--primary)', color: '#fff', border: 'none', 
                            borderRadius: '14px', padding: '0 24px', fontSize: '12px', 
                            fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', 
                            cursor: 'pointer', shadow: 'var(--shadow-primary)', textTransform: 'uppercase',
                            height: '48px'
                        }}
                    >
                        <Plus size={18} /> Initialize Asset
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <p className="font-black text-[10px] uppercase tracking-[0.2em]">Synchronizing Repository...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {filtered.map(project => {
                        const progress = calculateProgress(project.tasks);
                        return (
                            <div key={project.id} style={{
                                background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-color)', 
                                padding: '32px', transition: 'all 0.3s ease', cursor: 'pointer', shadow: 'var(--shadow)',
                                position: 'relative', overflow: 'hidden'
                            }}
                                onClick={() => handleProjectClick(project)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <span style={{ 
                                        background: `${getStatusColor(project.status)}15`, 
                                        color: getStatusColor(project.status), 
                                        fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', 
                                        padding: '6px 14px', borderRadius: '8px', tracking: '0.1em',
                                        border: `1px solid ${getStatusColor(project.status)}20`
                                    }}>
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                    <div style={{ color: 'var(--text-muted)' }}><ChevronRight size={20} /></div>
                                </div>

                                <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '12px', color: 'var(--text-main)', tracking: '-0.01em' }}>{project.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.6', fontWeight: '500' }}>
                                    {project.description || 'Enterprise grade initiative with designated oversight and security protocols.'}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        <Calendar size={14} color="var(--primary)" /> 
                                        {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Unscheduled'}
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        <Users size={14} color="var(--primary)" /> {project.tasks?.length || 0} Tasks
                                    </div>
                                </div>

                                <div style={{ background: 'var(--bg-app)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase', tracking: '0.05em' }}>
                                        <span>Sync Progression</span>
                                        <span style={{ color: 'var(--text-main)' }}>{progress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--bg-light)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)', borderRadius: '10px' }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detailed Task View Drawer/Modal */}
            {selectedProject && (
                <div style={{ 
                    position: 'fixed', right: 0, top: 0, bottom: 0, width: '500px', 
                    background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', 
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', zIndex: 1000,
                    display: 'flex', flexDirection: 'column',
                    animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}>
                    <header style={{ padding: '32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em', marginBottom: '8px', display: 'block' }}>Operational Detail</span>
                            <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '20px', fontWeight: '900' }}>{selectedProject.name}</h2>
                        </div>
                        <button onClick={() => setSelectedProject(null)} style={{ background: 'var(--bg-light)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                    </header>

                    <div style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
                        <div style={{ marginBottom: '32px' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em', display: 'block', marginBottom: '16px' }}>Objective Narrative</label>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.7', fontWeight: '500' }}>{selectedProject.description}</p>
                        </div>

                        <div style={{ marginBottom: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em' }}>Intelligence Tasks</label>
                                <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: '900' }}>{tasks.filter(t => t.status === 'completed').length}/{tasks.length} SECURED</span>
                            </div>
                            
                            <form onSubmit={handleAddTask} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                                <input 
                                    value={newTaskName}
                                    onChange={e => setNewTaskName(e.target.value)}
                                    placeholder="Assign new directive..."
                                    style={{ flex: 1, background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '12px 16px', color: 'var(--text-main)', outline: 'none', fontSize: '13px', fontWeight: '600' }}
                                />
                                <button type="submit" style={{ background: 'var(--primary)', border: 'none', borderRadius: '12px', padding: '12px', color: '#fff', cursor: 'pointer' }}>
                                    <Plus size={20} />
                                </button>
                            </form>

                            {loadingTasks ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}><RefreshCw size={24} className="animate-spin" style={{ opacity: 0.2 }} /></div>
                            ) : (
                                <div style={{ display: 'grid', gap: '12px' }}>
                                    {tasks.map(task => (
                                        <div key={task.id} style={{ 
                                            display: 'flex', alignItems: 'center', gap: '14px', padding: '16px',
                                            background: task.status === 'completed' ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-app)',
                                            border: `1px solid ${task.status === 'completed' ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`,
                                            borderRadius: '14px', transition: 'all 0.2s'
                                        }}>
                                            <button 
                                                onClick={() => toggleTaskStatus(task)}
                                                style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex' }}
                                            >
                                                {task.status === 'completed' ? 
                                                    <CheckCircle2 color="#10b981" size={20} /> : 
                                                    <Circle color="var(--text-muted)" size={20} />
                                                }
                                            </button>
                                            <span style={{ 
                                                flex: 1, color: task.status === 'completed' ? '#10b981' : 'var(--text-main)', 
                                                fontSize: '13px', fontWeight: '700',
                                                textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                                opacity: task.status === 'completed' ? 0.7 : 1
                                            }}>
                                                {task.title}
                                            </span>
                                        </div>
                                    ))}
                                    {tasks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '20px' }}>No active directives for this asset.</p>}
                                </div>
                            )}
                        </div>
                    </div>

                    <footer style={{ padding: '32px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '12px' }}>
                        <button style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Export Manifest</button>
                        <button style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: '900', fontSize: '11px', textTransform: 'uppercase', cursor: 'pointer' }}>Decommission</button>
                    </footer>
                </div>
            )}

            {/* Create Project Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(14,22,33,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(12px)' }}>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const fd = new FormData(e.target);
                            try {
                                await api.createProject({ name: fd.get('name'), description: fd.get('description'), securityLevel: parseInt(fd.get('securityLevel')), status: 'planned' });
                                setShowCreateModal(false);
                                loadData();
                            } catch (err) { alert('Authorization Error: ' + err.message); }
                        }}
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '48px', width: '100%', maxWidth: '480px', shadow: 'var(--shadow)' }}
                    >
                        <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                            <Shield size={28} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)', textTransform: 'uppercase', tracking: '-0.02em' }}>Initialize Asset</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '40px', fontWeight: '600' }}>Define project parameters and security classifications for deployment.</p>
                        
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em' }}>Project Identification</label>
                                <input name="name" type="text" required placeholder="Enter designation..." style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em' }}>Scope Analysis</label>
                                <textarea name="description" rows="3" placeholder="Define core objectives..." style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', lineHeight: '1.6' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.1em' }}>Classification Clearance</label>
                                <select name="securityLevel" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', fontWeight: '600' }}>
                                    <option value="1">L1: Standard Protocol</option>
                                    <option value="2">L2: Restricted Access</option>
                                    <option value="3">L3: Confidential Stream</option>
                                    <option value="4">L4: Secret Protocol</option>
                                    <option value="5">L5: Sovereign Clearance</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '900', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', tracking: '0.05em' }}>Abort</button>
                                <button type="submit" style={{ flex: 1, padding: '18px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase', tracking: '0.05em', shadow: 'var(--shadow-primary)' }}>Authorize</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
