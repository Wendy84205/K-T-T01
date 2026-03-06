import React, { useState, useEffect } from 'react';
import { Lock, Pin, MoreVertical, FileText, Download, Trash2, Reply, Forward, Edit2, Play, Pause, Mic, Check, CheckCheck } from 'lucide-react';
import api from '../../utils/api';
import socketService from '../../utils/socket';

const VoiceMessage = ({ fileId }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadAudio = async () => {
            try {
                setLoading(true);
                // We need to fetch the blob manually to send auth headers
                const token = localStorage.getItem('accessToken');
                const response = await fetch(`/api/v1/files/${fileId}/download`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setAudioUrl(url);
            } catch (error) {
                console.error('Failed to load voice message:', error);
            } finally {
                setLoading(false);
            }
        };

        if (fileId) loadAudio();
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [fileId]);

    if (loading) return <div style={{ fontSize: '12px', color: '#8b98a5' }}>Loading audio...</div>;
    if (!audioUrl) return <div style={{ fontSize: '12px', color: '#ef4444' }}>Failed to load audio</div>;

    return (
        <audio controls src={audioUrl} style={{ height: '32px', maxWidth: '200px' }} />
    );
};

export function EnhancedMessageBubble({ message, isOwn, showAvatar, currentUserId, conversationId, onPin, onDelete, onReply, onForward, onEdit, isRead }) {
    const [showReactions, setShowReactions] = useState(false);
    const [reactions, setReactions] = useState(message.reactions || {});
    const [showMenu, setShowMenu] = useState(false);
    const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

    useEffect(() => {
        if (message.reactions) {
            setReactions(message.reactions);
        }
    }, [message.reactions]);

    useEffect(() => {
        if (!message || !message.id) return;

        if (!message.reactions) {
            loadReactions();
        }

        // Polling for reactions every 15 seconds as a fallback
        const interval = setInterval(() => {
            loadReactions();
        }, 15000);

        return () => clearInterval(interval);
    }, [message?.id]);

    const loadReactions = async () => {
        try {
            const data = await api.getMessageReactions(message.id);
            setReactions(data && typeof data === 'object' ? data : {});
        } catch (error) {
            console.error('Failed to load reactions:', error);
            // setReactions({}); // Don't clear if it fails, maybe we have socket data
        }
    };

    if (!message) return null;

    if (message.messageType === 'system') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '16px 0',
                width: '100%',
                opacity: 0.8
            }}>
                <div style={{
                    background: '#f8f9fa',
                    padding: '8px 24px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    color: '#616061',
                    border: '1px solid #dee2e6',
                    textAlign: 'center',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>
                    {message.content}
                </div>
            </div>
        );
    }

    if (message.messageType === 'poll') {
        const lines = message.content.split('\n');
        const question = lines[0]?.replace('Poll: ', '') || 'Untitled Poll';
        const options = lines[1]?.replace('Options: ', '').split(', ') || [];

        return (
            <div style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                width: '100%',
                margin: '12px 0'
            }}>
                <div style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '24px',
                    border: '2px solid #007bff',
                    width: '320px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
                    position: 'relative'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <div style={{ width: '32px', height: '32px', background: '#007bff0a', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '18px' }}>📊</span>
                        </div>
                        <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '900', color: '#1a1d21', textTransform: 'uppercase', tracking: '-0.02em' }}>{question}</h4>
                    </div>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        {options.map((opt, i) => (
                            <button
                                key={i}
                                style={{
                                    background: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    padding: '12px 16px',
                                    borderRadius: '12px',
                                    color: '#1a1d21',
                                    textAlign: 'left',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: '700'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#007bff0a'; e.currentTarget.style.borderColor = '#007bff'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = '#f8f9fa'; e.currentTarget.style.borderColor = '#dee2e6'; }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                    <div style={{ marginTop: '15px', padding: '10px', background: '#f8f9fa', borderRadius: '12px', textAlign: 'center', fontSize: '11px', color: '#616061', fontWeight: '600' }}>
                        Secured Voting Process • Authorized Respondents Only
                    </div>
                </div>
            </div>
        );
    }

    if (message.messageType === 'broadcast') {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                margin: '20px 0'
            }}>
                <div style={{
                    background: '#ffffff',
                    padding: '32px',
                    borderRadius: '24px',
                    border: '1px solid #007bff',
                    width: '90%',
                    maxWidth: '500px',
                    position: 'relative',
                    textAlign: 'center',
                    boxShadow: '0 4px 20px rgba(0,123,255,0.05)'
                }}>
                    <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: '#007bff', padding: '4px 20px', borderRadius: '12px', color: '#fff', fontSize: '10px', fontWeight: '900', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Official Protocol Directive
                    </div>
                    <div style={{ color: '#1a1d21', fontSize: '16px', fontWeight: '800', lineHeight: '1.6', marginBottom: '16px' }}>
                        {message.content}
                    </div>
                    <div style={{ fontSize: '12px', color: '#616061', fontWeight: '600' }}>
                        Broadcast by {message.sender?.firstName || 'Command'} • {new Date(message.createdAt).toLocaleTimeString()}
                    </div>
                </div>
            </div>
        );
    }

    const handleReaction = async (emoji) => {
        console.log(`[Reactions] Clicked ${emoji} for message ${message.id}`);
        try {
            // Optimistic update local
            const userId = currentUserId;
            const currentUsers = reactions[emoji] || [];
            if (!currentUsers.some(u => u.userId === userId)) {
                setReactions(prev => ({
                    ...prev,
                    [emoji]: [...currentUsers, { userId }]
                }));
            }

            // Emit to socket for real-time
            socketService.sendMessageReaction(conversationId, message.id, emoji);

            // Save to DB
            await api.addReaction(message.id, emoji);

            setShowReactions(false);
        } catch (error) {
            console.error('[Reactions] Error:', error);
            // alert('Failed to add reaction. Please try again.');
        }
    };

    const handlePin = async () => {
        try {
            await api.pinMessage(conversationId, message.id);
            setShowMenu(false);
            if (onPin) onPin();
        } catch (error) {
            console.error('Failed to pin:', error);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this message for everyone?')) return;
        try {
            await api.deleteMessage(message.id);
            if (onDelete) onDelete(message.id);
            setShowMenu(false);
        } catch (error) {
            console.error('Failed to delete:', error);
            alert('Failed to delete message.');
        }
    };

    const totalReactions = reactions ? Object.values(reactions).reduce((sum, users) => sum + (users?.length || 0), 0) : 0;

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isOwn ? 'flex-end' : 'flex-start',
            marginBottom: '4px',
            width: '100%'
        }}>
            {!isOwn && showAvatar && (
                <div style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                    paddingLeft: '44px' /* 34px avatar + 10px gap */
                }}>
                    {message.sender?.firstName || message.sender?.username || 'User'}
                </div>
            )}

            <div style={{
                display: 'flex',
                justifyContent: isOwn ? 'flex-end' : 'flex-start',
                gap: '10px',
                alignItems: 'flex-start',
                position: 'relative',
                width: '100%'
            }}>
                {/* Other user avatar - left side */}
                {!isOwn && (
                    <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#fff',
                        flexShrink: 0,
                        visibility: showAvatar ? 'visible' : 'hidden'
                    }}>
                        {message.sender?.firstName?.charAt(0) || message.sender?.username?.charAt(0) || '?'}
                    </div>
                )}

                <div style={{ maxWidth: '72%', position: 'relative' }}>                <div
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                    style={{ position: 'relative' }}
                >
                    <div style={{
                        background: isOwn ? '#667eea' : 'var(--bg-panel)',
                        color: isOwn ? '#ffffff' : 'var(--text-main)',
                        padding: '10px 16px',
                        borderRadius: isOwn ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word',
                        position: 'relative',
                        border: isOwn ? 'none' : '1px solid var(--border-color)',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.06)'
                    }}>
                        {message.messageType === 'file' ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: isOwn ? 'rgba(255,255,255,0.1)' : '#f8f9fa',
                                padding: '12px',
                                borderRadius: '8px',
                                border: isOwn ? 'none' : '1px solid #dee2e6'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '6px',
                                    background: '#007bff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <FileText size={20} color="#fff" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '14px',
                                        fontWeight: '700',
                                        color: isOwn ? '#fff' : '#1a1d21',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {message.content?.replace('📎 Shared a file: ', '') || 'Shared File'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: isOwn ? 'rgba(255,255,255,0.7)' : '#616061' }}>E2EE Encrypted</div>
                                </div>
                                <button
                                    onClick={() => {
                                        const filename = message.content?.replace('📎 Shared a file: ', '') || 'file';
                                        if (message.fileId) api.downloadFile(message.fileId, filename);
                                    }}
                                    style={{ background: 'transparent', border: 'none', color: isOwn ? '#fff' : '#007bff', cursor: 'pointer' }}
                                ><Download size={18} /></button>
                            </div>
                        ) : message.messageType === 'voice' ? (
                            <div style={{ marginTop: '4px' }}>
                                <VoiceMessage fileId={message.fileId} />
                            </div>
                        ) : (
                            message.content
                        )}

                        {/* Menu button */}
                        <div
                            onClick={() => setShowMenu(!showMenu)}
                            style={{
                                position: 'absolute',
                                top: '8px',
                                right: '-30px',
                                cursor: 'pointer',
                                opacity: showReactions ? 1 : 0,
                                color: '#616061'
                            }}
                        >
                            <MoreVertical size={16} />
                        </div>

                        {/* Context menu */}
                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '0',
                                right: isOwn ? 'calc(100% + 10px)' : 'auto',
                                left: isOwn ? 'auto' : 'calc(100% + 10px)',
                                background: '#ffffff',
                                border: '1px solid #dee2e6',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                zIndex: 100,
                                minWidth: '150px'
                            }}>
                                {[
                                    { icon: Pin, text: 'Pin', action: handlePin },
                                    { icon: Reply, text: 'Reply', action: () => { onReply && onReply(message); setShowMenu(false); } },
                                    { icon: Forward, text: 'Forward', action: () => { onForward && onForward(message); setShowMenu(false); } },
                                    ...(isOwn ? [
                                        { icon: Edit2, text: 'Edit', action: () => { onEdit && onEdit(message); setShowMenu(false); } },
                                        { icon: Trash2, text: 'Delete', action: handleDelete, color: '#e01e5a' }
                                    ] : [])
                                ].map((item, i) => (
                                    <div
                                        key={i}
                                        onClick={item.action}
                                        style={{
                                            padding: '8px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '13px',
                                            color: item.color || '#1a1d21'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <item.icon size={14} /> {item.text}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reaction picker */}
                    {showReactions && !showMenu && (
                        <div style={{
                            position: 'absolute',
                            top: '-45px',
                            right: isOwn ? 0 : 'auto',
                            left: isOwn ? 'auto' : 0,
                            background: '#ffffff',
                            borderRadius: '24px',
                            padding: '6px 12px',
                            display: 'flex',
                            gap: '10px',
                            border: '1px solid #dee2e6',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 50
                        }}>
                            {reactionEmojis.map(emoji => (
                                <span key={emoji} onClick={() => handleReaction(emoji)} style={{ cursor: 'pointer', fontSize: '20px' }}>{emoji}</span>
                            ))}
                        </div>
                    )}
                </div>

                    {/* Display reactions */}
                    {totalReactions > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '4px',
                            marginTop: '-10px',
                            position: 'relative',
                            zIndex: 2,
                            justifyContent: isOwn ? 'flex-end' : 'flex-start'
                        }}>
                            {reactions && Object.entries(reactions).map(([emoji, users]) => (
                                <div
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #dee2e6',
                                        borderRadius: '12px',
                                        padding: '2px 8px',
                                        fontSize: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}
                                >
                                    <span>{emoji} {users?.length}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{
                        fontSize: '12px',
                        color: '#616061',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start'
                    }}>
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        {message.isEdited && <span style={{ fontSize: '11px' }}>(edited)</span>}
                        {isOwn && (isRead ? <CheckCheck size={14} color="#007bff" /> : <Check size={14} color="#616061" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
