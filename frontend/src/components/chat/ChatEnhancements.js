import React, { useState, useEffect } from 'react';
import { Search, X, Pin, ChevronDown, ChevronRight, FileText, Bell, BellOff, Star, Trash2, Clock, MapPin, Users, Image, Hash, LogOut, Edit2 } from 'lucide-react';

export function SearchBar({ conversationId, onResultClick }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleSearch = async (q) => {
        setQuery(q);
        if (q.length < 2) {
            setResults([]);
            setShowResults(false);
            return;
        }

        setSearching(true);
        try {
            const api = (await import('../../utils/api')).default;
            const data = await api.searchMessages(conversationId, q);
            setResults(data || []);
            setShowResults(true);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setSearching(false);
        }
    };

    return (
        <div style={{ position: 'relative' }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                background: 'var(--bg-panel)',
                borderRadius: '10px',
                padding: '10px 15px',
                border: '1px solid var(--border-color)'
            }}>
                <Search size={18} color="var(--text-muted)" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search in conversation..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: 'var(--text-main)',
                        marginLeft: '10px',
                        flex: 1,
                        fontSize: '14px'
                    }}
                />
                {query && (
                    <X
                        size={18}
                        color="var(--text-muted)"
                        style={{ cursor: 'pointer' }}
                        onClick={() => {
                            setQuery('');
                            setResults([]);
                            setShowResults(false);
                        }}
                    />
                )}
            </div>

            {showResults && results.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '8px',
                    background: 'var(--bg-panel)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: 'var(--shadow)'
                }}>
                    {results.map(msg => (
                        <div
                            key={msg.id}
                            onClick={() => {
                                onResultClick(msg.id);
                                setShowResults(false);
                            }}
                            style={{
                                padding: '12px 16px',
                                cursor: 'pointer',
                                borderBottom: '1px solid var(--border-color)',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-selected)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ color: 'var(--primary)', fontSize: '12px', marginBottom: '4px', fontWeight: '800' }}>
                                {msg.sender.firstName} {msg.sender.lastName}
                            </div>
                            <div style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                                {msg.content}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px' }}>
                                {new Date(msg.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function PinnedMessagesBanner({ conversationId, userId }) {
    const [pinnedMessages, setPinnedMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        loadPinnedMessages();
    }, [conversationId]);

    const loadPinnedMessages = async () => {
        try {
            const api = (await import('../../utils/api')).default;
            const data = await api.getPinnedMessages(conversationId);
            setPinnedMessages(data || []);
        } catch (error) {
            console.error('Failed to load pinned messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnpin = async (messageId) => {
        try {
            const api = (await import('../../utils/api')).default;
            await api.unpinMessage(conversationId, messageId);
            loadPinnedMessages();
        } catch (error) {
            console.error('Failed to unpin:', error);
        }
    };

    if (loading || pinnedMessages.length === 0) return null;

    return (
        <div style={{
            background: 'var(--bg-primary-soft)',
            borderBottom: '1px solid var(--border-primary-soft)',
            padding: '12px 30px'
        }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pin size={16} color="var(--primary)" />
                    <span style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {pinnedMessages.length} Pinned Intelligence {pinnedMessages.length > 1 ? 'Signals' : 'Signal'}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    color="var(--primary)"
                    style={{
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s'
                    }}
                />
            </div>

            {expanded && (
                <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pinnedMessages.map(pm => (
                        <div
                            key={pm.id}
                            style={{
                                background: 'var(--bg-panel)',
                                padding: '12px',
                                borderRadius: '12px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                border: '1px solid var(--border-color)'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ color: 'var(--primary)', fontSize: '12px', marginBottom: '4px', fontWeight: '800' }}>
                                    {pm.message.sender.firstName} {pm.message.sender.lastName}
                                </div>
                                <div style={{ color: 'var(--text-main)', fontSize: '14px' }}>
                                    {pm.message.content}
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '4px', fontWeight: '700' }}>
                                    PINNED BY {pm.pinnedBy.firstName.toUpperCase()} ON {new Date(pm.pinnedAt).toLocaleDateString()}
                                </div>
                            </div>
                            {pm.pinnedBy.id === userId && (
                                <X
                                    size={16}
                                    color="var(--text-muted)"
                                    style={{ cursor: 'pointer', marginLeft: '12px' }}
                                    onClick={() => handleUnpin(pm.message.id)}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function ConversationSidebar({ conversation, onClose, currentUserId, onlineUserIds, onConversationUpdated }) {
    const [activeSection, setActiveSection] = useState('members');
    const [mediaItems, setMediaItems] = useState([]);
    const [fileItems, setFileItems] = useState([]);
    const [linkItems, setLinkItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupInfo, setGroupInfo] = useState(null);
    const [infoLoading, setInfoLoading] = useState(false);

    // Group management states
    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [savingName, setSavingName] = useState(false);
    const [showAddMemberInput, setShowAddMemberInput] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [memberSearch, setMemberSearch] = useState('');
    const [addingMember, setAddingMember] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState(null);

    const isGroup = conversation?.conversationType === 'group';
    const isAdmin = groupInfo?.currentUserRole === 'admin';

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        if (!conversation?.id) return;
        const loadInfo = async () => {
            setInfoLoading(true);
            try {
                const api = (await import('../../utils/api')).default;
                const data = await api.getConversationInfo(conversation.id);
                setGroupInfo(data);
            } catch (err) {
                console.error('Failed to load conversation info:', err);
            } finally {
                setInfoLoading(false);
            }
        };
        loadInfo();
    }, [conversation?.id]);

    useEffect(() => {
        const fetchData = async () => {
            if (!conversation?.id) return;
            setLoading(true);
            try {
                const api = (await import('../../utils/api')).default;
                if (activeSection === 'media' && mediaItems.length === 0) {
                    const data = await api.getSharedMedia(conversation.id);
                    setMediaItems(data || []);
                } else if (activeSection === 'files' && fileItems.length === 0) {
                    const data = await api.getSharedFiles(conversation.id);
                    setFileItems(data || []);
                } else if (activeSection === 'links' && linkItems.length === 0) {
                    const data = await api.getSharedLinks(conversation.id);
                    setLinkItems(data || []);
                }
            } catch (error) {
                console.error('Failed to fetch shared content:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [activeSection, conversation?.id]);

    useEffect(() => {
        if (showAddMemberInput) {
            const loadUsers = async () => {
                try {
                    const api = (await import('../../utils/api')).default;
                    const users = await api.getChatUsers();
                    const memberIds = new Set(groupInfo?.members?.map(m => m.id) || []);
                    setAvailableUsers(users.filter(u => !memberIds.has(u.id)));
                } catch (err) {
                    console.error('Failed to load users:', err);
                }
            };
            loadUsers();
        }
    }, [showAddMemberInput, groupInfo]);

    const handleRenameGroup = async () => {
        if (!newGroupName.trim()) return;
        setSavingName(true);
        try {
            const api = (await import('../../utils/api')).default;
            await api.renameGroup(conversation.id, newGroupName.trim());
            setGroupInfo(prev => ({ ...prev, name: newGroupName.trim() }));
            setIsEditingName(false);
            showToast('Group renamed successfully');
            if (onConversationUpdated) onConversationUpdated();
        } catch (err) {
            showToast(err.message || 'Failed to rename group', 'error');
        } finally {
            setSavingName(false);
        }
    };

    const handleAddMember = async (userId) => {
        setAddingMember(userId);
        try {
            const api = (await import('../../utils/api')).default;
            await api.addMemberToGroup(conversation.id, userId);
            const data = await api.getConversationInfo(conversation.id);
            setGroupInfo(data);
            setShowAddMemberInput(false);
            setMemberSearch('');
            showToast('Member added successfully');
            if (onConversationUpdated) onConversationUpdated();
        } catch (err) {
            showToast(err.message || 'Failed to add member', 'error');
        } finally {
            setAddingMember(null);
        }
    };

    if (!conversation) return null;

    const members = groupInfo?.members || conversation.members || [];
    const displayName = groupInfo?.name || (isGroup ? conversation.name : `${conversation.otherUser?.firstName} ${conversation.otherUser?.lastName}`);
    const sections = [
        ...(isGroup ? [{ id: 'members', label: `Personnel (${members.length})`, icon: <Users size={18} /> }] : []),
        { id: 'media', label: 'Media Highlights', icon: <Image size={18} /> },
        { id: 'files', label: 'Tactical Assets', icon: <FileText size={18} /> },
        { id: 'links', label: 'Encrypted Links', icon: <Hash size={18} /> },
    ];

    return (
        <>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .sidebar-toast { animation: slideInRight 0.3s ease-out; }
                .member-card:hover .member-actions { opacity: 1 !important; }
            `}</style>

            {toast && (
                <div className="sidebar-toast" style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toast.type === 'error' ? 'var(--red-color)' : 'var(--green-color)',
                    color: '#fff', padding: '12px 20px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: '800', textTransform: 'uppercase',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                }}>
                    {toast.msg}
                </div>
            )}

            <div style={{
                width: '340px', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
                color: 'var(--text-main)'
            }}>
                <div style={{
                    padding: '20px 16px', borderBottom: '1px solid var(--border-color)',
                    textAlign: 'center', position: 'relative', flexShrink: 0
                }}>
                    <h3 style={{ margin: 0, fontSize: '13px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Intelligence Briefing</h3>
                    <button onClick={onClose} style={{
                        position: 'absolute', right: '12px', top: '16px', background: 'transparent',
                        border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                    }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    <div style={{ padding: '32px 16px', textAlign: 'center', borderBottom: '1px solid var(--border-color)', position: 'relative', background: 'linear-gradient(to bottom, var(--bg-light) 0%, transparent 100%)' }}>
                        <div style={{
                            width: '100px', height: '100px',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--shadow-primary) 100%)',
                            borderRadius: '35px',
                            margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '42px', fontWeight: '900', color: '#fff',
                            boxShadow: '0 15px 35px var(--shadow-primary)', position: 'relative',
                            border: '4px solid var(--bg-panel)', transform: 'rotate(-3deg)'
                        }}>
                            {isGroup ? (groupInfo?.name || conversation.name)?.charAt(0) : conversation.otherUser?.firstName?.charAt(0) || '?'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '22px', fontWeight: '900', letterSpacing: '-0.03em' }}>
                                {displayName}
                            </h3>
                            <div style={{
                                width: '24px', height: '6px', background: 'var(--primary)', borderRadius: '3px', margin: '4px auto 0', opacity: 0.3
                            }}></div>
                        </div>
                        {isGroup && isAdmin && (
                            <button onClick={() => { setNewGroupName(groupInfo?.name || ''); setIsEditingName(true); }}
                                style={{ background: 'var(--bg-light)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid var(--border-color)' }}>
                                <Edit2 size={14} color="var(--primary)" />
                            </button>
                        )}
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>AES-256 SECURED CHANNEL</p>
                    </div>

                    <div style={{
                        display: 'flex', gap: '16px', padding: '20px',
                        justifyContent: 'center', borderBottom: '8px solid var(--bg-app)'
                    }}>
                        <h4 style={{
                            margin: '0 0 12px 0', fontSize: '11px', fontWeight: '900',
                            color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <Users size={14} /> Global Operatives
                            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)', opacity: 0.5 }}></div>
                        </h4>
                        {[
                            { icon: conversation.isMuted ? <BellOff size={18} /> : <Bell size={18} />, label: 'Silence', onClick: conversation.onToggleMute },
                            { icon: <Pin size={18} />, label: 'Priority', onClick: conversation.onTogglePin, active: conversation.isPinned },
                            { icon: <Users size={18} />, label: 'Assemble', onClick: () => { } },
                        ].map((action, idx) => (
                            <div key={idx} style={{ textAlign: 'center', cursor: 'pointer', width: '70px' }} onClick={action.onClick}>
                                <div style={{
                                    width: '46px', height: '46px', background: action.active ? 'var(--primary)' : 'var(--bg-light)',
                                    borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: action.active ? '#fff' : 'var(--text-secondary)', margin: '0 auto 8px',
                                    transition: 'all 0.2s', border: '1px solid var(--border-color)'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                                    {action.icon}
                                </div>
                                <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>{action.label}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {sections.map(section => (
                            <div key={section.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <div
                                    onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                    style={{
                                        padding: '8px 12px', borderRadius: '14px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        transition: 'all 0.2s', margin: '8px 16px',
                                        background: activeSection === section.id ? 'var(--bg-light)' : 'transparent',
                                        border: activeSection === section.id ? '1px solid var(--border-color)' : '1px solid transparent',
                                        backdropFilter: activeSection === section.id ? 'blur(10px)' : 'none',
                                        WebkitBackdropFilter: activeSection === section.id ? 'blur(10px)' : 'none',
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-light)'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                                        <span style={{ color: activeSection === section.id ? 'var(--primary)' : 'var(--text-muted)' }}>{section.icon}</span>
                                        <span style={{ fontSize: '14px', fontWeight: '800', color: activeSection === section.id ? 'var(--primary)' : 'var(--text-main)' }}>{section.label}</span>
                                    </div>
                                    <ChevronRight size={16} color="var(--text-muted)" style={{
                                        transform: activeSection === section.id ? 'rotate(90deg)' : 'none',
                                        transition: 'transform 0.2s'
                                    }} />
                                </div>

                                {activeSection === section.id && (
                                    <div style={{ padding: '0 20px 20px', animation: 'slideDown 0.2s ease-out' }}>
                                        {section.id === 'members' && (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                                {members.map(member => (
                                                    <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }} className="member-card">
                                                        <div style={{ width: '36px', height: '36px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: 'var(--primary)' }}>
                                                            {member.firstName?.charAt(0)}
                                                        </div>
                                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                            <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{member.firstName} {member.lastName}</span>
                                                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: '800', textTransform: 'uppercase' }}>{member.role || 'Operative'}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setShowAddMemberInput(true)}
                                                        style={{ marginTop: '8px', width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--bg-primary-soft)', border: '1px dashed var(--primary)', color: 'var(--primary)', fontSize: '12px', fontWeight: '800', cursor: 'pointer' }}
                                                    >
                                                        + ASSIGN NEW OPERATIVE
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                        {section.id === 'media' && <MediaGallery isGroup={isGroup} conversationId={conversation.id} />}
                                        {section.id === 'files' && <FilesList isGroup={isGroup} conversationId={conversation.id} />}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: '24px 20px' }}>
                        {isGroup && (
                            <button onClick={handleLeaveGroup} style={{
                                width: '100%', background: 'var(--bg-red-soft)', border: '1px solid var(--border-color)', borderRadius: '12px',
                                padding: '12px', color: 'var(--red-color)', fontSize: '13px', fontWeight: '900', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '12px',
                                textTransform: 'uppercase', letterSpacing: '0.05em'
                            }}>
                                <LogOut size={18} /> Terminate Assignment
                            </button>
                        )}
                        <button onClick={() => conversation.onDelete && conversation.onDelete()} style={{
                            width: '100%', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '12px',
                            padding: '12px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '900', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            textTransform: 'uppercase', letterSpacing: '0.05em'
                        }}>
                            <Trash2 size={18} /> Purge Intelligence History
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

export function PollModal({ onClose, onCreate }) {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const addOption = () => setOptions([...options, '']);
    const removeOption = (index) => setOptions(options.filter((_, i) => i !== index));
    const updateOption = (index, value) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, backdropFilter: 'blur(8px)'
        }}>
            <div style={{
                width: '420px', background: 'var(--bg-panel)', borderRadius: '24px',
                border: '1px solid var(--border-color)', padding: '32px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '20px', fontWeight: '900' }}>Tactical Survey</h3>
                    <X size={24} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>CORE QUERY</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="State your objective..."
                        style={{
                            width: '100%', background: 'var(--bg-light)', border: '1px solid var(--border-color)',
                            borderRadius: '12px', padding: '14px', color: 'var(--text-main)', outline: 'none', fontWeight: '700'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>DEPLOYMENT OPTIONS</label>
                    {options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(i, e.target.value)}
                                placeholder={`Vector ${i + 1}`}
                                style={{
                                    flex: 1, background: 'var(--bg-light)', border: '1px solid var(--border-color)',
                                    borderRadius: '12px', padding: '12px', color: 'var(--text-main)', outline: 'none', fontWeight: '600'
                                }}
                            />
                            {options.length > 2 && (
                                <button onClick={() => removeOption(i)} style={{ background: 'transparent', border: 'none', color: 'var(--red-color)', cursor: 'pointer' }}><X size={18} /></button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addOption}
                        style={{
                            background: 'transparent', border: '1px dashed var(--border-color)',
                            color: 'var(--primary)', width: '100%', padding: '12px',
                            borderRadius: '12px', cursor: 'pointer', marginTop: '4px', fontWeight: '800', fontSize: '12px'
                        }}
                    >
                        + ADD VECTOR
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (!question.trim() || options.some(o => !o.trim())) {
                            alert('Protocol failure: Empty fields detected');
                            return;
                        }
                        onCreate({ question, options: options.filter(o => o.trim()) });
                        onClose();
                    }}
                    style={{
                        width: '100%', background: 'var(--primary)', color: '#fff',
                        border: 'none', padding: '16px', borderRadius: '16px',
                        fontWeight: '900', cursor: 'pointer', boxShadow: '0 8px 20px var(--shadow-primary)',
                        textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}
                >
                    INITIALIZE SURVEY
                </button>
            </div>
        </div>
    );
}

export function StickerPicker({ onSelect, onClose }) {
    const stickers = [
        '👍', '❤️', '😂', '😯', '😭', '😡', '🙏', '🔥', '✨', '🎉',
        '😎', '🤔', '👀', '🙌', '💯', '🚀', '🌈', '🍦', '🍕', '🐱'
    ];

    return (
        <div style={{
            position: 'absolute', bottom: '100%', left: 0, marginBottom: '10px',
            background: 'var(--bg-panel)', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)', padding: '16px', width: '300px', zIndex: 1000,
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Signals</span>
                <X size={16} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={onClose} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', maxHeight: '240px', overflowY: 'auto' }}>
                {stickers.map(s => (
                    <div
                        key={s}
                        onClick={() => { onSelect(s); onClose(); }}
                        style={{
                            fontSize: '28px', textAlign: 'center', cursor: 'pointer', padding: '10px',
                            borderRadius: '12px', transition: 'all 0.2s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-light)'; e.currentTarget.style.transform = 'scale(1.2)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {s}
                    </div>
                ))}
            </div>
        </div>
    );
}

function MediaGallery({ conversationId, isGroup }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '12px' }}>
            <div style={{ aspectRatio: '1/1', background: 'var(--bg-light)', borderRadius: '8px', display: 'flex', border: '1px solid var(--border-color)', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '10px', fontWeight: '800' }}>EMPTY REPO</div>
        </div>
    );
}

function FilesList({ conversationId, isGroup }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px', fontWeight: '700', border: '1px dashed var(--border-color)', borderRadius: '12px' }}>NO ASSETS DETECTED</div>
        </div>
    );
}
