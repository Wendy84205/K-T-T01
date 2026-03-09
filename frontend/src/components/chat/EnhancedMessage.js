import React, { useState, useEffect, useRef } from 'react';
import { Lock, Pin, MoreVertical, FileText, Download, Trash2, Reply, Forward, Edit2, Play, Pause, Mic, Check, CheckCheck, Clock } from 'lucide-react';
import api from '../../utils/api';
import socketService from '../../utils/socket';

const VoiceMessage = ({ fileId, isOwn }) => {
    const [audioUrl, setAudioUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const audioRef = useRef(null);
    const [waveform] = useState(() =>
        Array.from({ length: 30 }, () => Math.floor(Math.random() * 60) + 20)
    );

    useEffect(() => {
        const loadAudio = async () => {
            try {
                setLoading(true);
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

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const onTimeUpdate = () => {
        setCurrentTime(audioRef.current.currentTime);
    };

    const onLoadedMetadata = () => {
        setDuration(audioRef.current.duration);
    };

    const onEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
    };

    if (loading) return <div style={{ fontSize: '12px', color: isOwn ? 'rgba(255,255,255,0.7)' : '#8b98a5', padding: '10px' }}>Loading Protocol Voice...</div>;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 4px',
            minWidth: '220px'
        }}>
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={onTimeUpdate}
                onLoadedMetadata={onLoadedMetadata}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={onEnded}
            />

            <button
                onClick={togglePlay}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isOwn ? 'rgba(255,255,255,0.2)' : 'var(--primary)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff',
                    flexShrink: 0
                }}
            >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" style={{ marginLeft: '2px' }} />}
            </button>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {/* Waveform Visualization */}
                <div style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: '3px',
                    height: '32px',
                    cursor: 'pointer',
                    padding: '4px 0',
                }}
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const pct = x / rect.width;
                        if (audioRef.current) audioRef.current.currentTime = pct * duration;
                    }}
                >
                    {waveform.map((h, i) => {
                        const progress = duration > 0 ? (currentTime / duration) : 0;
                        const isPlayed = (i / waveform.length) <= progress;
                        return (
                            <div key={i} style={{
                                width: '3.5px',
                                height: `${h}%`,
                                minHeight: '4px',
                                background: isPlayed
                                    ? (isOwn ? '#fff' : 'linear-gradient(to top, var(--primary), #38b6ff)')
                                    : (isOwn ? 'rgba(255,255,255,0.3)' : 'var(--bg-light)'),
                                borderRadius: '3px',
                                transition: 'all 0.1s ease',
                                transform: isPlayed && isPlaying && (Math.abs(i - Math.floor(progress * waveform.length)) < 2) ? 'scaleY(1.4)' : 'scaleY(1)',
                                opacity: isPlayed ? 1 : 0.6
                            }} />
                        );
                    })}
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '10px',
                    fontWeight: '700',
                    color: isOwn ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)'
                }}>
                    <span>{new Date(currentTime * 1000).toISOString().substr(14, 5)}</span>
                    <span>{duration ? new Date(duration * 1000).toISOString().substr(14, 5) : '00:00'}</span>
                </div>
            </div>
        </div>
    );
};

export function EnhancedMessageBubble({ message, isOwn, showAvatar, currentUserId, conversationId, onPin, onDelete, onReply, onForward, onEdit }) {
    const [showReactions, setShowReactions] = useState(false);
    const [reactions, setReactions] = useState(message.reactions || {});
    const [showMenu, setShowMenu] = useState(false);
    const [selfDestructRemaining, setSelfDestructRemaining] = useState(null);
    const reactionEmojis = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

    useEffect(() => {
        if (message.reactions) {
            setReactions(message.reactions);
        }
    }, [message.reactions]);

    // Handle Self-Destruct Timer
    useEffect(() => {
        if (!message.expiresAt) return;

        const updateTimer = () => {
            const now = new Date();
            const expires = new Date(message.expiresAt);
            const diff = Math.max(0, Math.floor((expires - now) / 1000));
            setSelfDestructRemaining(diff);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [message.expiresAt]);

    useEffect(() => {
        if (!message || !message.id) return;
        if (!message.reactions) {
            loadReactions();
        }
    }, [message?.id]);

    const loadReactions = async () => {
        try {
            const data = await api.getMessageReactions(message.id);
            setReactions(data && typeof data === 'object' ? data : {});
        } catch (error) {
            console.error('Failed to load reactions:', error);
        }
    };

    if (!message) return null;

    if (message.messageType === 'system') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0', width: '100%', opacity: 0.8 }}>
                <div style={{ background: 'var(--bg-panel)', padding: '6px 20px', borderRadius: '20px', fontSize: '11px', color: 'var(--text-muted)', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: '800' }}>
                    {message.content}
                </div>
            </div>
        );
    }

    const handleReaction = async (emoji) => {
        try {
            const userId = currentUserId;
            const currentUsers = reactions[emoji] || [];
            if (!currentUsers.some(u => u.userId === userId)) {
                setReactions(prev => ({ ...prev, [emoji]: [...currentUsers, { userId }] }));
            }
            socketService.sendMessageReaction(conversationId, message.id, emoji);
            await api.addReaction(message.id, emoji);
            setShowReactions(false);
        } catch (error) {
            console.error('[Reactions] Error:', error);
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
                    fontSize: '12px',
                    fontWeight: '800',
                    color: 'var(--text-muted)',
                    marginBottom: '4px',
                    paddingLeft: '44px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em'
                }}>
                    {message.sender?.firstName || 'User'}
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
                {!isOwn && (
                    <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
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
                        {message.sender?.firstName?.charAt(0) || '?'}
                    </div>
                )}

                <div style={{ maxWidth: '75%', position: 'relative' }}>
                    <div
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                    >
                        <div style={{
                            background: isOwn ? 'var(--primary)' : 'var(--bg-panel)',
                            color: isOwn ? '#ffffff' : 'var(--text-main)',
                            padding: '10px 16px',
                            borderRadius: isOwn ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                            fontSize: '14.5px',
                            lineHeight: '1.5',
                            wordBreak: 'break-word',
                            position: 'relative',
                            border: isOwn ? 'none' : '1px solid var(--border-color)',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s'
                        }}>
                            {message.messageType === 'file' ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: isOwn ? 'rgba(255,255,255,0.1)' : 'var(--bg-light)',
                                    padding: '12px',
                                    borderRadius: '12px',
                                    border: isOwn ? 'none' : '1px solid var(--border-color)'
                                }}>
                                    <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: isOwn ? '#fff' : 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <FileText size={20} color={isOwn ? 'var(--primary)' : '#fff'} />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '14px', fontWeight: '700', color: isOwn ? '#fff' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {message.content?.replace('📎 Shared a file: ', '') || 'Shared File'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: isOwn ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontWeight: '600' }}>AES-256 ENCRYPTED</div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const filename = message.content?.replace('📎 Shared a file: ', '') || 'file';
                                            if (message.fileId) api.downloadFile(message.fileId, filename);
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: isOwn ? '#fff' : 'var(--primary)', cursor: 'pointer' }}
                                    ><Download size={18} /></button>
                                </div>
                            ) : message.messageType === 'voice' ? (
                                <VoiceMessage fileId={message.fileId} isOwn={isOwn} />
                            ) : (
                                message.content
                            )}

                            {/* Self-destruct badge */}
                            {selfDestructRemaining !== null && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    marginTop: '8px',
                                    padding: '4px 8px',
                                    background: isOwn ? 'rgba(0,0,0,0.2)' : 'var(--bg-red-soft)',
                                    borderRadius: '8px',
                                    fontSize: '10px',
                                    fontWeight: '800',
                                    color: isOwn ? '#fff' : 'var(--red-color)',
                                    alignSelf: 'flex-start',
                                    width: 'fit-content'
                                }}>
                                    <Clock size={12} /> SECURED: {selfDestructRemaining}s
                                </div>
                            )}

                            {/* Menu button */}
                            <div
                                onClick={() => setShowMenu(!showMenu)}
                                style={{
                                    position: 'absolute',
                                    top: '50%',
                                    right: isOwn ? 'calc(100% + 10px)' : 'calc(-30px)',
                                    transform: 'translateY(-50%)',
                                    cursor: 'pointer',
                                    opacity: (showReactions || showMenu) ? 1 : 0,
                                    color: 'var(--text-muted)',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                <MoreVertical size={16} />
                            </div>

                            {showMenu && (
                                <div style={{
                                    position: 'absolute',
                                    top: '0',
                                    right: isOwn ? 'calc(100% + 10px)' : 'auto',
                                    left: isOwn ? 'auto' : 'calc(100% + 10px)',
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                                    zIndex: 100,
                                    minWidth: '160px',
                                    overflow: 'hidden'
                                }}>
                                    {[
                                        { icon: Pin, text: 'Pin Protocol', action: handlePin },
                                        { icon: Reply, text: 'Reply', action: () => { onReply && onReply(message); setShowMenu(false); } },
                                        { icon: Forward, text: 'Forward', action: () => { onForward && onForward(message); setShowMenu(false); } },
                                        ...(isOwn ? [
                                            { icon: Edit2, text: 'Edit', action: () => { onEdit && onEdit(message); setShowMenu(false); } },
                                            { icon: Trash2, text: 'Delete Everywhere', action: handleDelete, color: 'var(--red-color)' }
                                        ] : [])
                                    ].map((item, i) => (
                                        <div
                                            key={i}
                                            onClick={item.action}
                                            style={{
                                                padding: '10px 16px',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                fontSize: '13px',
                                                fontWeight: '600',
                                                color: item.color || 'var(--text-main)',
                                                borderBottom: i === (isOwn ? 4 : 2) ? 'none' : '1px solid var(--border-color)'
                                            }}
                                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-selected)'}
                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <item.icon size={14} /> {item.text}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {showReactions && !showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '-45px',
                                right: isOwn ? 0 : 'auto',
                                left: isOwn ? 'auto' : 0,
                                background: 'var(--bg-panel)',
                                borderRadius: '24px',
                                padding: '6px 14px',
                                display: 'flex',
                                gap: '12px',
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                zIndex: 50
                            }}>
                                {reactionEmojis.map(emoji => (
                                    <span key={emoji} onClick={() => handleReaction(emoji)} style={{ cursor: 'pointer', fontSize: '20px', transition: 'transform 0.1s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.3)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>{emoji}</span>
                                ))}
                            </div>
                        )}
                    </div>

                    {totalReactions > 0 && (
                        <div style={{
                            display: 'flex',
                            gap: '4px',
                            marginTop: '-12px',
                            position: 'relative',
                            zIndex: 2,
                            justifyContent: isOwn ? 'flex-end' : 'flex-start',
                            padding: '0 4px'
                        }}>
                            {reactions && Object.entries(reactions).map(([emoji, users]) => (
                                <div
                                    key={emoji}
                                    onClick={() => handleReaction(emoji)}
                                    style={{
                                        background: 'var(--bg-panel)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        padding: '2px 8px',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        cursor: 'pointer',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                                        color: 'var(--text-main)'
                                    }}
                                >
                                    <span>{emoji}</span>
                                    <span>{users?.length}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'var(--text-muted)',
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        justifyContent: isOwn ? 'flex-end' : 'flex-start',
                        padding: '0 4px'
                    }}>
                        {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        {message.isEdited && <span style={{ opacity: 0.6 }}>(EDITED)</span>}
                        {isOwn && (message.isRead ? <CheckCheck size={14} color="#38b6ff" /> : <Check size={14} color="var(--text-muted)" />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
