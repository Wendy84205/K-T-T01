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
            justifyContent: isOwn ? 'flex-end' : 'flex-start',
            gap: '12px',
            alignItems: 'flex-end',
            position: 'relative',
            marginBottom: '4px'
        }}>
            {!isOwn && (
                <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    background: '#667eea',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#fff',
                    flexShrink: 0,
                    visibility: showAvatar ? 'visible' : 'hidden'
                }}>
                    {message.sender?.firstName?.charAt(0) || message.sender?.username?.charAt(0) || '?'}
                </div>
            )}

            <div style={{ maxWidth: '75%', position: 'relative' }}>
                {!isOwn && showAvatar && (
                    <div style={{
                        fontSize: '12px',
                        color: '#8b98a5',
                        marginBottom: '4px',
                        marginLeft: '12px'
                    }}>
                        {message.sender?.firstName || message.sender?.username || 'User'} {message.sender?.lastName || ''}
                    </div>
                )}

                <div
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                    style={{ position: 'relative' }}
                >
                    <div style={{
                        background: isOwn ? '#667eea' : '#1a2332',
                        color: '#fff',
                        padding: '12px 16px',
                        borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        fontSize: '14px',
                        lineHeight: '1.5',
                        wordBreak: 'break-word',
                        position: 'relative',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {message.messageType === 'file' ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                padding: '10px',
                                borderRadius: '10px',
                                marginTop: '4px',
                                border: '1px solid rgba(255,255,255,0.05)'
                            }}>
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '8px',
                                    background: '#667eea',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <FileText size={20} color="#fff" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{
                                        fontSize: '13px',
                                        fontWeight: '600',
                                        color: '#fff',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {message.content?.replace('📎 Shared a file: ', '') || 'Shared File'}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#8b98a5' }}>Encrypted Attachment</div>
                                </div>
                                <button
                                    onClick={() => {
                                        const filename = message.content?.replace('📎 Shared a file: ', '') || 'file';
                                        if (message.fileId) {
                                            api.downloadFile(message.fileId, filename);
                                        } else {
                                            alert('File ID not found for this message.');
                                        }
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#667eea',
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}
                                    title="Download File"
                                >
                                    <Download size={18} />
                                </button>
                            </div>
                        ) : message.messageType === 'voice' ? (
                            <div style={{ marginTop: '4px' }}>
                                <VoiceMessage fileId={message.fileId} />
                                <div style={{ fontSize: '11px', color: '#8b98a5', marginTop: '2px' }}>Voice Message</div>
                            </div>
                        ) : (
                            message.content
                        )}

                        {/* Menu button */}
                        <div
                            onClick={() => setShowMenu(!showMenu)}
                            style={{
                                position: 'absolute',
                                top: '4px',
                                right: '4px',
                                cursor: 'pointer',
                                opacity: showReactions ? 1 : 0,
                                transition: 'opacity 0.2s',
                                padding: '4px',
                                borderRadius: '4px',
                                background: 'rgba(0,0,0,0.1)'
                            }}
                        >
                            <MoreVertical size={14} />
                        </div>

                        {/* Context menu */}
                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: isOwn ? 0 : 'auto',
                                left: isOwn ? 'auto' : 0,
                                marginTop: '4px',
                                background: '#1a2332',
                                border: '1px solid #2a3441',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                zIndex: 100,
                                minWidth: '120px'
                            }}>
                                <div
                                    onClick={handlePin}
                                    style={{
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        color: '#fff',
                                        borderRadius: '8px'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a3441'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Pin size={14} />
                                    Pin Message
                                </div>
                                <div
                                    onClick={() => { onReply && onReply(message); setShowMenu(false); }}
                                    style={{
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a3441'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Reply size={14} />
                                    Reply
                                </div>
                                <div
                                    onClick={() => { onForward && onForward(message); setShowMenu(false); }}
                                    style={{
                                        padding: '10px 16px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        fontSize: '13px',
                                        color: '#fff'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a3441'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Forward size={14} />
                                    Forward
                                </div>
                                {isOwn && (
                                    <div
                                        onClick={() => { onEdit && onEdit(message); setShowMenu(false); }}
                                        style={{
                                            padding: '10px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            color: '#fff'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#2a3441'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Edit2 size={14} />
                                        Edit Message
                                    </div>
                                )}
                                {isOwn && (
                                    <div
                                        onClick={handleDelete}
                                        style={{
                                            padding: '10px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '13px',
                                            color: '#ef4444'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <Trash2 size={14} />
                                        Delete Message
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Reaction picker */}
                    {showReactions && (
                        <div style={{
                            position: 'absolute',
                            top: '-40px',
                            right: isOwn ? 0 : 'auto',
                            left: isOwn ? 'auto' : 0,
                            background: '#1a2332',
                            borderRadius: '20px',
                            padding: '6px 12px',
                            display: 'flex',
                            gap: '8px',
                            border: '1px solid #2a3441',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            zIndex: 50
                        }}>
                            {reactionEmojis.map(emoji => (
                                <span
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    style={{
                                        cursor: 'pointer',
                                        fontSize: '18px',
                                        transition: 'transform 0.2s',
                                        display: 'inline-block'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Display reactions */}
                {totalReactions > 0 && (
                    <div style={{
                        display: 'flex',
                        gap: '4px',
                        marginTop: '6px',
                        flexWrap: 'wrap',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        paddingLeft: isOwn ? 0 : '12px',
                        paddingRight: isOwn ? '12px' : 0
                    }}>
                        {reactions && Object.entries(reactions).map(([emoji, users]) => (
                            <div
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                style={{
                                    background: Array.isArray(users) && users.some(u => u.userId === currentUserId)
                                        ? 'rgba(102, 126, 234, 0.2)'
                                        : '#1a2332',
                                    border: Array.isArray(users) && users.some(u => u.userId === currentUserId)
                                        ? '1px solid #667eea'
                                        : '1px solid #2a3441',
                                    borderRadius: '12px',
                                    padding: '4px 8px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                title={Array.isArray(users) ? users.map(u => `${u.firstName || ''} ${u.lastName || ''}`).join(', ') : ''}
                            >
                                <span>{emoji}</span>
                                <span style={{ color: '#8b98a5', fontSize: '11px' }}>
                                    {users?.length || 0}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <div style={{
                    fontSize: '11px',
                    color: '#8b98a5',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    justifyContent: isOwn ? 'flex-end' : 'flex-start',
                    paddingLeft: isOwn ? 0 : '12px',
                    paddingRight: isOwn ? '12px' : 0
                }}>
                    {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }) : ''}
                    {message.isEdited && <span style={{ fontSize: '10px', fontStyle: 'italic' }}>edited</span>}
                    {message.isEncrypted && <Lock size={10} color="#667eea" />}
                    {isOwn && (
                        isRead ? <CheckCheck size={14} color="#667eea" /> : <Check size={14} color="#8b98a5" />
                    )}
                </div>
            </div>
        </div>
    );
}
