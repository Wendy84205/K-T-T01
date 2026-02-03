import React, { useState } from 'react';
import { Search, X, Pin, ChevronDown } from 'lucide-react';

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
