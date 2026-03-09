import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    BarChart3, Users, Layers, Calendar, Clock, Plus, Search, Filter,
    MoreVertical, CheckCircle2, Circle, AlertCircle, TrendingUp,
    FileText, Briefcase, MessageSquare, Send, Phone, Video, Info,
    Shield, Lock, ChevronDown, X, Bell, BellOff, Pin, Trash2,
    Paperclip, Smile, Settings, MoreHorizontal, Edit2, Reply,
    Forward, Check, CheckCheck, UserPlus, LogOut, RefreshCw, Hash, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import socketService from '../../utils/socket';
import { encryptContent, decryptContent } from '../../utils/crypto';

// ─── Mini NavIcon for Manager sidebar ─────────────────────────────────────────
function ManagerNavItem({ icon, label, active, onClick, badge }) {
    return (
        <button
            onClick={onClick}
            title={label}
            style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', background: active ? 'var(--active-bg)' : 'transparent',
                border: 'none', borderLeft: `3px solid ${active ? 'var(--primary)' : 'transparent'}`,
                color: active ? 'var(--primary)' : 'var(--text-secondary)', borderRadius: '0 10px 10px 0',
                cursor: 'pointer', fontSize: '13px', fontWeight: '800',
                textTransform: 'uppercase', letterSpacing: '0.02em',
                transition: 'all 0.15s ease', position: 'relative',
                margin: '2px 0'
            }}
            onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-panel)'; }}
            onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
        >
            {icon}
            <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
            {badge > 0 && (
                <span style={{
                    background: 'var(--red-color)', color: '#fff', fontSize: '10px', fontWeight: '900',
                    padding: '2px 8px', borderRadius: '6px', minWidth: '20px', textAlign: 'center'
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

        socketService.onNewMessage(async (data) => {
            if (data.content && data.content.startsWith('[E2EE]:')) {
                const rawContent = data.content.substring(7);
                const privateKey = localStorage.getItem(`e2ee_private_key_${currentUser.id}`);
                if (privateKey) {
                    try {
                        const encryptedData = JSON.parse(rawContent);
                        if (encryptedData[currentUser.id]) data.content = await decryptContent(encryptedData[currentUser.id], privateKey);
                    } catch (e) {
                        try { data.content = await decryptContent(rawContent, privateKey); } catch (err) { }
                    }
                } else {
                    data.content = " [E2EE: Missing Private Key]";
                }
            }

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

    const loadConversations = useCallback(async () => {
        try {
            setLoading(true);
            const dataRes = await api.getConversations();
            const data = dataRes?.conversations || dataRes || [];

            const privateKey = localStorage.getItem(`e2ee_private_key_${currentUser.id}`);
            const processedData = await Promise.all(
                data.map(async (conv) => {
                    if (conv.lastMessage && conv.lastMessage.content && conv.lastMessage.content.startsWith('[E2EE]:')) {
                        const rawContent = conv.lastMessage.content.substring(7);
                        if (!privateKey) {
                            conv.lastMessage.content = " [E2EE: Missing Private Key]";
                        } else {
                            try {
                                const encryptedData = JSON.parse(rawContent);
                                if (encryptedData[currentUser.id]) conv.lastMessage.content = await decryptContent(encryptedData[currentUser.id], privateKey);
                            } catch (e) {
                                try { conv.lastMessage.content = await decryptContent(rawContent, privateKey); } catch (err) { }
                            }
                        }
                    }
                    return conv;
                })
            );
            setConversations(processedData);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUser.id]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    const loadMessages = useCallback(async (convId) => {
        if (!convId) return;
        try {
            setMsgLoading(true);
            const dataRes = await api.getConversationMessages(convId);
            const rawMessages = dataRes?.messages || dataRes || [];

            const privateKey = localStorage.getItem(`e2ee_private_key_${currentUser.id}`);
            const newMessages = await Promise.all(rawMessages.map(async msg => {
                if (msg.content && msg.content.startsWith('[E2EE]:')) {
                    const rawContent = msg.content.substring(7);
                    if (!privateKey) {
                        msg.content = " [E2EE: Missing Private Key]";
                    } else {
                        try {
                            const encryptedData = JSON.parse(rawContent);
                            if (encryptedData[currentUser.id]) msg.content = await decryptContent(encryptedData[currentUser.id], privateKey);
                        } catch (e) {
                            try { msg.content = await decryptContent(rawContent, privateKey); } catch (err) { }
                        }
                    }
                }
                return msg;
            }));

            setMessages(newMessages);
            await api.markAsRead(convId);
            setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setMsgLoading(false);
        }
    }, [currentUser.id]);

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
        let finalContent = input.trim();
        setInput('');
        setSending(true);
        try {
            if (selectedConv && selectedConv.conversationType === 'direct' && selectedConv.otherUser?.publicKey) {
                try {
                    const encryptedForRecipient = await encryptContent(finalContent, selectedConv.otherUser.publicKey);

                    let myPublicKey = currentUser.publicKey;
                    if (!myPublicKey) {
                        try {
                            const prof = await api.getProfile();
                            myPublicKey = prof.user?.publicKey || prof.publicKey;
                        } catch (ex) { }
                    }

                    if (myPublicKey) {
                        const encryptedForMe = await encryptContent(finalContent, myPublicKey);
                        finalContent = `[E2EE]:${JSON.stringify({ [selectedConv.otherUser.id]: encryptedForRecipient, [currentUser.id]: encryptedForMe })}`;
                    } else {
                        finalContent = `[E2EE]:${JSON.stringify({ [selectedConv.otherUser.id]: encryptedForRecipient })}`;
                    }
                } catch (e) { }
            }

            const msg = await api.sendMessage(selectedChat, finalContent);
            socketService.sendMessage?.(selectedChat, msg);

            if (msg.content && msg.content.startsWith('[E2EE]:')) {
                const rawContent = msg.content.substring(7);
                const privateKey = localStorage.getItem(`e2ee_private_key_${currentUser.id}`);
                if (privateKey) {
                    try {
                        const encryptedData = JSON.parse(rawContent);
                        if (encryptedData[currentUser.id]) msg.content = await decryptContent(encryptedData[currentUser.id], privateKey);
                    } catch (e) { }
                }
            }

            setMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            loadConversations();
        } catch (err) {
            console.error('Failed to send message:', err);
            setInput(input.trim()); // restore raw input
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
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-panel)', overflow: 'hidden' }}>
            {/* Conversation list */}
            <div style={{
                width: '280px', flexShrink: 0, borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', background: 'var(--bg-app)'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <h3 style={{ margin: '0 0 12px 0', color: 'var(--text-main)', fontSize: '16px', fontWeight: '800', uppercase: 'true' }}>Team Messaging</h3>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--bg-panel)', borderRadius: '8px', padding: '8px 12px', border: '1px solid var(--border-color)'
                    }}>
                        <Search size={14} color="#616061" />
                        <input placeholder="Search..." style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: 'var(--text-main)', fontSize: '13px', width: '100%'
                        }} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#616061' }}>Loading...</div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: '#616061', fontSize: '13px' }}>
                            <MessageSquare size={32} style={{ margin: '0 auto 8px', opacity: 0.1 }} />
                            <p>No messages</p>
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
                                        alignItems: 'center', borderBottom: '1px solid #f1f3f5',
                                        background: isSelected ? 'var(--active-bg)' : 'transparent',
                                        borderLeft: `3px solid ${isSelected ? 'var(--primary)' : 'transparent'}`,
                                        transition: 'all 0.15s'
                                    }}
                                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = '#f1f3f5'; }}
                                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                                >
                                    <div style={{ position: 'relative', flexShrink: 0 }}>
                                        <div style={{
                                            width: '38px', height: '38px', borderRadius: '8px',
                                            background: isSelected ? 'var(--primary)' : 'var(--bg-light)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            color: isSelected ? '#fff' : 'var(--text-main)', fontWeight: '800', fontSize: '14px'
                                        }}>
                                            {getConvInitial(conv)}
                                        </div>
                                        {online && (
                                            <div style={{
                                                position: 'absolute', bottom: '-1px', right: '-1px', width: '10px', height: '10px',
                                                background: '#4ade80', border: '2px solid #f8f9fa', borderRadius: '50%'
                                            }} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ color: 'var(--text-main)', fontWeight: unread > 0 ? '800' : '500', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {getConvName(conv)}
                                            </span>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', flexShrink: 0 }}>
                                                {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1px' }}>
                                            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {conv.lastMessage?.content || (conv.conversationType === 'group' ? 'Group channel' : 'Personal chat')}
                                            </span>
                                            {unread > 0 && (
                                                <span style={{
                                                    background: 'var(--primary)', color: '#fff', fontSize: '10px', fontWeight: '800',
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
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: 'var(--bg-main)' }}>
                    <div style={{
                        width: '64px', height: '64px', background: 'var(--bg-primary-soft)',
                        borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <MessageSquare size={32} color="var(--primary)" />
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--text-main)', margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Team Communication</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px' }}>Select a team thread to start collaborating</p>
                    </div>
                </div>
            ) : (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-app)' }}>
                    {/* Chat header */}
                    <div style={{ padding: '12px 20px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                                width: '38px', height: '38px', borderRadius: '8px',
                                background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#fff', fontWeight: '800', fontSize: '15px'
                            }}>
                                {getConvInitial(selectedConv)}
                            </div>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '14px' }}>{getConvName(selectedConv)}</span>
                                    <Lock size={12} color="var(--primary)" />
                                </div>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                                    {isGroup ? `${selectedConv.members?.length || 0} participants` : (isOnline(selectedConv) ? 'Active' : 'Offline')}
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
                                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px' }}>Start a secure conversation</p>
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
                                                        background: isOwn ? 'linear-gradient(135deg, var(--primary), #764ba2)' : 'var(--bg-light)',
                                                        padding: '9px 13px', borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                        color: '#fff', fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word',
                                                        boxShadow: isOwn ? 'var(--shadow-primary)' : 'none'
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
                            <form onSubmit={handleSend} style={{ padding: '12px 16px', background: 'var(--bg-panel)', borderTop: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ flex: 1, background: 'var(--bg-app)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <input
                                            value={input}
                                            onChange={e => { setInput(e.target.value); handleTyping(); }}
                                            placeholder="Type a secure message..."
                                            disabled={sending}
                                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', fontSize: '14px' }}
                                        />
                                        <Smile size={18} color="var(--text-muted)" style={{ cursor: 'pointer', flexShrink: 0 }} />
                                        <Paperclip size={18} color="var(--text-muted)" style={{ cursor: 'pointer', flexShrink: 0 }} />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || sending}
                                        style={{
                                            width: '44px', height: '44px', borderRadius: '12px', border: 'none', flexShrink: 0,
                                            background: input.trim() ? 'linear-gradient(135deg, var(--primary), #764ba2)' : 'var(--bg-light)',
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
                                width: '270px', flexShrink: 0, background: 'var(--bg-panel)', borderLeft: '1px solid var(--border-color)',
                                display: 'flex', flexDirection: 'column', overflowY: 'auto'
                            }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                                    <div style={{
                                        width: '70px', height: '70px', borderRadius: isGroup ? '16px' : '50%',
                                        background: 'linear-gradient(135deg, var(--primary), #764ba2)', color: '#fff',
                                        fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', margin: '0 auto 12px'
                                    }}>
                                        {getConvInitial(selectedConv)}
                                    </div>
                                    <h4 style={{ color: 'var(--text-main)', margin: '0 0 4px 0', fontSize: '16px', fontWeight: '700' }}>{getConvName(selectedConv)}</h4>
                                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '12px' }}>
                                        {isGroup ? `${selectedConv.members?.length || 0} members • Group Chat` : 'Direct Message'}
                                    </p>
                                </div>

                                <div style={{ padding: '12px 0' }}>
                                    <div style={{ padding: '8px 16px', color: 'var(--text-muted)', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {isGroup ? 'Members' : 'Info'}
                                    </div>
                                    {isGroup && (selectedConv.members || []).map(m => (
                                        <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 16px' }}>
                                            <div style={{ width: '34px', height: '34px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0 }}>
                                                {m.firstName?.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '500' }}>{m.firstName} {m.lastName}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                                                    {onlineIds.has(m.id) ? '🟢 Online' : '⚫ Offline'}
                                                    {m.role === 'admin' && <span style={{ marginLeft: '6px', color: 'var(--primary)', fontSize: '10px', fontWeight: '700' }}>ADMIN</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div style={{ padding: '16px', marginTop: '8px', borderTop: '1px solid var(--border-color)' }}>
                                        <div style={{ padding: '10px 12px', background: 'var(--bg-primary-soft)', borderRadius: '8px', border: '1px solid var(--border-primary-soft)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <Lock size={14} color="var(--primary)" />
                                            <div>
                                                <div style={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: '500' }}>End-to-End Encrypted</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>AES-256-GCM</div>
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

    const getRoleColor = (role) => ({ admin: 'var(--red-color)', manager: 'var(--accent-amber)', user: 'var(--green-color)' }[role] || 'var(--text-secondary)');

    return (
        <div style={{ padding: '28px', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h2 style={{ color: 'var(--text-main)', margin: '0 0 6px 0', fontSize: '22px', fontWeight: '900', textTransform: 'uppercase', tracking: '-0.02em' }}>Directory</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px', fontWeight: '500' }}>{users.length} active staff members linked</p>
                </div>
                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px', width: '260px' }}>
                    <Search size={14} color="#616061" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Filter by name, email or role..."
                        style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-main)', width: '100%', fontSize: '13px' }}
                    />
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {filtered.map(u => (
                    <div key={u.id} style={{
                        background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '12px',
                        padding: '24px', transition: 'all 0.2s', cursor: 'default',
                        shadow: '0 4px 20px rgba(0,0,0,0.02)'
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                            <div style={{
                                width: '48px', height: '48px', borderRadius: '10px',
                                background: 'var(--bg-light)', border: '1px solid var(--border-color)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: 'var(--primary)', fontWeight: '800', fontSize: '18px', flexShrink: 0
                            }}>
                                {u.firstName?.charAt(0) || '?'}
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ color: 'var(--text-main)', fontWeight: '700', fontSize: '15px' }}>{u.firstName} {u.lastName}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span style={{
                                background: `${getRoleColor(u.role)}10`, color: getRoleColor(u.role),
                                fontSize: '10px', fontWeight: '900', padding: '4px 10px', borderRadius: '6px',
                                textTransform: 'uppercase', flexShrink: 0, tracking: '0.05em'
                            }}>{u.role}</span>
                            <span style={{
                                color: u.status === 'active' ? 'var(--green-color)' : 'var(--red-color)',
                                fontSize: '11px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }} />
                                {u.status === 'active' ? 'Operational' : 'Restricted'}
                            </span>
                        </div>

                        <button
                            onClick={() => onStartChat(u.id)}
                            style={{
                                width: '100%', background: 'var(--primary)', border: 'none',
                                color: '#fff', padding: '10px', borderRadius: '8px', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                fontSize: '12px', fontWeight: '900', transition: 'all 0.2s', textTransform: 'uppercase'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <MessageSquare size={14} /> Open Secure Channel
                        </button>
                    </div>
                ))}
            </div>
        </div >
    );
}

// ─── Main ManageHomePage ───────────────────────────────────────────────────────
export default function ManageHomePage() {
    const { user, darkMode, toggleDarkMode } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [projects, setProjects] = useState([]);
    const [teamUsers, setTeamUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [unreadChat, setUnreadChat] = useState(0);
    const [stats, setStats] = useState({
        totalProjects: 0, activeTasks: 0, teamCapacity: '85%', upcomingDeadlines: 0
    });

    useEffect(() => {
        const root = document.documentElement;
        if (darkMode) {
            root.style.setProperty('--bg-app', '#0e1621');
            root.style.setProperty('--bg-panel', '#17212b');
            root.style.setProperty('--bg-main', '#0e1621');
            root.style.setProperty('--bg-light', '#242f3d');
            root.style.setProperty('--bg-selected', '#2b5278');
            root.style.setProperty('--border-color', '#242f3d');
            root.style.setProperty('--text-main', '#ffffff');
            root.style.setProperty('--text-secondary', '#8b98a5');
            root.style.setProperty('--text-muted', '#707579');
            root.style.setProperty('--primary', '#667eea');
            root.style.setProperty('--primary-light', 'rgba(102, 126, 234, 0.15)');
            root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.3)');
            root.style.setProperty('--shadow-primary', 'rgba(102, 126, 234, 0.4)');
            root.style.setProperty('--bg-primary-soft', 'rgba(102, 126, 234, 0.1)');
            root.style.setProperty('--border-primary-soft', 'rgba(102, 126, 234, 0.2)');
            root.style.setProperty('--bg-green-soft', 'rgba(16, 185, 129, 0.1)');
            root.style.setProperty('--green-color', '#10b981');
            root.style.setProperty('--bg-red-soft', 'rgba(239, 68, 68, 0.1)');
            root.style.setProperty('--red-color', '#ef4444');
            root.style.setProperty('--active-bg', 'rgba(102, 126, 234, 0.1)');
        } else {
            root.style.setProperty('--bg-app', '#f0f2f5');
            root.style.setProperty('--bg-panel', '#ffffff');
            root.style.setProperty('--bg-main', '#ffffff');
            root.style.setProperty('--bg-light', '#f8f9fa');
            root.style.setProperty('--bg-selected', '#e9ecef');
            root.style.setProperty('--border-color', '#dee2e6');
            root.style.setProperty('--text-main', '#1c1e21');
            root.style.setProperty('--text-secondary', '#65676b');
            root.style.setProperty('--text-muted', '#8d949e');
            root.style.setProperty('--primary', '#007bff');
            root.style.setProperty('--primary-light', 'rgba(0, 123, 255, 0.1)');
            root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.05)');
            root.style.setProperty('--shadow-primary', 'rgba(0, 123, 255, 0.3)');
            root.style.setProperty('--bg-primary-soft', 'rgba(0, 123, 255, 0.05)');
            root.style.setProperty('--border-primary-soft', 'rgba(0, 123, 255, 0.1)');
            root.style.setProperty('--bg-green-soft', 'rgba(40, 167, 69, 0.1)');
            root.style.setProperty('--green-color', '#28a745');
            root.style.setProperty('--bg-red-soft', 'rgba(220, 53, 69, 0.1)');
            root.style.setProperty('--red-color', '#dc3545');
            root.style.setProperty('--active-bg', 'rgba(0, 123, 255, 0.05)');
        }
    }, [darkMode]);

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
        <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-app)', color: 'var(--text-main)', fontFamily: "'Inter', sans-serif" }}>
            {/* Sidebar nav */}
            <div style={{
                width: '240px', flexShrink: 0, background: 'var(--bg-panel)', borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', paddingTop: '20px'
            }}>
                <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '42px', height: '42px', background: 'var(--primary)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 10px var(--shadow-primary)'
                        }}>
                            <Building2 size={24} color="#fff" />
                        </div>
                        <div>
                            <div style={{ color: 'var(--text-main)', fontWeight: '800', fontSize: '15px', tracking: '-0.02em' }}>TechCorp</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700', uppercase: 'true' }}>Management</div>
                        </div>
                    </div>
                </div>

                <div style={{ flex: 1, paddingTop: '16px' }}>
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

                <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => { if (window.confirm('Logout?')) { localStorage.clear(); window.location.href = '/login'; } }}
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', fontWeight: '700', transition: 'all 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--red-color)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                    >
                        <LogOut size={16} /> Logout Access
                    </button>
                </div>
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* Top bar */}
                <div style={{ padding: '16px 28px', background: 'var(--bg-panel)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', tracking: '-0.02em', textTransform: 'uppercase' }}>
                            {navItems.find(i => i.id === activeTab)?.label || 'Console'}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700', margin: '3px 0 0 0', uppercase: 'true' }}>
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <button onClick={loadData} style={{ background: 'var(--bg-app)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.15s' }}>
                            <RefreshCw size={16} />
                        </button>
                        {activeTab === 'projects' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px 20px', fontSize: '12px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', shadow: '0 4px 12px var(--shadow-primary)', textTransform: 'uppercase' }}
                            >
                                <Plus size={16} /> New Asset
                            </button>
                        )}
                    </div>
                </div>

                {/* Tab content */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    {/* ── Overview ── */}
                    {activeTab === 'overview' && (
                        <div style={{ padding: '28px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
                            {/* Stats */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
                                {[
                                    { label: 'Active Projects', value: stats.totalProjects, icon: <Layers size={20} />, color: 'var(--primary)' },
                                    { label: 'Pending Tasks', value: stats.activeTasks, icon: <CheckCircle2 size={20} />, color: 'var(--green-color)' },
                                    { label: 'Team Capacity', value: stats.teamCapacity, icon: <Users size={20} />, color: 'var(--accent-amber)' },
                                    { label: 'Security Alerts', value: stats.upcomingDeadlines, icon: <Clock size={20} />, color: 'var(--red-color)' },
                                ].map((s, i) => (
                                    <div key={i} style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px', position: 'relative', overflow: 'hidden', shadow: 'var(--shadow)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase', tracking: '0.05em' }}>{s.label}</div>
                                                <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-main)' }}>{s.value}</div>
                                            </div>
                                            <div style={{ background: `${s.color}10`, padding: '10px', borderRadius: '10px', color: s.color }}>{s.icon}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Recent Activity */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase', tracking: '0.02em' }}>Recent Assets</h3>
                                    {projects.slice(0, 4).map(p => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-color)' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(p.status), flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase', fontWeight: '600' }}>{p.status?.replace('_', ' ')}</div>
                                            </div>
                                        </div>
                                    ))}
                                    {projects.length === 0 && <div style={{ color: '#616061', fontSize: '13px', textAlign: 'center', padding: '40px' }}>Empty repository</div>}
                                </div>

                                <div style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '24px' }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '15px', fontWeight: '900', color: 'var(--text-main)', textTransform: 'uppercase', tracking: '0.02em' }}>Security Team</h3>
                                    {teamUsers.slice(0, 5).map(u => (
                                        <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                                            onClick={() => handleStartChatWithUser(u.id)}>
                                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-light)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: '800', fontSize: '14px', flexShrink: 0 }}>
                                                {u.firstName?.charAt(0)}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '700' }}>{u.firstName} {u.lastName}</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>{u.role}</div>
                                            </div>
                                            <div style={{ background: 'var(--primary-light)', padding: '6px', borderRadius: '6px' }}>
                                                <MessageSquare size={14} color="var(--primary)" />
                                            </div>
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
                        <div style={{ padding: '28px', overflowY: 'auto', height: '100%', background: 'var(--bg-app)' }}>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '100px', color: 'var(--text-secondary)' }}>
                                    <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                    <p className="font-bold text-xs uppercase tracking-widest">Scanning Repository...</p>
                                </div>
                            ) : (
                                <>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                                        {projects.map(project => (
                                            <div key={project.id} style={{
                                                background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-color)', padding: '24px', transition: 'all 0.2s', cursor: 'pointer', shadow: 'var(--shadow)'
                                            }}
                                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '18px' }}>
                                                    <span style={{ background: `${getStatusColor(project.status)}15`, color: getStatusColor(project.status), fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', padding: '5px 12px', borderRadius: '6px', tracking: '0.05em' }}>
                                                        {project.status?.replace('_', ' ')}
                                                    </span>
                                                    <button style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                                                </div>
                                                <h3 style={{ fontSize: '17px', fontWeight: '900', marginBottom: '10px', color: 'var(--text-main)' }}>{project.name}</h3>
                                                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', height: '40px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: '1.5' }}>
                                                    {project.description || 'Enterprise grade initiative with designated oversight and security protocols.'}
                                                </p>
                                                <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '700', marginBottom: '20px', textTransform: 'uppercase' }}>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14} color="var(--primary)" /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Unscheduled'}</span>
                                                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} color="var(--primary)" /> Team Assigned</span>
                                                </div>
                                                <div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>
                                                        <span>Sync Status</span><span style={{ color: 'var(--text-main)' }}>82%</span>
                                                    </div>
                                                    <div style={{ height: '6px', background: 'var(--bg-light)', borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                                                        <div style={{ width: '82%', height: '100%', background: 'var(--primary)', borderRadius: '10px', transition: 'width 1s ease-in-out' }} />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {projects.length === 0 && (
                                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'var(--bg-panel)', borderRadius: '24px', border: '2px dashed var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <div style={{ width: '80px', height: '80px', background: 'var(--bg-light)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                                                    <Briefcase size={32} style={{ color: 'var(--border-color)' }} />
                                                </div>
                                                <h3 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '20px', fontWeight: '900' }}>Active Assets: 0</h3>
                                                <p style={{ color: 'var(--text-secondary)', marginBottom: '28px', maxWidth: '300px', fontSize: '14px' }}>Deployment repository is currently empty. Initialize a new project to start managing resources.</p>
                                                <button onClick={() => setShowCreateModal(true)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 32px', fontWeight: '900', cursor: 'pointer', shadow: 'var(--shadow-primary)', textTransform: 'uppercase', fontSize: '12px' }}>
                                                    Initialize Project
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
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(26,29,33,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, backdropFilter: 'blur(8px)' }}>
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
                        style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)', borderRadius: '24px', padding: '40px', width: '100%', maxWidth: '440px', shadow: 'var(--shadow)' }}
                    >
                        <div style={{ width: '48px', height: '48px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <Layers size={24} color="var(--primary)" />
                        </div>
                        <h2 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '8px', color: 'var(--text-main)', textTransform: 'uppercase', tracking: '-0.02em' }}>Initialize Asset</h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '32px' }}>Define project parameters and security classifications.</p>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase' }}>Identification</label>
                                <input name="name" type="text" required placeholder="Project Name" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', color: 'var(--text-main)', outline: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase' }}>Scope Analysis</label>
                                <textarea name="description" rows="3" placeholder="Core objectives..." style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', color: 'var(--text-main)', outline: 'none', resize: 'none', fontSize: '14px', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '11px', marginBottom: '8px', fontWeight: '800', textTransform: 'uppercase' }}>Classification Level</label>
                                <select name="securityLevel" style={{ width: '100%', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '14px', color: 'var(--text-main)', outline: 'none', fontSize: '14px' }}>
                                    <option value="1">L1: Standard Tier</option>
                                    <option value="2">L2: Restricted Access</option>
                                    <option value="3">L3: Confidential Stream</option>
                                    <option value="4">L4: Secret Protocol</option>
                                    <option value="5">L5: Top Secret / Sovereign</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" onClick={() => setShowCreateModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontWeight: '800', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>Cancel</button>
                                <button type="submit" style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: '800', cursor: 'pointer', fontSize: '12px', textTransform: 'uppercase' }}>Authorize</button>
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
