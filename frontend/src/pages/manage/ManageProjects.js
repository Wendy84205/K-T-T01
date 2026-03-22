import React, { useState, useEffect } from 'react';
import { 
    Layers, Plus, Search, Calendar, Users, 
    RefreshCw, CheckCircle2, Circle,
    Shield, ChevronRight, X, User, Flag, Clock
} from 'lucide-react';
import api from '../../utils/api';

export default function ManageProjects() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loadingTasks, setLoadingTasks] = useState(false);
    const [search, setSearch] = useState('');
    const [teamMembers, setTeamMembers] = useState([]);

    // New task form state
    const [newTask, setNewTask] = useState({
        title: '',
        assigneeId: '',
        priority: 'medium',
        dueDate: '',
    });

    const loadData = async () => {
        try {
            setLoading(true);
            const [data, users] = await Promise.all([
                api.getProjects(),
                api.getChatUsers(), // reuse existing user list endpoint
            ]);
            setProjects(data || []);
            setTeamMembers(users || []);
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
        if (!newTask.title.trim() || !selectedProject) return;
        try {
            await api.createTask(selectedProject.id, {
                title: newTask.title,
                status: 'todo',
                priority: newTask.priority,
                assigneeId: newTask.assigneeId || undefined,
                dueDate: newTask.dueDate || undefined,
            });
            setNewTask({ title: '', assigneeId: '', priority: 'medium', dueDate: '' });
            fetchTasks(selectedProject.id);
            loadData();
        } catch (err) {
            alert('Task creation failed: ' + err.message);
        }
    };

    const toggleTaskStatus = async (task) => {
        const statusCycle = { todo: 'in_progress', in_progress: 'done', done: 'todo' };
        const newStatus = statusCycle[task.status] ?? 'todo';
        try {
            await api.updateTask(task.id, { status: newStatus });
            fetchTasks(selectedProject.id);
            loadData();
        } catch (err) {
            alert('Update failed: ' + err.message);
        }
    };

    const getAssigneeName = (task) => {
        if (task.assignee) return `${task.assignee.firstName} ${task.assignee.lastName}`;
        if (task.assigneeId) {
            const m = teamMembers.find(u => u.id === task.assigneeId);
            return m ? `${m.firstName} ${m.lastName}` : 'Unknown';
        }
        return null;
    };

    const filtered = projects.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status) => ({
        active: '#10b981', planned: '#667eea', on_hold: '#f59e0b', completed: '#8b98a5'
    }[status] || '#8b98a5');

    const getPriorityColor = (priority) => ({
        low: '#8b98a5', medium: '#667eea', high: '#f59e0b', critical: '#ef4444'
    }[priority] || '#8b98a5');

    const getTaskStatusIcon = (status) => {
        if (status === 'done') return <CheckCircle2 color="#10b981" size={18} />;
        if (status === 'in_progress') return <RefreshCw color="#667eea" size={18} className="animate-spin" style={{animationDuration:'3s'}} />;
        return <Circle color="var(--text-muted)" size={18} />;
    };

    const calculateProgress = (projectTasks) => {
        if (!projectTasks || projectTasks.length === 0) return 0;
        const done = projectTasks.filter(t => t.status === 'done').length;
        return Math.round((done / projectTasks.length) * 100);
    };

    return (
        <div style={{ padding: '32px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Layers size={20} color="#fff" />
                        </div>
                        <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Asset Repository</h2>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>
                        {projects.length} Strategic Assets
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px', width: '260px', height: '48px' }}>
                        <Search size={16} color="var(--text-muted)" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter assets..." style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '13px', fontWeight: '600' }} />
                    </div>
                    <button onClick={() => setShowCreateModal(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '14px', padding: '0 24px', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', textTransform: 'uppercase', height: '48px' }}>
                        <Plus size={18} /> Initialize Asset
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                    <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                    <p style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}>Synchronizing...</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                    {filtered.map(project => {
                        const progress = calculateProgress(project.tasks);
                        return (
                            <div key={project.id} style={{ background: 'var(--bg-panel)', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '32px', transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                                onClick={() => handleProjectClick(project)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                                    <span style={{ background: `${getStatusColor(project.status)}15`, color: getStatusColor(project.status), fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', padding: '6px 14px', borderRadius: '8px', border: `1px solid ${getStatusColor(project.status)}20` }}>
                                        {project.status?.replace('_', ' ')}
                                    </span>
                                    <div style={{ color: 'var(--text-muted)' }}><ChevronRight size={20} /></div>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', marginBottom: '12px', color: 'var(--text-main)' }}>{project.name}</h3>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '24px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.6', fontWeight: '500' }}>
                                    {project.description || 'Enterprise grade initiative with security protocols.'}
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
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: '900', marginBottom: '10px', textTransform: 'uppercase' }}>
                                        <span>Progress</span>
                                        <span style={{ color: 'var(--text-main)' }}>{progress}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--bg-light)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                        <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), #10b981)', borderRadius: '10px', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                                {/* Quick Add Task Button */}
                                <button
                                    onClick={e => { e.stopPropagation(); handleProjectClick(project); }}
                                    style={{
                                        marginTop: '16px', width: '100%', padding: '10px',
                                        background: 'transparent', border: '1px dashed var(--border-color)',
                                        borderRadius: '12px', color: 'var(--text-muted)', cursor: 'pointer',
                                        fontSize: '11px', fontWeight: '900', textTransform: 'uppercase',
                                        letterSpacing: '0.05em', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', gap: '6px', transition: 'all 0.2s',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'var(--primary-light)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <Plus size={13} /> Add Task
                                </button>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && !loading && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: 'var(--text-muted)' }}>
                            <Layers size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                            <p style={{ fontSize: '13px', fontWeight: '700' }}>No assets found. Initialize the first one.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Task Drawer */}
            {selectedProject && (
                <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '520px', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)', boxShadow: '-10px 0 30px rgba(0,0,0,0.2)', zIndex: 1000, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <header style={{ padding: '28px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
                        <div>
                            <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px', display: 'block' }}>Project Detail</span>
                            <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '20px', fontWeight: '900' }}>{selectedProject.name}</h2>
                        </div>
                        <button onClick={() => setSelectedProject(null)} style={{ background: 'var(--bg-light)', border: 'none', borderRadius: '12px', padding: '8px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                            <X size={20} />
                        </button>
                    </header>

                    <div style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
                        {/* Add Task Form */}
                        <div style={{ marginBottom: '28px', background: 'var(--bg-app)', borderRadius: '20px', padding: '20px', border: '1px solid var(--border-color)' }}>
                            <label style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: '14px' }}>
                                Assign New Task
                            </label>
                            <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <input
                                    value={newTask.title}
                                    onChange={e => setNewTask(p => ({ ...p, title: e.target.value }))}
                                    placeholder="Task title..."
                                    required
                                    style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', color: 'var(--text-main)', outline: 'none', fontSize: '13px', fontWeight: '600' }}
                                />
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                    {/* Assignee Picker */}
                                    <div style={{ position: 'relative' }}>
                                        <User size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                        <select
                                            value={newTask.assigneeId}
                                            onChange={e => setNewTask(p => ({ ...p, assigneeId: e.target.value }))}
                                            style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 10px 10px 30px', color: newTask.assigneeId ? 'var(--text-main)' : 'var(--text-muted)', outline: 'none', fontSize: '12px', fontWeight: '700', appearance: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="">Assign to...</option>
                                            {teamMembers.map(m => (
                                                <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {/* Priority */}
                                    <div style={{ position: 'relative' }}>
                                        <Flag size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: getPriorityColor(newTask.priority) }} />
                                        <select
                                            value={newTask.priority}
                                            onChange={e => setNewTask(p => ({ ...p, priority: e.target.value }))}
                                            style={{ width: '100%', background: 'var(--bg-panel)', border: `1px solid ${getPriorityColor(newTask.priority)}40`, borderRadius: '10px', padding: '10px 10px 10px 30px', color: getPriorityColor(newTask.priority), outline: 'none', fontSize: '12px', fontWeight: '700', appearance: 'none', cursor: 'pointer' }}
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                            <option value="critical">Critical</option>
                                        </select>
                                    </div>
                                </div>
                                {/* Due Date */}
                                <div style={{ position: 'relative' }}>
                                    <Clock size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                    <input
                                        type="date"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask(p => ({ ...p, dueDate: e.target.value }))}
                                        style={{ width: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 10px 10px 30px', color: 'var(--text-main)', outline: 'none', fontSize: '12px', fontWeight: '600', boxSizing: 'border-box', colorScheme: 'dark' }}
                                    />
                                </div>
                                <button type="submit" style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '11px', color: '#fff', cursor: 'pointer', fontWeight: '900', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    + Create Task
                                </button>
                            </form>
                        </div>

                        {/* Task List */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                                <label style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Tasks</label>
                                <span style={{ color: 'var(--primary)', fontSize: '10px', fontWeight: '900' }}>
                                    {tasks.filter(t => t.status === 'done').length}/{tasks.length} Done
                                </span>
                            </div>
                            {loadingTasks ? (
                                <div style={{ textAlign: 'center', padding: '20px' }}><RefreshCw size={24} className="animate-spin" style={{ opacity: 0.2 }} /></div>
                            ) : (
                                <div style={{ display: 'grid', gap: '10px' }}>
                                    {tasks.map(task => {
                                        const isDone = task.status === 'done';
                                        const assigneeName = getAssigneeName(task);
                                        return (
                                            <div key={task.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '14px 16px', background: isDone ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-app)', border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.2)' : 'var(--border-color)'}`, borderRadius: '14px', transition: 'all 0.2s' }}>
                                                <button onClick={() => toggleTaskStatus(task)} style={{ background: 'transparent', border: 'none', padding: '2px 0 0 0', cursor: 'pointer', flexShrink: 0 }}>
                                                    {getTaskStatusIcon(task.status)}
                                                </button>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <span style={{ display: 'block', color: isDone ? '#10b981' : 'var(--text-main)', fontSize: '13px', fontWeight: '700', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>
                                                        {task.title}
                                                    </span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                                                        {assigneeName && (
                                                            <span style={{ fontSize: '10px', fontWeight: '800', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <User size={10} /> {assigneeName}
                                                            </span>
                                                        )}
                                                        {task.priority && (
                                                            <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', color: getPriorityColor(task.priority), background: `${getPriorityColor(task.priority)}15`, padding: '2px 8px', borderRadius: '6px' }}>
                                                                {task.priority}
                                                            </span>
                                                        )}
                                                        {task.dueDate && (
                                                            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <Clock size={10} /> {new Date(task.dueDate).toLocaleDateString()}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {tasks.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '20px' }}>No tasks yet. Assign the first one above.</p>}
                                </div>
                            )}
                        </div>
                    </div>
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
                            } catch (err) { alert('Error: ' + err.message); }
                        }}
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '32px', padding: '48px', width: '100%', maxWidth: '480px' }}
                    >
                        <div style={{ width: '56px', height: '56px', background: 'var(--primary-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                            <Shield size={28} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)', textTransform: 'uppercase' }}>Initialize Asset</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '40px', fontWeight: '600' }}>Define project parameters and security classifications.</p>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Project Name</label>
                                <input name="name" type="text" required placeholder="Enter designation..." style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Description</label>
                                <textarea name="description" rows="3" placeholder="Define core objectives..." style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '14px', fontWeight: '600', boxSizing: 'border-box', lineHeight: '1.6' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '10px', marginBottom: '10px', fontWeight: '900', textTransform: 'uppercase' }}>Security Level</label>
                                <select name="securityLevel" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', fontWeight: '600' }}>
                                    <option value="1">L1: Standard</option>
                                    <option value="2">L2: Restricted</option>
                                    <option value="3">L3: Confidential</option>
                                    <option value="4">L4: Secret</option>
                                    <option value="5">L5: Sovereign</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '16px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '18px', borderRadius: '14px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '900', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>Abort</button>
                                <button type="submit" style={{ flex: 1, padding: '18px', borderRadius: '14px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: '900', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>Authorize</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
