import React, { useState, useEffect } from 'react';
import { Search, X, Pin, ChevronDown, ChevronRight, FileText, Bell, BellOff, Star, Trash2, Clock, MapPin, Users, Image, Hash, LogOut, Edit2, EyeOff, AlertTriangle, UserPlus, Settings, StickyNote, Smile, Heart } from 'lucide-react';

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

export function ConversationSidebar({ conversation, onOpenGroupModal, onClose, currentUserId, onlineUserIds, onConversationUpdated }) {
    const [activeSection, setActiveSection] = useState(null);
    const [groupInfo, setGroupInfo] = useState(null);
    const [infoLoading, setInfoLoading] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');

    // Shared contents states
    const [loadingShared, setLoadingShared] = useState(false);
    const [mediaItems, setMediaItems] = useState([]);
    const [fileItems, setFileItems] = useState([]);
    const [linkItems, setLinkItems] = useState([]);

    // Privacy mock states
    const [isChatHidden, setIsChatHidden] = useState(false);
    const [selfDestructTime, setSelfDestructTime] = useState('Never');
    const [toast, setToast] = useState(null);

    const isGroup = conversation?.conversationType === 'group';
    const isAdmin = groupInfo?.currentUserRole === 'admin';
    const displayName = groupInfo?.name || (isGroup ? conversation.name : `${conversation.otherUser?.firstName || ''} ${conversation.otherUser?.lastName || ''}`.trim());

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
        const fetchSharedContent = async () => {
            if (!conversation?.id || !activeSection) return;
            // Only fetch if data is empty for the open section
            try {
                const api = (await import('../../utils/api')).default;
                if (activeSection === 'media' && mediaItems.length === 0) {
                    setLoadingShared(true);
                    const data = await api.getSharedMedia(conversation.id);
                    setMediaItems(data || []);
                } else if (activeSection === 'files' && fileItems.length === 0) {
                    setLoadingShared(true);
                    const data = await api.getSharedFiles(conversation.id);
                    setFileItems(data || []);
                } else if (activeSection === 'links' && linkItems.length === 0) {
                    setLoadingShared(true);
                    const data = await api.getSharedLinks(conversation.id);
                    setLinkItems(data || []);
                }
            } catch (err) {
                console.error(`Failed to fetch ${activeSection}:`, err);
            } finally {
                setLoadingShared(false);
            }
        };
        fetchSharedContent();
    }, [activeSection, conversation?.id]);

    const handleRenameGroup = async () => {
        if (!newGroupName.trim() || !isGroup) return;
        try {
            const api = (await import('../../utils/api')).default;
            await api.renameGroup(conversation.id, newGroupName.trim());
            setGroupInfo(prev => ({ ...prev, name: newGroupName.trim() }));
            setIsEditingName(false);
            showToast('Renamed group successfully');
            if (onConversationUpdated) onConversationUpdated();
        } catch (err) {
            showToast('Failed to rename group', 'error');
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm("Are you sure you want to leave this group?")) return;
        try {
            const api = (await import('../../utils/api')).default;
            await api.leaveGroup(conversation.id);
            if (onConversationUpdated) onConversationUpdated();
            if (conversation.onDelete) conversation.onDelete(); // Just close/remove from list
        } catch (error) {
            showToast('Failed to leave group', 'error');
        }
    };

    if (!conversation) return null;

    const sections = [
        { id: 'media', label: 'Media' },
        { id: 'files', label: 'Files' },
        { id: 'links', label: 'Links' },
    ];

    const Divider = () => <div style={{ height: '8px', background: 'var(--bg-app)', width: '100%' }} />;

    const ActionItem = ({ icon, label, subLabel, hasToggle, onClick, isRed, rightIcon }) => (
        <div
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 16px',
                cursor: 'pointer',
                transition: 'background 0.2s',
                color: isRed ? 'var(--red-color)' : 'var(--text-main)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div style={{ marginRight: '12px', display: 'flex', alignItems: 'center' }}>
                {icon}
            </div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{label}</div>
                {subLabel && <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{subLabel}</div>}
            </div>
            {rightIcon && <div style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>{rightIcon}</div>}
            {hasToggle !== undefined && (
                <div
                    style={{
                        width: '36px',
                        height: '20px',
                        background: hasToggle ? 'var(--primary)' : 'var(--border-color)',
                        borderRadius: '10px',
                        position: 'relative',
                        transition: 'background 0.2s'
                    }}
                >
                    <div style={{
                        width: '16px',
                        height: '16px',
                        background: '#fff',
                        borderRadius: '50%',
                        position: 'absolute',
                        top: '2px',
                        left: hasToggle ? '18px' : '2px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        transition: 'left 0.2s'
                    }} />
                </div>
            )}
        </div>
    );

    return (
        <div style={{
            width: '340px', background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)',
            display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
            color: 'var(--text-main)'
        }}>
            <style>{`
                @keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
                .sidebar-toast { animation: slideInRight 0.3s ease-out; z-index: 1000; }
            `}</style>

            {toast && (
                <div className="sidebar-toast" style={{
                    position: 'fixed', bottom: '30px', right: '350px',
                    background: toast.type === 'error' ? 'var(--red-color)' : 'var(--green-color)',
                    color: '#fff', padding: '12px 20px', borderRadius: '8px',
                    fontSize: '14px', fontWeight: '600',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div style={{
                padding: '16px', borderBottom: '1px solid var(--border-color)',
                textAlign: 'center', position: 'relative', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: 'var(--text-main)' }}>
                    {isGroup ? 'Group Information' : 'Chat Information'}
                </h3>
                <button onClick={onClose} style={{
                    position: 'absolute', right: '12px', top: '16px', background: 'transparent',
                    border: 'none', color: 'var(--text-secondary)', cursor: 'pointer'
                }}>
                    <X size={20} />
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Profile Section */}
                <div style={{ padding: '20px 16px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px', height: '64px',
                        background: 'linear-gradient(135deg, var(--primary) 0%, var(--shadow-primary) 100%)',
                        borderRadius: '50%',
                        margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '24px', fontWeight: '600', color: '#fff',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {isGroup ? (groupInfo?.name || conversation.name)?.charAt(0) : conversation.otherUser?.firstName?.charAt(0) || '?'}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'nowrap', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px', padding: '0 20px' }}>
                        {isEditingName ? (
                            <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
                                <input
                                    type="text"
                                    value={newGroupName}
                                    onChange={(e) => setNewGroupName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleRenameGroup()}
                                    style={{
                                        border: '1px solid var(--border-color)', background: 'var(--bg-app)', color: 'var(--text-main)',
                                        borderRadius: '8px', padding: '6px 10px', outline: 'none', flex: 1, fontSize: '14px'
                                    }}
                                />
                                <button onClick={handleRenameGroup} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Save</button>
                                <button onClick={() => setIsEditingName(false)} style={{ background: 'var(--bg-light)', color: 'var(--text-main)', border: 'none', borderRadius: '8px', padding: '0 12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>Cancel</button>
                            </div>
                        ) : (
                            <>
                                <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px', fontWeight: '600', maxWidth: '80%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {displayName}
                                </h3>
                                {(isGroup && isAdmin) && (
                                    <div
                                        onClick={() => {
                                            setNewGroupName(displayName);
                                            setIsEditingName(true);
                                        }}
                                        style={{
                                            width: '24px', height: '24px', background: 'var(--bg-light)', borderRadius: '50%',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0
                                        }}>
                                        <Edit2 size={12} color="var(--text-main)" />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Circle Actions */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', width: '70px' }} onClick={conversation.onToggleMute}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                {conversation.isMuted ? <BellOff size={20} color="var(--text-main)" /> : <Bell size={20} color="var(--text-main)" />}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Mute</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', width: '70px' }} onClick={conversation.onTogglePin}>
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                <Pin size={20} color="var(--text-main)" />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>Pin chat</span>
                        </div>
                        <div
                            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', width: '70px' }}
                            onClick={isGroup ? () => showToast('Function coming soon', 'info') : () => onOpenGroupModal?.()}
                        >
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '50%',
                                background: 'rgba(255,255,255,0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                            }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}>
                                <UserPlus size={20} color="var(--text-main)" />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>{isGroup ? 'Add member' : 'Create group chat'}</span>
                        </div>
                    </div>
                </div>

                <Divider />

                {/* Group Specific sections: Group Members, Group Bulletin */}
                {isGroup && (
                    <>
                        <div style={{ padding: '4px 0' }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}
                                onClick={() => setActiveSection(activeSection === 'members' ? null : 'members')}
                            >
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>Group members</span>
                                <ChevronDown size={18} color="var(--text-muted)" style={{ transform: activeSection === 'members' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </div>
                            {activeSection === 'members' && (
                                <div style={{ padding: '0 16px 12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-main)', padding: '8px 0' }}>
                                        <Users size={18} color="var(--text-muted)" />
                                        <span style={{ fontSize: '14px' }}>{conversation.memberCount || groupInfo?.members?.length || 0} members</span>
                                    </div>
                                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {groupInfo?.members?.map(m => (
                                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: '600' }}>
                                                    {m.firstName?.charAt(0) || '?'}
                                                </div>
                                                <div style={{ flex: 1, fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {m.firstName} {m.lastName}
                                                </div>
                                                {m.role === 'admin' && <span style={{ fontSize: '10px', background: 'var(--primary-light)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>Admin</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <Divider />
                        <div style={{ padding: '4px 0' }}>
                            <div
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', cursor: 'pointer' }}
                                onClick={() => setActiveSection(activeSection === 'bulletin' ? null : 'bulletin')}
                            >
                                <span style={{ fontSize: '15px', fontWeight: '600' }}>Group bulletin</span>
                                <ChevronDown size={18} color="var(--text-muted)" style={{ transform: activeSection === 'bulletin' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </div>
                            {activeSection === 'bulletin' && (
                                <div>
                                    <ActionItem icon={<Clock size={20} />} label="Appointment list" />
                                    <ActionItem icon={<StickyNote size={20} />} label="Notes, pins, polls" />
                                </div>
                            )}
                        </div>
                        <Divider />
                    </>
                )}

                {/* Sub Menu 1 (Direct Chat) */}
                {!isGroup && (
                    <>
                        <div style={{ padding: '0', borderTop: '1px solid var(--border-color)' }}>
                            <ActionItem icon={<Clock size={20} />} label="Appointment List" />
                            <ActionItem icon={<Users size={20} />} label="Common Groups" />
                        </div>
                        <Divider />
                    </>
                )}

                {/* Media, Files, Links */}
                <div>
                    {sections.map(section => (
                        <div key={section.id}>
                            <ActionItem
                                onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                                icon={null}
                                label={section.label}
                                rightIcon={<ChevronRight size={18} style={{ transform: activeSection === section.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />}
                            />
                            {activeSection === section.id && (
                                <div style={{ padding: '0 16px 16px 16px', background: 'var(--bg-light)' }}>
                                    {loadingShared ? (
                                        <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-muted)', fontSize: '13px' }}>Loading...</div>
                                    ) : (
                                        <>
                                            {section.id === 'media' && (mediaItems.length ? <MediaGallery items={mediaItems} /> : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No media shared yet.</div>)}
                                            {section.id === 'files' && (fileItems.length ? <FilesList items={fileItems} /> : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No files shared yet.</div>)}
                                            {section.id === 'links' && (linkItems.length ? <FilesList items={linkItems} /> : <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No links shared yet.</div>)}
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <Divider />

                {/* Privacy Settings */}
                <div>
                    <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '12px 16px', cursor: 'pointer'
                    }} onClick={() => setActiveSection(activeSection === 'privacy' ? null : 'privacy')}>
                        <span style={{ fontSize: '14px', fontWeight: '500' }}>Privacy Settings</span>
                        <ChevronDown size={18} color="var(--text-muted)" style={{ transform: activeSection === 'privacy' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>

                    {activeSection === 'privacy' && (
                        <div style={{ background: 'var(--bg-panel-dark)' }}>
                            <div style={{ padding: '0 0 12px 0' }}>
                                <ActionItem
                                    icon={<Clock size={20} />}
                                    label="Self-destruct Messages"
                                    subLabel={selfDestructTime}
                                    onClick={() => {
                                        const options = ['Never', '30 Seconds', '1 Minute', '1 Hour', '1 Day', '1 Week'];
                                        const idx = options.indexOf(selfDestructTime);
                                        const next = options[(idx + 1) % options.length];
                                        setSelfDestructTime(next);
                                        showToast(`Self-destruct: ${next}`);
                                    }}
                                />
                                <ActionItem
                                    icon={<EyeOff size={20} />}
                                    label="Hide Chat"
                                    hasToggle={isChatHidden}
                                    onClick={() => {
                                        setIsChatHidden(!isChatHidden);
                                        showToast(isChatHidden ? 'Chat unhidden' : 'Chat hidden');
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                <Divider />

                {/* Danger Zone */}
                <div style={{ padding: '4px 0' }}>
                    <ActionItem icon={<AlertTriangle size={20} />} label="Report" onClick={() => showToast('Conversation reported', 'error')} />
                    <ActionItem
                        icon={<Trash2 size={20} />}
                        label="Delete Chat History"
                        isRed={true}
                        onClick={() => {
                            if (window.confirm("Are you sure you want to delete chat history?")) {
                                if (conversation.onDelete) conversation.onDelete();
                            }
                        }}
                    />
                    {isGroup && (
                        <ActionItem
                            icon={<LogOut size={20} />}
                            label="Leave Group"
                            isRed={true}
                            onClick={handleLeaveGroup}
                        />
                    )}
                </div>
                <div style={{ height: '20px' }} />
            </div>
        </div >
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
    const [currentCategory, setCurrentCategory] = useState('emotions');

    const emojiCategories = {
        emotions: ['🙂', '🤔', '😍', '😂', '😎', '😭', '😊', '😋', '🤫', '🥱', '🙄', '🤤', '😔', '😫', '😡', '🤬', '🥵', '🥶', '🤯', '🤢', '🤮', '🤧', '😵', '🧐', '🤓', '😇', '🤠', '🤡', '👺', '👹', '👻', '💀', '👽', '🤖', '💩', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾'],
        animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🕸', '🦂'],
        food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🥯', '🥞', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🥗', '🥘'],
        activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🎱', '🏓', '🏸', '🥅', '🏒', '🏑', '🏏', '⛳', '🏹', '🎣', '🥊', '🥋', '🎽', '⛸', '🥌', '🛷', '🛹', '⛷', '🏂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇'],
        travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🏍', '🚲', '🛴', '🛵', '🚏', '🛣', '🛤', '⛽', '🚨', '🚥', '🚦', '🛑', '🚧', '⚓', '⛵', '🛶', '🚤', '🛳', '⛴', '🛥', '✈️', '🛩', '🛫', '🛬', '💺', '🚁', '🚟', '🚠', '🚡', '🚀', '🛸', '🛰'],
        objects: ['⌚', '📱', '📲', '💻', '⌨️', '🖱', '🖨', '🖱️', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🧯'],
        symbols: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '🆔', '⚛️', '🉑']
    };

    const categories = [
        { id: 'emotions', icon: Smile, label: 'Cảm xúc' },
        { id: 'animals', icon: Users, label: 'Động vật' },
        { id: 'food', icon: StickyNote, label: 'Ăn uống' },
        { id: 'activities', icon: Star, label: 'Hoạt động' },
        { id: 'travel', icon: MapPin, label: 'Du lịch' },
        { id: 'objects', icon: Settings, label: 'Vật dụng' },
        { id: 'symbols', icon: Heart, label: 'Biểu tượng' }
    ];

    return (
        <div style={{
            position: 'absolute', bottom: '100%', right: '0', marginBottom: '10px',
            background: 'var(--bg-panel)', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
            border: '1px solid var(--border-color)', width: '320px', zIndex: 1000, overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--text-main)' }}>
                    {categories.find(c => c.id === currentCategory)?.label || 'Cảm xúc'}
                </span>
                <X size={18} color="var(--text-muted)" style={{ cursor: 'pointer' }} onClick={onClose} />
            </div>

            <div style={{ padding: '8px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px', maxHeight: '280px', overflowY: 'auto' }}>
                {emojiCategories[currentCategory].map(s => (
                    <div
                        key={s}
                        onClick={() => { onSelect(s); }}
                        style={{
                            fontSize: '24px', textAlign: 'center', cursor: 'pointer', padding: '8px',
                            borderRadius: '10px', transition: 'all 0.1s'
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-light)'; e.currentTarget.style.transform = 'scale(1.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.transform = 'scale(1)'; }}
                    >
                        {s}
                    </div>
                ))}
            </div>

            <div style={{
                display: 'flex',
                background: 'var(--bg-light)',
                padding: '4px',
                borderTop: '1px solid var(--border-color)',
                overflowX: 'auto',
                scrollbarWidth: 'none'
            }}>
                {categories.map(cat => (
                    <div
                        key={cat.id}
                        onClick={() => setCurrentCategory(cat.id)}
                        style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '8px',
                            background: currentCategory === cat.id ? 'var(--bg-panel)' : 'transparent',
                            color: currentCategory === cat.id ? 'var(--primary)' : 'var(--text-muted)',
                            transition: 'all 0.2s',
                            flexShrink: 0
                        }}
                    >
                        <cat.icon size={20} />
                    </div>
                ))}
            </div>
        </div>
    );
}

function MediaGallery({ items }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', marginTop: '12px' }}>
            {items?.slice(0, 9).map((item, idx) => (
                <div key={idx} style={{ aspectRatio: '1/1', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    {item.fileUrl && (
                        <img src={item.fileUrl} alt="media" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                </div>
            ))}
        </div>
    );
}

function FilesList({ items }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
            {items?.slice(0, 5).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'var(--bg-app)', padding: '10px', borderRadius: '8px' }}>
                    <FileText size={24} color="var(--primary)" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', color: 'var(--text-main)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', fontWeight: '500' }}>
                            {item.filename || 'Shared Document'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {(item.size / 1024).toFixed(1)} KB
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
