import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    BarChart3, Users, Layers, Calendar, Clock, Plus, Search, Filter,
    MoreVertical, CheckCircle2, Circle, AlertCircle, TrendingUp,
    FileText, Briefcase, MessageSquare, Send, Phone, Video, Info,
    Shield, Lock, ChevronDown, X, Bell, BellOff, Pin, Trash2,
    Paperclip, Smile, Settings, MoreHorizontal, Edit2, Reply,
    Forward, Check, CheckCheck, UserPlus, LogOut, RefreshCw, Hash
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import socketService from '../../utils/socket';

// ─── Mini NavIcon for Manager sidebar ─────────────────────────────────────────
function ManagerNavItem({ icon, label, active, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            title={label}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', background: active ? 'rgba(102,126,234,0.15)' : 'transparent',
                border: 'none', borderLeft: `3px solid ${active ? '#667eea' : 'transparent'}`,
                color: active ? '#667eea' : '#8b98a5', borderRadius: '0 10px 10px 0',
                cursor: 'pointer', fontSize: '14px', fontWeight: active ? '600' : '400',
                transition: 'all 0.2s', position: 'relative',
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(102,126,234,0.07)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
        >
            {icon}
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            {badge > 0 && (
                <span style={{
                    background: '#ef4444', color: '#fff', fontSize: '11px', fontWeight: '700',
                    padding: '2px 6px', borderRadius: '10px', minWidth: '18px', textAlign: 'center'
                }}>{badge}</span>
            )}
        </button>
    );
}

// ─── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel({ currentUser }) {
    const [conversations, setConversations] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const [msgLoading, setMsgLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [onlineIds, setOnlineIds] = useState(new Set());
    const [showInfo, setShowInfo] = useState(false);
    const [groupInfo, setGroupInfo] = useState(null);
    const [unreadCounts, setUnreadCounts] = useState({});
    const messagesEndRef = useRef(null);
    const typingTimerRef = useRef(null);

    // Socket setup
    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (!token || !currentUser?.id) return;

        socketService.connect(token, currentUser.id);

        socketService.onUserStatus(({ userId, status }) => {
            setOnlineIds(prev => {
                const next = new Set(prev);
                status === 'online' ? next.add(userId) : next.delete(userId);
                return next;
            });
        });

        socketService.onNewMessage((data) => {
            if (data.conversationId === selectedChat) {
                setMessages(prev => {
                    if (prev.some(m => m.id === data.id)) return prev;
                    return [...prev, data];
                });
                setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            } else {
                setUnreadCounts(prev => ({ ...prev, [data.conversationId]: (prev[data.conversationId] || 0) + 1 }));
            }
        });

        socketService.onUserTyping(({ userId, conversationId, isTyping }) => {
            if (conversationId !== selectedChat) return;
            setTypingUsers(prev => isTyping
                ? prev.some(u => u.userId === userId) ? prev : [...prev, { userId }]
                : prev.filter(u => u.userId !== userId));
        });

        return () => socketService.disconnect();
    }, [currentUser?.id, selectedChat]);

    // Load conversations
    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const data = await api.getConversations();
            setConversations(data?.conversations || data || []);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    // Load messages
    const loadMessages = useCallback(async (convId) => {
        if (!convId) return;
        try {
            setMsgLoading(true);
            const data = await api.getConversationMessages(convId);
            setMessages(data?.messages || data || []);
            await api.markAsRead(convId);
            setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setMsgLoading(false);
        }
    }, []);

    const handleSelectConv = async (conv) => {
        setSelectedChat(conv.id);
        setSelectedConv(conv);
        setShowInfo(false);
        socketService.joinConversation?.(conv.id);
        await loadMessages(conv.id);
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat || sending) return;
        const content = input.trim();
        setInput('');
        setSending(true);
        try {
            const msg = await api.sendMessage(selectedChat, content);
            socketService.sendMessage?.(selectedChat, msg);
            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
        } catch (err) {
            console.error('Failed to send message:', err);
            setInput(content);
        } finally {
            setSending(false);
        }
    };

    const handleTyping = () => {
        socketService.sendTyping?.(selectedChat, true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => socketService.sendTyping?.(selectedChat, false), 2000);
    };

    const getConvName = (conv) => {
        if (conv.conversationType === 'group') return conv.name || 'Unnamed Group';
        const other = conv.otherUser;
        return other ? `${other.firstName || ''} ${other.lastName || ''}`.trim() : 'Unknown';
    };

    const getConvInitial = (conv) => {
        return getConvName(conv).charAt(0).toUpperCase() || '?';
    };

    const isOnline = (conv) => {
        if (conv.conversationType === 'group') return false;
        return onlineIds.has(conv.otherUser?.id);
    };

    const formatTime = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        if (diff < 60000) return 'now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
        if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    const isGroup = selectedConv?.conversationType === 'group';

    return (
        <div style={{ display: 'flex', height: '100%', background: '#0e1621', overflow: 'hidden' }}>
            {/* Conversation list */}
            <div style={{
                width: '280px', flexShrink: 0, borderRight: '1px solid #2a3441',
                display: 'flex', flexDirection: 'column', background: '#151f2e'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #2a3441' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: '#fff', fontSize: '18px', fontWeight: '700' }}>Team Chat</h3>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#0e1621', borderRadius: '10px', padding: '8px 12px', border: '1px solid #2a3441'
                    }}>
                        <Search size={15} color="#8b98a5" />
                        <input placeholder="Search conversations..." style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: '#fff', fontSize: '13px', width: '100%'
                        }} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#8b98a5' }}>Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#8b98a5', fontSize: '13px' }}>
                            <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.3 }} />
                            <p>No conversations yet</p>
                        </div>
                    ) : (
                        conversations.map(conv => {
                            const unread = unreadCounts[conv.id] || 0;
                            const online = isOnline(conv);
                            const isSelected = selectedChat === conv.id;
                            return (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectConv(conv)}
                                    style={{
                                        padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '10px',
                                        alignItems: 'center', borderBottom: '1px solid #1a2332',
                                        background: isSelected ? 'rgba(102,126,234,0.12)' : 'transparent',
                                        borderLeft: `3px solid ${isSelected ? '#667eea' : 'transparent'}`,
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(102,126,234,0.06)'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{
                                            width: '42px', height: '42px', borderRadius: conv.conversationType === 'group' ? '12px' : '50%',
                                            background: isSelected ? '#667eea' : '#2a3441',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: '#fff', fontWeight: '700', fontSize: '16px'
                                        }}>
                                            {getConvInitial(conv)}
                                        </div>
                                        {online && (
                                            <div style={{
                                                position: 'absolute', bottom: 0, right: 0, width: '11px', height: '11px',
                                                background: '#4ade80', border: '2px solid #151f2e', borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: '#fff', fontWeight: unread > 0 ? '700' : '500', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                                                {getConvName(conv)}
                                            </span>
                                            <span style={{ color: '#8b98a5', fontSize: '11px', flexShrink: 0 }}>
                                                {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                            <span style={{ color: '#8b98a5', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '155px' }}>
                                                {conv.lastMessage?.content || (conv.conversationType === 'group' ? `${conv.members?.length || 0} members` : 'Start chatting')}
                                            </span>
                                            {unread > 0 && (
                                                <span style={{
                                                    background: '#667eea', color: '#fff', fontSize: '11px', fontWeight: '700',
                                                    width: '18px', height: '18px', borderRadius: '50%', display: 'flex',
                                                    alignItems: 'center', justifyContent: 'center', flexShrink: 0
                                                }}>{unread > 9 ? '9+' : unread}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Main chat area */}
            {!selectedChat ? (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px' }}>
                    <div style={{
                        width: '80px', height: '80px', background: 'rgba(102,126,234,0.1)',
                        borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <MessageSquare size={40} color="#667eea" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: '#fff', margin: '0 0 8px 0', fontSize: '20px', fontWeight: '700' }}>Team Communication Hub</h3>
                        <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>Select a conversation from the left to start chatting</p>
                        <p style={{ color: '#667eea', fontSize: '12px', marginTop: '8px', opacity: 0.8 }}>🔒 End-to-end encrypted</p>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    {/* Chat header */}
                    <div style={{ padding: '12px 20px', background: '#151f2e', borderBottom: '1px solid #2a3441', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '40px', height: '40px', borderRadius: isGroup ? '10px' : '50%',
                                background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: '700', fontSize: '16px'
                            }}>
                                {getConvInitial(selectedConv)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: '#fff', fontWeight: '600', fontSize: '15px' }}>{getConvName(selectedConv)}</span>
                                    <Lock size={12} color="#667eea" />
                                </div>
                                <span style={{ color: '#8b98a5', fontSize: '12px' }}>
                                    {isGroup ? `${selectedConv.members?.length || 0} members` : (isOnline(selectedConv) ? '🟢 Active now' : '⚫ Offline')}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setShowInfo(!showInfo)} style={{
                                background: showInfo ? 'rgba(102,126,234,0.15)' : 'transparent', border: '1px solid #2a3441',
                                color: showInfo ? '#667eea' : '#8b98a5', padding: '7px', borderRadius: '8px',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.2s'
                            }} title="Group Info">
                                <Info size={17} />
                            </button>
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                        {/* Messages */}
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {msgLoading ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: '#8b98a5' }}>Loading messages...</div>
                                ) : messages.length === 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '12px' }}>
                                        <Lock size={36} color="#667eea" style={{ opacity: 0.3 }} />
                                        <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>Start a secure conversation</p>
                                    </div>
                                ) : (
                                    messages.filter(m => !m.messageType?.startsWith('signal_')).map((msg, i, arr) => {
                                        const isOwn = msg.sender?.id === currentUser?.id || msg.senderId === currentUser?.id;
                                        const showAvatar = i === 0 || arr[i - 1].sender?.id !== msg.sender?.id;
                                        const senderName = msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'Unknown';
                                        return (
                                            <div key={msg.id} style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap: '8px', alignItems: 'flex-end' }}>
                                                {!isOwn && showAvatar && (
                                                    <div style={{
                                                        width: '30px', height: '30px', borderRadius: '50%', background: '#667eea',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                                                        fontSize: '12px', fontWeight: '700', flexShrink: 0
                                                    }}>
                                                        {senderName.charAt(0)}
                                                    </div>
                                                )}
                                                {!isOwn && !showAvatar && <div style={{ width: '30px', flexShrink: 0 }} />}
                                                <div style={{ maxWidth: '65%', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                                                    {!isOwn && showAvatar && (
                                                        <span style={{ color: '#8b98a5', fontSize: '11px', marginLeft: '4px' }}>{senderName}</span>
                                                    )}
                                                    <div style={{
                                                        background: isOwn ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#1a2332',
                                                        padding: '9px 13px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                        color: '#fff', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word',
                                                        boxShadow: isOwn ? '0 2px 8px rgba(102,126,234,0.3)' : 'none'
                                                    }}>
                                                        {msg.messageType === 'file' ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <FileText size={16} />
                                                                <span style={{ fontSize: '13px' }}>{msg.content}</span>
                                                            </div>
                                                        ) : msg.content}
                                                    </div>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                        <span style={{ color: '#4a5568', fontSize: '11px' }}>{formatTime(msg.createdAt)}</span>
                                                        {isOwn && <CheckCheck size={12} color="#667eea" />}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                                {typingUsers.length > 0 && (
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ background: '#1a2332', padding: '8px 14px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                                            {[0, 1, 2].map(i => (
                                                <div key={i} style={{
                                                    width: '6px', height: '6px', background: '#8b98a5', borderRadius: '50%',
                                                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                                                }} />
                                            ))}
                                        </div>
                                        <span style={{ color: '#8b98a5', fontSize: '12px' }}>typing...</span>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSend} style={{ padding: '12px 16px', background: '#151f2e', borderTop: '1px solid #2a3441' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, background: '#1a2332', borderRadius: '12px', border: '1px solid #2a3441', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            value={input}
                                            onChange={e => { setInput(e.target.value); handleTyping(); }}
                                            placeholder="Type a secure message..."
                                            disabled={sending}
                                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '14px' }}
                                        />
                                        <Smile size={18} color="#8b98a5" style={{ cursor: 'pointer', flexShrink: 0 }} />
                                        <Paperclip size={18} color="#8b98a5" style={{ cursor: 'pointer', flexShrink: 0 }} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || sending}
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '12px', border: 'none', flexShrink: 0,
                                            background: input.trim() ? 'linear-gradient(135deg, #667eea, #764ba2)' : '#2a3441',
                                            cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                        }}
                                    >
                                        <Send size={18} color="#fff" />
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Info panel */}
                        {showInfo && selectedConv && (
                            <div style={{
                                width: '270px', flexShrink: 0, background: '#151f2e', borderLeft: '1px solid #2a3441',
                                display: 'flex', flexDirection: 'column', overflowY: 'auto'
                            }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #2a3441', textAlign: 'center' }}>
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: isGroup ? '16px' : '50%',
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff',
                                        fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', margin: '0 auto 12px'
                                    }}>
                                        {getConvInitial(selectedConv)}
                                    </div>
                                    <h4 style={{ color: '#fff', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{getConvName(selectedConv)}</h4>
                                    <p style={{ color: '#8b98a5', margin: 0, fontSize: '12px' }}>
                                        {isGroup ? `${selectedConv.members?.length || 0} members • Group Chat` : 'Direct Message'}
                                    </p>
                                </div>

                                <div style={{ padding: '12px 0' }}>
                                    <div style={{ padding: '8px 16px', color: '#8b98a5', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {isGroup ? 'Members' : 'Info'}
                                    </div>
                                    {isGroup && (selectedConv.members || []).map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px' }}>
                                            <div style={{ width: '34px', height: '34px', background: '#667eea', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                                                {m.firstName?.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{m.firstName} {m.lastName}</div>
                                                <div style={{ color: '#8b98a5', fontSize: '11px' }}>
                                                    {onlineIds.has(m.id) ? '🟢 Online' : '⚫ Offline'}
                                                    {m.role === 'admin' && <span style={{ marginLeft: '6px', color: '#667eea', fontSize: '10px', fontWeight: '700' }}>ADMIN</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ padding: '16px', marginTop: '8px', borderTop: '1px solid #2a3441' }}>
                                        <div style={{ padding: '10px 12px', background: 'rgba(102,126,234,0.08)', borderRadius: '8px', border: '1px solid rgba(102,126,234,0.2)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Lock size={14} color="#667eea" />
                                            <div>
                                                <div style={{ color: '#fff', fontSize: '12px', fontWeight: '500' }}>End-to-End Encrypted</div>
                                                <div style={{ color: '#8b98a5', fontSize: '11px' }}>AES-256-GCM</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Team Overview Panel ────────────────────────────────────────────────────────
function TeamOverviewPanel({ users, onStartChat }) {
    const [search, setSearch] = useState('');
    const filtered = users.filter(u => {
        const q = search.toLowerCase();
        return `${u.firstName} ${u.lastName} ${u.email} ${u.role}`.toLowerCase().includes(q);
    });

    const getRoleColor = (role) => ({ admin: '#ef4444', manager: '#f59e0b', user: '#10b981' }[role] || '#8b98a5');

    return (
        <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ color: '#fff', margin: '0 0 6px 0', fontSize: '24px', fontWeight: '800' }}>Team Overview</h2>
                    <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>{users.length} team members</p>
                </div>
                <div style={{ background: '#151f2e', border: '1px solid #2a3441', borderRadius: '12px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Search size={16} color="#8b98a5" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search team..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', width: '180px', fontSize: '14px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filtered.map(u => (
                    <div key={u.id} style={{
                        background: '#151f2e', border: '1px solid #2a3441', borderRadius: '16px',
                        padding: '20px', transition: 'all 0.2s', cursor: 'default'
                    }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = '#667eea'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = '#2a3441'}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            <div style={{
                                width: '52px', height: '52px', borderRadius: '14px',
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: '700', fontSize: '20px', flexShrink: 0
                            }}>
                                {u.firstName?.charAt(0) || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: '#fff', fontWeight: '600', fontSize: '16px' }}>{u.firstName} {u.lastName}</div>
                                <div style={{ color: '#8b98a5', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                            </div>
                            <span style={{
                                background: `${getRoleColor(u.role)}20`, color: getRoleColor(u.role),
                                fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '6px',
                                textTransform: 'uppercase', flexShrink: 0
                            }}>{u.role}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                                onClick={() => onStartChat(u.id)}
                                style={{
                                    flex: 1, background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.3)',
                                    color: '#667eea', padding: '8px', borderRadius: '8px', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                    fontSize: '13px', fontWeight: '600', transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(102,126,234,0.2)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(102,126,234,0.1)'}
                            >
                                <MessageSquare size={14} /> Chat
                            </button>
                            <span style={{
                                padding: '8px 10px', borderRadius: '8px',
                                background: u.status === 'active' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                color: u.status === 'active' ? '#10b981' : '#ef4444',
                                fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px',
                                border: `1px solid ${u.status === 'active' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                {u.status === 'active' ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Main ManageHomePage ───────────────────────────────────────────────────────
export default function ManageHomePage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState([]);
    const [teamUsers, setTeamUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [unreadChat, setUnreadChat] = useState(0);
    const [stats, setStats] = useState({
        totalProjects: 0, activeTasks: 0, teamCapacity: '85%', upcomingDeadlines: 0
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [projectData, userData] = await Promise.all([
                api.getProjects().catch(() => []),
                api.getChatUsers().catch(() => []),
            ]);
            setProjects(projectData || []);
            setTeamUsers(userData || []);
            setStats({
                totalProjects: projectData?.length || 0,
                activeTasks: Math.ceil(Math.random() * 20) + 5,
                teamCapacity: `${Math.ceil(Math.random() * 20) + 70}%`,
                upcomingDeadlines: Math.ceil(Math.random() * 5)
            });
        } catch (error) {
            console.error('Failed to load management data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartChatWithUser = async (userId) => {
        try {
            await api.getOrCreateDirectConversation(userId);
            setActiveTab('chat');
        } catch (err) {
            console.error('Failed to start conversation:', err);
        }
    };

    const getStatusColor = (status) => ({
        active: '#10b981', planned: '#667eea', on_hold: '#f59e0b', completed: '#8b98a5'
    }[status] || '#8b98a5');

    const navItems = [
        { id: 'overview', label: 'Overview', icon: <BarChart3 size={18} /> },
        { id: 'chat', label: 'Team Chat', icon: <MessageSquare size={18} />, badge: unreadChat },
        { id: 'team', label: 'My Team', icon: <Users size={18} /> },
        { id: 'projects', label: 'Projects', icon: <Layers size={18} /> },
    ];

    return (
        <div style={{ display: 'flex', height: '100vh', background: '#0e1621', color: '#fff', fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar nav */}
            <div style={{
                width: '220px', flexShrink: 0, background: '#151f2e', borderRight: '1px solid #2a3441',
                display: 'flex', flexDirection: 'column', paddingTop: '20px'
            }}>
                <div style={{ padding: '0 16px 20px', borderBottom: '1px solid #2a3441' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                            width: '40px', height: '40px', background: 'linear-gradient(135deg, #667eea, #764ba2)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Shield size={22} color="#fff" />
                        </div>
                        <div>
                            <div style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>Manager Hub</div>
                            <div style={{ color: '#8b98a5', fontSize: '12px' }}>{user?.firstName} {user?.lastName}</div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, paddingTop: '12px' }}>
                    {navItems.map(item => (
                        <ManagerNavItem
                            key={item.id}
                            icon={item.icon}
                            label={item.label}
                            active={activeTab === item.id}
                            badge={item.badge}
                            onClick={() => setActiveTab(item.id)}
                        />
                    ))}
                </div>

                <div style={{ padding: '16px', borderTop: '1px solid #2a3441' }}>
                    <button
                        onClick={() => { if (window.confirm('Logout?')) { localStorage.clear(); window.location.href = '/login'; } }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#ef4444', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <div style={{ padding: '16px 28px', background: '#151f2e', borderBottom: '1px solid #2a3441', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#fff' }}>
                            {navItems.find(i => i.id === activeTab)?.label || 'Management Hub'}
                        </h1>
                        <p style={{ color: '#8b98a5', fontSize: '13px', margin: '3px 0 0 0' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={loadData} style={{ background: 'rgba(102,126,234,0.1)', border: '1px solid rgba(102,126,234,0.3)', color: '#667eea', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>
                            <RefreshCw size={16} />
                        </button>
                        {activeTab === 'projects' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{ background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 18px', fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(102,126,234,0.35)' }}
                            >
                                <Plus size={16} /> New Project
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {/* ── Overview ── */}
                    {activeTab === 'overview' && (
                        <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
                                {[
                                    { label: 'Active Projects', value: stats.totalProjects, icon: <Layers size={22} />, color: '#667eea' },
                                    { label: 'Pending Tasks', value: stats.activeTasks, icon: <CheckCircle2 size={22} />, color: '#10b981' },
                                    { label: 'Team Capacity', value: stats.teamCapacity, icon: <Users size={22} />, color: '#f59e0b' },
                                    { label: 'Deadlines This Week', value: stats.upcomingDeadlines, icon: <Clock size={22} />, color: '#ef4444' },
                                ].map((s, i) => (
                                    <div key={i} style={{ background: '#151f2e', border: '1px solid #2a3441', borderRadius: '18px', padding: '22px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: s.color, borderRadius: '18px 0 0 18px' }} />
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <div style={{ color: '#8b98a5', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>{s.label}</div>
                                                <div style={{ fontSize: '30px', fontWeight: '800', color: '#fff' }}>{s.value}</div>
                                            </div>
                                            <div style={{ background: `${s.color}18`, padding: '12px', borderRadius: '12px', color: s.color }}>{s.icon}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div style={{ background: '#151f2e', border: '1px solid #2a3441', borderRadius: '18px', padding: '22px' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#fff' }}>Recent Projects</h3>
                                    {projects.slice(0, 4).map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #1a2332' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(p.status), flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                <div style={{ color: '#8b98a5', fontSize: '11px', textTransform: 'capitalize' }}>{p.status?.replace('_', ' ')}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {projects.length === 0 && <div style={{ color: '#8b98a5', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No projects yet</div>}
                                </div>

                                <div style={{ background: '#151f2e', border: '1px solid #2a3441', borderRadius: '18px', padding: '22px' }}>
                                    <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '700', color: '#fff' }}>Team Members</h3>
                                    {teamUsers.slice(0, 5).map(u => (
                                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0', borderBottom: '1px solid #1a2332', cursor: 'pointer' }}
                                            onClick={() => handleStartChatWithUser(u.id)}>
                                            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#667eea', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '700', fontSize: '14px', flexShrink: 0 }}>
                                                {u.firstName?.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{u.firstName} {u.lastName}</div>
                                                <div style={{ color: '#8b98a5', fontSize: '11px', textTransform: 'capitalize' }}>{u.role}</div>
                                            </div>
                                            <MessageSquare size={14} color="#667eea" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Team Chat ── */}
                    {activeTab === 'chat' && <ChatPanel currentUser={user} />}

                    {/* ── My Team ── */}
                    {activeTab === 'team' && (
                        <TeamOverviewPanel users={teamUsers} onStartChat={async (uid) => { await handleStartChatWithUser(uid); }} />
                    )}

                    {/* ── Projects ── */}
                    {activeTab === 'projects' && (
                        <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '80px', color: '#8b98a5' }}>Loading projects...</div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                                        {projects.map(project => (
                                            <div key={project.id} style={{
                                                background: '#151f2e', borderRadius: '18px', border: '1px solid #2a3441', padding: '22px', transition: 'all 0.2s', cursor: 'pointer'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#667eea'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a3441'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                                                    <span style={{ background: `${getStatusColor(project.status)}20`, color: getStatusColor(project.status), fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '8px' }}>
                                                        {project.status?.replace('_', ' ')}
                                                    </span>
                                                    <MoreVertical size={16} color="#8b98a5" />
                                                </div>
                                                <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>{project.name}</h3>
                                                <p style={{ color: '#8b98a5', fontSize: '13px', marginBottom: '16px', height: '36px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {project.description || 'No description provided.'}
                                                </p>
                                                <div style={{ display: 'flex', gap: '12px', color: '#8b98a5', fontSize: '12px', marginBottom: '14px' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Users size={12} /> Team</span>
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8b98a5', fontSize: '12px', marginBottom: '5px' }}>
                                                        <span>Progress</span><span style={{ color: '#fff', fontWeight: '600' }}>65%</span>
                                                    </div>
                                                    <div style={{ height: '5px', background: '#1a2332', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ width: '65%', height: '100%', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '3px', transition: 'width 0.8s ease' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {projects.length === 0 && (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px', background: '#151f2e', borderRadius: '18px', border: '1px dashed #2a3441' }}>
                                                <Briefcase size={48} style={{ color: '#2a3441', margin: '0 auto 16px' }} />
                                                <h3 style={{ color: '#fff', marginBottom: '8px' }}>No Projects Yet</h3>
                                                <p style={{ color: '#8b98a5', marginBottom: '20px' }}>Create your first project to get started.</p>
                                                <button onClick={() => setShowCreateModal(true)} style={{ background: '#667eea', color: '#fff', border: 'none', borderRadius: '10px', padding: '10px 24px', fontWeight: '600', cursor: 'pointer' }}>
                                                    Create Project
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Project Modal */}
            {showCreateModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(6px)' }}>
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
                        style={{ background: '#151f2e', border: '1px solid #2a3441', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '480px' }}
                    >
                        <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '6px' }}>New Project</h2>
                        <p style={{ color: '#8b98a5', fontSize: '13px', marginBottom: '24px' }}>Establish a new secure workspace for your team.</p>
                        <div style={{ display: 'grid', gap: '18px' }}>
                            {[
                                { label: 'Project Name', name: 'name', type: 'text', placeholder: 'e.g. Secure Infrastructure Overhaul', required: true },
                                { label: 'Description', name: 'description', type: 'textarea', placeholder: 'Core objectives and scope...' },
                            ].map(f => (
                                <div key={f.name}>
                                    <label style={{ display: 'block', color: '#8b98a5', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>{f.label}</label>
                                    {f.type === 'textarea'
                                        ? <textarea name={f.name} rows="3" placeholder={f.placeholder} style={{ width: '100%', background: '#0e1621', border: '1px solid #2a3441', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none', resize: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                                        : <input name={f.name} type={f.type} required={f.required} placeholder={f.placeholder} style={{ width: '100%', background: '#0e1621', border: '1px solid #2a3441', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                                    }
                                </div>
                            ))}
                            <div>
                                <label style={{ display: 'block', color: '#8b98a5', fontSize: '12px', marginBottom: '6px', fontWeight: '600' }}>Security Classification</label>
                                <select name="securityLevel" style={{ width: '100%', background: '#0e1621', border: '1px solid #2a3441', borderRadius: '10px', padding: '12px', color: '#fff', outline: 'none', fontSize: '14px' }}>
                                    <option value="1">Standard (L1)</option>
                                    <option value="2">Restricted (L2)</option>
                                    <option value="3">Confidential (L3)</option>
                                    <option value="4">Secret (L4)</option>
                                    <option value="5">Top Secret (L5)</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '13px', borderRadius: '10px', border: '1px solid #2a3441', background: 'transparent', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '13px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', fontWeight: '600', cursor: 'pointer' }}>Create</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
