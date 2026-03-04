import React, { useState, useEffect } from 'react';
import { Search, X, Pin, ChevronDown, FileText, Bell, BellOff, Star, Trash2, Clock, MapPin } from 'lucide-react';

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
                background: '#1a2332',
                borderRadius: '10px',
                padding: '10px 15px',
                border: '1px solid #2a3441'
            }}>
                <Search size={18} color="#8b98a5" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search in conversation..."
                    style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        marginLeft: '10px',
                        flex: 1,
                        fontSize: '14px'
                    }}
                />
                {query && (
                    <X
                        size={18}
                        color="#8b98a5"
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
                    background: '#151f2e',
                    border: '1px solid #2a3441',
                    borderRadius: '10px',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
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
                                borderBottom: '1px solid #2a3441',
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#1a2332'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            <div style={{ color: '#667eea', fontSize: '12px', marginBottom: '4px' }}>
                                {msg.sender.firstName} {msg.sender.lastName}
                            </div>
                            <div style={{ color: '#fff', fontSize: '14px' }}>
                                {msg.content}
                            </div>
                            <div style={{ color: '#8b98a5', fontSize: '11px', marginTop: '4px' }}>
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

    React.useEffect(() => {
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
            background: 'rgba(102, 126, 234, 0.1)',
            borderBottom: '1px solid rgba(102, 126, 234, 0.3)',
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
                    <Pin size={16} color="#667eea" />
                    <span style={{ color: '#667eea', fontWeight: '600', fontSize: '14px' }}>
                        {pinnedMessages.length} Pinned Message{pinnedMessages.length > 1 ? 's' : ''}
                    </span>
                </div>
                <ChevronDown
                    size={18}
                    color="#667eea"
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
                                background: '#1a2332',
                                padding: '12px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ color: '#667eea', fontSize: '12px', marginBottom: '4px' }}>
                                    {pm.message.sender.firstName} {pm.message.sender.lastName}
                                </div>
                                <div style={{ color: '#fff', fontSize: '14px' }}>
                                    {pm.message.content}
                                </div>
                                <div style={{ color: '#8b98a5', fontSize: '11px', marginTop: '4px' }}>
                                    Pinned by {pm.pinnedBy.firstName} on {new Date(pm.pinnedAt).toLocaleDateString()}
                                </div>
                            </div>
                            {pm.pinnedBy.id === userId && (
                                <X
                                    size={16}
                                    color="#8b98a5"
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

    // Load conversation info
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

    // Load shared content based on active section
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

    // Load available users for adding members
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
            // Reload info
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

    const handleRemoveMember = async (memberId, memberName) => {
        if (!window.confirm(`Remove ${memberName} from this group?`)) return;
        setActionLoading(memberId + '_remove');
        try {
            const api = (await import('../../utils/api')).default;
            await api.removeMemberFromGroup(conversation.id, memberId);
            setGroupInfo(prev => ({
                ...prev,
                members: prev.members.filter(m => m.id !== memberId)
            }));
            showToast(`${memberName} removed from group`);
            if (onConversationUpdated) onConversationUpdated();
        } catch (err) {
            showToast(err.message || 'Failed to remove member', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleChangeRole = async (memberId, memberName, currentRole) => {
        const newRole = currentRole === 'admin' ? 'member' : 'admin';
        const action = newRole === 'admin' ? 'promote to Admin' : 'demote to Member';
        if (!window.confirm(`${action} ${memberName}?`)) return;
        setActionLoading(memberId + '_role');
        try {
            const api = (await import('../../utils/api')).default;
            if (newRole === 'admin') await api.promoteToAdmin(conversation.id, memberId);
            else await api.demoteToMember(conversation.id, memberId);
            setGroupInfo(prev => ({
                ...prev,
                members: prev.members.map(m => m.id === memberId ? { ...m, role: newRole } : m)
            }));
            showToast(`${memberName} is now ${newRole === 'admin' ? 'an Admin' : 'a Member'}`);
        } catch (err) {
            showToast(err.message || 'Failed to change role', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm('Are you sure you want to leave this group?')) return;
        try {
            const api = (await import('../../utils/api')).default;
            await api.leaveGroup(conversation.id);
            onClose();
            if (onConversationUpdated) onConversationUpdated();
        } catch (err) {
            showToast(err.message || 'Failed to leave group', 'error');
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days} days ago`;
        return date.toLocaleDateString();
    };

    if (!conversation) return null;

    const members = groupInfo?.members || conversation.members || [];
    const displayName = groupInfo?.name || (isGroup ? conversation.name : `${conversation.otherUser?.firstName} ${conversation.otherUser?.lastName}`);
    const tabs = isGroup ? ['members', 'media', 'files', 'links'] : ['media', 'files', 'links'];

    return (
        <>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .sidebar-toast { animation: slideInRight 0.3s ease-out; }
                .member-card:hover .member-actions { opacity: 1 !important; }
            `}</style>

            {/* Toast Notification */}
            {toast && (
                <div className="sidebar-toast" style={{
                    position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
                    background: toast.type === 'error' ? '#ef4444' : '#10b981',
                    color: '#fff', padding: '12px 20px', borderRadius: '12px',
                    fontSize: '14px', fontWeight: '600',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
                }}>
                    {toast.msg}
                </div>
            )}

            <div style={{
                width: '340px', background: '#151f2e', borderLeft: '1px solid #2a3441',
                display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden'
            }}>
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px', position: 'relative'
                }}>
                    <X size={24} color="#fff" style={{
                        position: 'absolute', top: '16px', right: '16px',
                        cursor: 'pointer', opacity: 0.9
                    }} onClick={onClose} />

                    <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                        <div style={{
                            width: '90px', height: '90px', background: '#fff', borderRadius: '50%',
                            margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '36px', fontWeight: '700', color: '#667eea',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', position: 'relative'
                        }}>
                            {isGroup ? (groupInfo?.name || conversation.name)?.charAt(0) : conversation.otherUser?.firstName?.charAt(0) || '?'}
                            {conversation.isOnline && !isGroup && (
                                <div style={{
                                    position: 'absolute', bottom: '4px', right: '4px',
                                    width: '18px', height: '18px', background: '#4ade80',
                                    border: '3px solid #fff', borderRadius: '50%'
                                }} />
                            )}
                        </div>

                        {/* Editable group name */}
                        {isEditingName ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', marginBottom: '4px' }}>
                                <input
                                    autoFocus
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') handleRenameGroup(); if (e.key === 'Escape') setIsEditingName(false); }}
                                    style={{
                                        background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)',
                                        borderRadius: '8px', padding: '6px 12px', color: '#fff', fontSize: '18px',
                                        fontWeight: '700', textAlign: 'center', outline: 'none', width: '200px'
                                    }}
                                />
                                <button onClick={handleRenameGroup} disabled={savingName} style={{
                                    background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '6px',
                                    padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
                                }}>
                                    {savingName ? '...' : 'Save'}
                                </button>
                                <X size={18} color="#fff" style={{ cursor: 'pointer', opacity: 0.8 }} onClick={() => setIsEditingName(false)} />
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                                    {displayName}
                                </h3>
                                {isGroup && isAdmin && (
                                    <button onClick={() => { setNewGroupName(groupInfo?.name || ''); setIsEditingName(true); }}
                                        style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '6px', padding: '4px 6px', color: '#fff', cursor: 'pointer' }}
                                        title="Rename group">
                                        ✏️
                                    </button>
                                )}
                            </div>
                        )}

                        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                            {isGroup ? `${members.length} members` : (conversation.isOnline ? 'Active now' : 'Offline')}
                            {isGroup && isAdmin && <span style={{
                                marginLeft: '8px', fontSize: '11px', background: 'rgba(255,255,255,0.2)',
                                padding: '2px 8px', borderRadius: '10px', fontWeight: '600'
                            }}>YOU'RE ADMIN</span>}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: 'flex', gap: '8px', padding: '16px',
                    background: '#0e1621', borderBottom: '1px solid #2a3441', justifyContent: 'center'
                }}>
                    {[
                        { icon: conversation.isMuted ? <BellOff size={18} /> : <Bell size={18} />, label: conversation.isMuted ? 'Unmute' : 'Mute', onClick: conversation.onToggleMute },
                        { icon: <Pin size={18} color={conversation.isPinned ? '#667eea' : 'inherit'} />, label: conversation.isPinned ? 'Unpin' : 'Pin', onClick: conversation.onTogglePin },
                        ...(isGroup ? [{ icon: <Star size={18} />, label: 'Leave', onClick: handleLeaveGroup, danger: true }] : []),
                        { icon: <Trash2 size={18} />, label: 'Delete', onClick: () => { if (conversation.onDelete) conversation.onDelete(); }, danger: true },
                    ].map((action, idx) => (
                        <div key={idx} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={action.onClick}>
                            <div style={{
                                width: '48px', height: '48px', background: action.danger ? 'rgba(239,68,68,0.1)' : '#1a2332',
                                borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: action.danger ? '#ef4444' : '#8b98a5', margin: '0 auto 6px',
                                transition: 'all 0.2s', border: `1px solid ${action.danger ? 'rgba(239,68,68,0.3)' : '#2a3441'}`
                            }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = action.danger ? 'rgba(239,68,68,0.2)' : 'rgba(102, 126, 234, 0.1)';
                                    e.currentTarget.style.borderColor = action.danger ? 'rgba(239,68,68,0.5)' : '#667eea';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = action.danger ? 'rgba(239,68,68,0.1)' : '#1a2332';
                                    e.currentTarget.style.borderColor = action.danger ? 'rgba(239,68,68,0.3)' : '#2a3441';
                                }}>
                                {action.icon}
                            </div>
                            <div style={{ fontSize: '11px', color: action.danger ? '#ef4444' : '#8b98a5', fontWeight: '500' }}>{action.label}</div>
                        </div>
                    ))}
                </div>

                {/* Group Stats (only for groups) */}
                {isGroup && groupInfo?.stats && (
                    <div style={{ display: 'flex', background: '#0e1621', borderBottom: '1px solid #2a3441' }}>
                        {[
                            { label: 'Members', value: members.length, icon: '👥' },
                            { label: 'Media', value: groupInfo.stats.mediaCount, icon: '🖼️' },
                            { label: 'Files', value: groupInfo.stats.fileCount, icon: '📎' },
                        ].map((stat, i) => (
                            <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRight: i < 2 ? '1px solid #2a3441' : 'none' }}>
                                <div style={{ fontSize: '18px', marginBottom: '2px' }}>{stat.icon}</div>
                                <div style={{ color: '#fff', fontWeight: '700', fontSize: '18px' }}>{stat.value}</div>
                                <div style={{ color: '#8b98a5', fontSize: '11px' }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#0e1621', borderBottom: '1px solid #2a3441' }}>
                    {tabs.map(tab => (
                        <div key={tab} onClick={() => setActiveSection(tab)} style={{
                            padding: '12px 8px', cursor: 'pointer',
                            color: activeSection === tab ? '#667eea' : '#8b98a5',
                            fontSize: '12px', fontWeight: '600',
                            borderBottom: `3px solid ${activeSection === tab ? '#667eea' : 'transparent'}`,
                            flex: 1, textAlign: 'center', transition: 'all 0.2s',
                            textTransform: 'capitalize',
                            background: activeSection === tab ? 'rgba(102, 126, 234, 0.05)' : 'transparent'
                        }}>
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#0e1621' }}>

                    {/* MEMBERS TAB */}
                    {activeSection === 'members' && (
                        <div style={{ padding: '8px' }}>
                            {/* Add Member Button (Admin only) */}
                            {isAdmin && (
                                <div style={{ marginBottom: '12px' }}>
                                    {!showAddMemberInput ? (
                                        <button
                                            onClick={() => setShowAddMemberInput(true)}
                                            style={{
                                                width: '100%', background: 'rgba(102, 126, 234, 0.1)',
                                                border: '1px dashed #667eea', borderRadius: '10px',
                                                padding: '10px', color: '#667eea', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                gap: '8px', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
                                        >
                                            + Add Member
                                        </button>
                                    ) : (
                                        <div style={{
                                            background: '#1a2332', borderRadius: '12px',
                                            border: '1px solid #667eea', padding: '12px'
                                        }}>
                                            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                                <input
                                                    autoFocus
                                                    placeholder="Search users..."
                                                    value={memberSearch}
                                                    onChange={e => setMemberSearch(e.target.value)}
                                                    style={{
                                                        flex: 1, background: '#0e1621', border: '1px solid #2a3441',
                                                        borderRadius: '8px', padding: '8px 12px', color: '#fff',
                                                        fontSize: '13px', outline: 'none'
                                                    }}
                                                />
                                                <button onClick={() => { setShowAddMemberInput(false); setMemberSearch(''); }}
                                                    style={{ background: 'transparent', border: 'none', color: '#8b98a5', cursor: 'pointer' }}>
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div style={{ maxHeight: '200px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {availableUsers
                                                    .filter(u => {
                                                        const name = `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase();
                                                        return !memberSearch || name.includes(memberSearch.toLowerCase());
                                                    })
                                                    .map(u => (
                                                        <div key={u.id}
                                                            onClick={() => handleAddMember(u.id)}
                                                            style={{
                                                                display: 'flex', alignItems: 'center', gap: '10px',
                                                                padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                                                                background: addingMember === u.id ? 'rgba(102,126,234,0.2)' : 'transparent',
                                                                transition: 'background 0.2s'
                                                            }}
                                                            onMouseEnter={e => { if (addingMember !== u.id) e.currentTarget.style.background = '#2a3441'; }}
                                                            onMouseLeave={e => { if (addingMember !== u.id) e.currentTarget.style.background = 'transparent'; }}
                                                        >
                                                            <div style={{
                                                                width: '32px', height: '32px', background: '#667eea',
                                                                borderRadius: '50%', display: 'flex', alignItems: 'center',
                                                                justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: '700', flexShrink: 0
                                                            }}>
                                                                {u.firstName?.charAt(0)}
                                                            </div>
                                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{u.firstName} {u.lastName}</div>
                                                                <div style={{ color: '#8b98a5', fontSize: '11px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                                                            </div>
                                                            {addingMember === u.id
                                                                ? <div style={{ width: '18px', height: '18px', border: '2px solid #667eea', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                                                                : <span style={{ color: '#667eea', fontSize: '18px', fontWeight: '300' }}>+</span>}
                                                        </div>
                                                    ))}
                                                {availableUsers.length === 0 && (
                                                    <div style={{ color: '#8b98a5', fontSize: '13px', textAlign: 'center', padding: '16px' }}>
                                                        No users available to add
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Member list */}
                            {members.map(member => (
                                <div key={member.id} className="member-card" style={{
                                    padding: '12px', background: '#1a2332', borderRadius: '10px', marginBottom: '6px',
                                    display: 'flex', alignItems: 'center', gap: '12px',
                                    border: '1px solid #2a3441', transition: 'all 0.2s', position: 'relative'
                                }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#222b3c'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#1a2332'}
                                >
                                    <div style={{
                                        width: '44px', height: '44px', background: member.id === currentUserId ? '#764ba2' : '#667eea',
                                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '16px', fontWeight: '700', color: '#fff', position: 'relative', flexShrink: 0
                                    }}>
                                        {member.firstName?.charAt(0)}
                                        {onlineUserIds?.has(member.id) && (
                                            <div style={{
                                                position: 'absolute', bottom: 0, right: 0,
                                                width: '12px', height: '12px', background: '#4ade80',
                                                border: '2px solid #1a2332', borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                            {member.firstName} {member.lastName}
                                            {member.id === currentUserId && <span style={{ fontSize: '10px', color: '#8b98a5' }}>(You)</span>}
                                            {member.role === 'admin' && (
                                                <span style={{
                                                    fontSize: '10px', background: 'rgba(102, 126, 234, 0.2)',
                                                    color: '#667eea', padding: '1px 6px', borderRadius: '4px', fontWeight: '700'
                                                }}>ADMIN</span>
                                            )}
                                        </div>
                                        <div style={{ color: '#8b98a5', fontSize: '12px', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {onlineUserIds?.has(member.id) ? '🟢 Active now' : '⚫ Offline'} • {member.email}
                                        </div>
                                    </div>

                                    {/* Admin actions for other members */}
                                    {isAdmin && member.id !== currentUserId && (
                                        <div className="member-actions" style={{
                                            display: 'flex', gap: '4px', opacity: 0, transition: 'opacity 0.2s'
                                        }}>
                                            <button
                                                onClick={() => handleChangeRole(member.id, `${member.firstName}`, member.role)}
                                                disabled={actionLoading === member.id + '_role'}
                                                title={member.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}
                                                style={{
                                                    background: member.role === 'admin' ? 'rgba(245,158,11,0.1)' : 'rgba(102,126,234,0.1)',
                                                    border: `1px solid ${member.role === 'admin' ? 'rgba(245,158,11,0.3)' : 'rgba(102,126,234,0.3)'}`,
                                                    borderRadius: '6px', padding: '5px 7px', cursor: 'pointer',
                                                    color: member.role === 'admin' ? '#f59e0b' : '#667eea',
                                                    fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap'
                                                }}>
                                                {actionLoading === member.id + '_role' ? '...' : member.role === 'admin' ? '↓ Member' : '↑ Admin'}
                                            </button>
                                            <button
                                                onClick={() => handleRemoveMember(member.id, `${member.firstName} ${member.lastName}`)}
                                                disabled={actionLoading === member.id + '_remove'}
                                                title="Remove from group"
                                                style={{
                                                    background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                                                    borderRadius: '6px', padding: '5px 7px', cursor: 'pointer',
                                                    color: '#ef4444', fontSize: '11px', fontWeight: '600'
                                                }}>
                                                {actionLoading === member.id + '_remove' ? '...' : '✕'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {infoLoading && (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#8b98a5' }}>Loading members...</div>
                            )}
                        </div>
                    )}

                    {/* MEDIA TAB */}
                    {activeSection === 'media' && (
                        <div style={{ padding: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                {mediaItems.map(item => (
                                    <div key={item.id} style={{
                                        position: 'relative', paddingBottom: '100%', background: '#1a2332',
                                        borderRadius: '8px', overflow: 'hidden', cursor: 'pointer', border: '1px solid #2a3441'
                                    }}>
                                        <div style={{
                                            position: 'absolute', inset: 0,
                                            backgroundImage: `url(${item.url})`, backgroundSize: 'cover',
                                            backgroundPosition: 'center', transition: 'transform 0.2s'
                                        }}
                                            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                        {item.type === 'video' && (
                                            <div style={{
                                                position: 'absolute', top: '8px', right: '8px',
                                                background: 'rgba(0,0,0,0.6)', borderRadius: '4px',
                                                padding: '4px 6px', fontSize: '10px', color: '#fff'
                                            }}>VIDEO</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {loading && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>Loading media...</div>}
                            {!loading && mediaItems.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>No media shared yet</p>
                            </div>}
                        </div>
                    )}

                    {/* FILES TAB */}
                    {activeSection === 'files' && (
                        <div style={{ padding: '8px' }}>
                            {fileItems.map(file => (
                                <div key={file.id} style={{
                                    padding: '12px', background: '#1a2332', borderRadius: '10px', marginBottom: '8px',
                                    display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer',
                                    border: '1px solid #2a3441', transition: 'all 0.2s'
                                }}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#2a3441'; e.currentTarget.style.borderColor = '#667eea'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1a2332'; e.currentTarget.style.borderColor = '#2a3441'; }}
                                >
                                    <div style={{
                                        width: '40px', height: '40px', background: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <FileText size={20} color="#667eea" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name || file.content}</div>
                                        <div style={{ color: '#8b98a5', fontSize: '12px', marginTop: '2px' }}>{formatDate(file.createdAt)}</div>
                                    </div>
                                </div>
                            ))}
                            {loading && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>Loading files...</div>}
                            {!loading && fileItems.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>No files shared yet</p>
                            </div>}
                        </div>
                    )}

                    {/* LINKS TAB */}
                    {activeSection === 'links' && (
                        <div style={{ padding: '8px' }}>
                            {linkItems.map(link => (
                                <div key={link.id} style={{
                                    padding: '12px', background: '#1a2332', borderRadius: '10px', marginBottom: '8px',
                                    cursor: 'pointer', border: '1px solid #2a3441', transition: 'all 0.2s'
                                }}
                                    onClick={() => window.open(link.content, '_blank')}
                                    onMouseEnter={e => { e.currentTarget.style.background = '#2a3441'; e.currentTarget.style.borderColor = '#667eea'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = '#1a2332'; e.currentTarget.style.borderColor = '#2a3441'; }}
                                >
                                    <div style={{ color: '#667eea', fontSize: '14px', fontWeight: '500', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        🔗 {link.content}
                                    </div>
                                    <div style={{ color: '#8b98a5', fontSize: '11px' }}>{formatDate(link.createdAt)}</div>
                                </div>
                            ))}
                            {loading && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>Loading links...</div>}
                            {!loading && linkItems.length === 0 && <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                <MapPin size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} /><p>No links shared yet</p>
                            </div>}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ padding: '16px', background: '#0e1621', borderTop: '1px solid #2a3441' }}>
                    {isGroup && (
                        <div style={{ marginBottom: '10px', fontSize: '12px', color: '#8b98a5', textAlign: 'center' }}>
                            Created {groupInfo?.createdAt ? formatDate(groupInfo.createdAt) : ''}
                        </div>
                    )}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                        background: 'rgba(102, 126, 234, 0.1)', borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                        <Clock size={16} color="#667eea" />
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>End-to-End Encrypted</div>
                            <div style={{ color: '#8b98a5', fontSize: '11px' }}>Messages secured with AES-256-GCM</div>
                        </div>
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
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                width: '400px',
                background: '#1a2332',
                borderRadius: '16px',
                border: '1px solid #2a3441',
                padding: '24px',
                boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, color: '#fff' }}>Create a Poll</h3>
                    <X size={20} color="#8b98a5" style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label style={{ color: '#8b98a5', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Question</label>
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What's on your mind?"
                        style={{
                            width: '100%',
                            background: '#0e1621',
                            border: '1px solid #2a3441',
                            borderRadius: '8px',
                            padding: '12px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ color: '#8b98a5', fontSize: '13px', display: 'block', marginBottom: '8px' }}>Options</label>
                    {options.map((opt, i) => (
                        <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                            <input
                                type="text"
                                value={opt}
                                onChange={(e) => updateOption(i, e.target.value)}
                                placeholder={`Option ${i + 1}`}
                                style={{
                                    flex: 1,
                                    background: '#0e1621',
                                    border: '1px solid #2a3441',
                                    borderRadius: '8px',
                                    padding: '12px',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                            />
                            {options.length > 2 && (
                                <button onClick={() => removeOption(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={18} /></button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addOption}
                        style={{
                            background: 'transparent',
                            border: '1px dashed #2a3441',
                            color: '#667eea',
                            width: '100%',
                            padding: '10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            marginTop: '4px'
                        }}
                    >
                        + Add Option
                    </button>
                </div>

                <button
                    onClick={() => {
                        if (!question.trim() || options.some(o => !o.trim())) {
                            alert('Please fill in all fields');
                            return;
                        }
                        onCreate({ question, options: options.filter(o => o.trim()) });
                        onClose();
                    }}
                    style={{
                        width: '100%',
                        background: '#667eea',
                        color: '#fff',
                        border: 'none',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: '600',
                        cursor: 'pointer'
                    }}
                >
                    Create Poll
                </button>
            </div>
        </div>
    );
}
