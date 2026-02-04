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
export function ConversationSidebar({ conversation, onClose, currentUserId, onlineUserIds }) {
    const [activeSection, setActiveSection] = useState('media');
    const [mediaItems, setMediaItems] = useState([]);
    const [fileItems, setFileItems] = useState([]);
    const [linkItems, setLinkItems] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data based on active section
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
    }, [activeSection, conversation?.id, mediaItems.length, fileItems.length, linkItems.length]);

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

    return (
        <>
            <style>
                {`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                `}
            </style>
            <div style={{
                width: '340px',
                background: '#151f2e',
                borderLeft: '1px solid #2a3441',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden'
            }}>
                {/* Enhanced Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    padding: '20px',
                    position: 'relative'
                }}>
                    <X
                        size={24}
                        color="#fff"
                        style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            cursor: 'pointer',
                            opacity: 0.9
                        }}
                        onClick={onClose}
                    />

                    <div style={{ textAlign: 'center', paddingTop: '20px' }}>
                        <div style={{
                            width: '90px',
                            height: '90px',
                            background: '#fff',
                            borderRadius: '50%',
                            margin: '0 auto 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '36px',
                            fontWeight: '700',
                            color: '#667eea',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                            position: 'relative'
                        }}>
                            {conversation.conversationType === 'group'
                                ? conversation.name?.charAt(0)
                                : conversation.otherUser?.firstName?.charAt(0) || '?'}
                            {conversation.isOnline && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: '4px',
                                    right: '4px',
                                    width: '18px',
                                    height: '18px',
                                    background: '#4ade80',
                                    border: '3px solid #fff',
                                    borderRadius: '50%'
                                }} />
                            )}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: '700' }}>
                                {conversation.conversationType === 'group'
                                    ? conversation.name
                                    : `${conversation.otherUser?.firstName} ${conversation.otherUser?.lastName}`}
                            </h3>
                            {conversation.isVerified && <Bell size={16} color="#fff" fill="#fff" />}
                        </div>
                        <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.8)', fontSize: '13px' }}>
                            {conversation.conversationType === 'group'
                                ? `${conversation.members?.length || 0} members`
                                : (conversation.isOnline ? 'Active now' : 'Offline')}
                        </p>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '8px',
                    padding: '16px',
                    background: '#0e1621',
                    borderBottom: '1px solid #2a3441'
                }}>
                    {[
                        { icon: conversation.isMuted ? <BellOff size={18} /> : <Bell size={18} />, label: 'Mute', onClick: conversation.onToggleMute },
                        { icon: <Pin size={18} color={conversation.isPinned ? '#667eea' : 'inherit'} />, label: 'Pin', onClick: conversation.onTogglePin },
                        { icon: <Search size={18} />, label: 'Search', onClick: () => alert('Search coming soon!') },
                        { icon: <Trash2 size={18} />, label: 'Block', onClick: () => alert('Block user coming soon!') }
                    ].map((action, idx) => (
                        <div key={idx} style={{ textAlign: 'center', cursor: 'pointer' }} onClick={action.onClick}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#1a2332',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#8b98a5',
                                margin: '0 auto 6px',
                                transition: 'all 0.2s',
                                border: '1px solid #2a3441'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                                    e.currentTarget.style.borderColor = '#667eea';
                                    e.currentTarget.style.color = '#667eea';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#1a2332';
                                    e.currentTarget.style.borderColor = '#2a3441';
                                    e.currentTarget.style.color = '#8b98a5';
                                }}>
                                {action.icon}
                            </div>
                            <div style={{ fontSize: '11px', color: '#8b98a5', fontWeight: '500' }}>{action.label}</div>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    padding: '0',
                    background: '#0e1621',
                    borderBottom: '1px solid #2a3441'
                }}>
                    {['media', 'files', 'links', 'members'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveSection(tab)}
                            style={{
                                padding: '14px 12px',
                                cursor: 'pointer',
                                color: activeSection === tab ? '#667eea' : '#8b98a5',
                                fontSize: '13px',
                                fontWeight: '600',
                                borderBottom: `3px solid ${activeSection === tab ? '#667eea' : 'transparent'}`,
                                flex: 1,
                                textAlign: 'center',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize',
                                background: activeSection === tab ? 'rgba(102, 126, 234, 0.05)' : 'transparent'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Content Area */}
                <div style={{ flex: 1, overflowY: 'auto', background: '#0e1621' }}>
                    {activeSection === 'media' && (
                        <div style={{ padding: '12px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                                {mediaItems.map(item => (
                                    <div key={item.id} style={{
                                        position: 'relative',
                                        paddingBottom: '100%',
                                        background: '#1a2332',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        border: '1px solid #2a3441'
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundImage: `url(${item.url})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            transition: 'transform 0.2s'
                                        }}
                                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                        />
                                        {item.type === 'video' && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.6)',
                                                borderRadius: '4px',
                                                padding: '4px 6px',
                                                fontSize: '10px',
                                                color: '#fff'
                                            }}>
                                                VIDEO
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            {loading && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '3px solid #2a3441',
                                        borderTop: '3px solid #667eea',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 12px'
                                    }} />
                                    <p>Loading media...</p>
                                </div>
                            )}
                            {!loading && mediaItems.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                    <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                    <p>No media shared yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'files' && (
                        <div style={{ padding: '8px' }}>
                            {fileItems.map(file => (
                                <div key={file.id} style={{
                                    padding: '12px',
                                    background: '#1a2332',
                                    borderRadius: '10px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    cursor: 'pointer',
                                    border: '1px solid #2a3441',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#2a3441'; e.currentTarget.style.borderColor = '#667eea'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#1a2332'; e.currentTarget.style.borderColor = '#2a3441'; }}
                                >
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <FileText size={20} color="#667eea" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {file.name}
                                        </div>
                                        <div style={{ color: '#8b98a5', fontSize: '12px', marginTop: '2px' }}>
                                            {file.size} • {formatDate(file.date)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '3px solid #2a3441',
                                        borderTop: '3px solid #667eea',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 12px'
                                    }} />
                                    <p>Loading files...</p>
                                </div>
                            )}
                            {!loading && fileItems.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                    <FileText size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                    <p>No files shared yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'links' && (
                        <div style={{ padding: '8px' }}>
                            {linkItems.map(link => (
                                <div key={link.id} style={{
                                    padding: '12px',
                                    background: '#1a2332',
                                    borderRadius: '10px',
                                    marginBottom: '8px',
                                    cursor: 'pointer',
                                    border: '1px solid #2a3441',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => { e.currentTarget.style.background = '#2a3441'; e.currentTarget.style.borderColor = '#667eea'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.background = '#1a2332'; e.currentTarget.style.borderColor = '#2a3441'; }}
                                >
                                    <div style={{ color: '#667eea', fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                                        {link.title}
                                    </div>
                                    <div style={{ color: '#8b98a5', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {link.url}
                                    </div>
                                    <div style={{ color: '#8b98a5', fontSize: '11px', marginTop: '6px' }}>
                                        {formatDate(link.date)}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        border: '3px solid #2a3441',
                                        borderTop: '3px solid #667eea',
                                        borderRadius: '50%',
                                        animation: 'spin 1s linear infinite',
                                        margin: '0 auto 12px'
                                    }} />
                                    <p>Loading links...</p>
                                </div>
                            )}
                            {!loading && linkItems.length === 0 && (
                                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                    <MapPin size={48} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                                    <p>No links shared yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeSection === 'members' && (
                        <div style={{ padding: '8px' }}>
                            {conversation.members?.map(member => (
                                <div key={member.id} style={{
                                    padding: '12px',
                                    background: '#1a2332',
                                    borderRadius: '10px',
                                    marginBottom: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    border: '1px solid #2a3441',
                                    transition: 'all 0.2s'
                                }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a3441'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a2332'}
                                >
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        background: '#667eea',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '16px',
                                        fontWeight: '700',
                                        color: '#fff',
                                        position: 'relative'
                                    }}>
                                        {member.firstName?.charAt(0)}
                                        {onlineUserIds?.has(member.id) && (
                                            <div style={{
                                                position: 'absolute',
                                                bottom: 0,
                                                right: 0,
                                                width: '12px',
                                                height: '12px',
                                                background: '#4ade80',
                                                border: '2px solid #1a2332',
                                                borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: '#fff', fontSize: '14px', fontWeight: '500' }}>
                                            {member.firstName} {member.lastName}
                                            {member.role === 'admin' && (
                                                <span style={{
                                                    marginLeft: '6px',
                                                    fontSize: '10px',
                                                    background: 'rgba(102, 126, 234, 0.2)',
                                                    color: '#667eea',
                                                    padding: '2px 6px',
                                                    borderRadius: '4px'
                                                }}>
                                                    ADMIN
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ color: '#8b98a5', fontSize: '12px', marginTop: '2px' }}>
                                            {onlineUserIds?.has(member.id) ? 'Active now' : 'Offline'}
                                        </div>
                                    </div>
                                </div>
                            )) || (
                                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#8b98a5' }}>
                                        <p>No members to display</p>
                                    </div>
                                )}
                        </div>
                    )}
                </div>

                {/* Privacy & Settings Footer */}
                <div style={{
                    padding: '16px',
                    background: '#0e1621',
                    borderTop: '1px solid #2a3441'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 12px',
                        background: 'rgba(102, 126, 234, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                    }}>
                        <Clock size={16} color="#667eea" />
                        <div style={{ flex: 1 }}>
                            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>End-to-End Encrypted</div>
                            <div style={{ color: '#8b98a5', fontSize: '11px' }}>Messages are secured with AES-256</div>
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
