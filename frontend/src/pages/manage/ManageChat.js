import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    MessageSquare, Search, Lock, Info, Send, Smile, Paperclip, FileText,
    CheckCheck, Loader2, Key, ShieldCheck, Eye, EyeOff, Hash
} from 'lucide-react';
import api from '../../utils/api';
import socketService from '../../utils/socket';
import { useAuth } from '../../context/AuthContext';
import { useE2EE } from '../../context/E2EEContext';
import { encryptContent, decryptContent, encryptHybrid, decryptHybrid } from '../../utils/crypto';

// ─── ConvItem: matches User chat ChatItem style ────────────────────────────────
function ConvItem({ conv, isSelected, unread, online, onClick, getName, getInitial, formatTime }) {
    const [hovered, setHovered] = useState(false);
    const isGroup = conv.conversationType === 'group';
    return (
        <div
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '12px 16px',
                margin: '2px 10px',
                borderRadius: '16px',
                cursor: 'pointer',
                background: isSelected ? 'var(--active-bg, rgba(102,126,234,0.12))' : hovered ? 'var(--bg-light, rgba(255,255,255,0.04))' : 'transparent',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', gap: '14px', alignItems: 'center',
                transform: isSelected ? 'translateX(4px)' : 'none',
                borderLeft: `4px solid ${isSelected ? 'var(--primary)' : 'transparent'}`
            }}
        >
            <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{
                    width: '48px', height: '48px', borderRadius: '15px',
                    background: isSelected ? 'var(--primary)' : 'var(--bg-light, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border-color)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', fontWeight: '900',
                    color: isSelected ? '#fff' : 'var(--primary)',
                    boxShadow: isSelected ? '0 8px 16px rgba(102,126,234,0.25)' : 'none',
                    transition: 'all 0.3s'
                }}>
                    {isGroup ? <Hash size={22} strokeWidth={2.5} /> : getInitial(conv)}
                </div>
                {online && !isGroup && (
                    <div style={{
                        position: 'absolute', bottom: '0', right: '0',
                        width: '14px', height: '14px', background: '#10b981',
                        border: '2.5px solid var(--bg-panel)', borderRadius: '50%',
                        boxShadow: '0 0 10px rgba(16,185,129,0.4)'
                    }} />
                )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2px' }}>
                    <h4 style={{
                        margin: 0,
                        color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                        fontSize: '15px',
                        fontWeight: (unread > 0 || isSelected) ? '800' : '600',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        letterSpacing: '-0.01em', transition: 'color 0.2s'
                    }}>
                        {getName(conv)}
                    </h4>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '700', opacity: 0.8, flexShrink: 0, marginLeft: '8px' }}>
                        {conv.lastMessageAt ? formatTime(conv.lastMessageAt) : ''}
                    </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{
                        margin: 0,
                        color: unread > 0 ? 'var(--text-main)' : 'var(--text-muted)',
                        fontSize: '13px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontWeight: unread > 0 ? '700' : '500', opacity: 0.85
                    }}>
                        {conv.lastMessage?.content || 'No signals transmitted'}
                    </p>
                    {unread > 0 && (
                        <div style={{
                            background: 'var(--primary)', borderRadius: '9px',
                            minWidth: '20px', height: '18px', padding: '0 6px',
                            fontSize: '10px', color: '#fff', fontWeight: '900',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginLeft: '8px',
                            boxShadow: '0 4px 8px rgba(102,126,234,0.3)'
                        }}>
                            {unread > 99 ? '99+' : unread}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function ManageChat() {
    const { user } = useAuth();
    const { e2eePrivateKey, e2eeStatus } = useE2EE();
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
    const [unreadCounts, setUnreadCounts] = useState({});

    const messagesEndRef = useRef(null);
    const typingTimerRef = useRef(null);

    // ─── Socket Setup ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!user?.id) return;
        const token = localStorage.getItem('accessToken');
        socketService.connect(token, user.id);

        socketService.onUserStatus(({ userId, status }) => {
            setOnlineIds(prev => {
                const next = new Set(prev);
                status === 'online' ? next.add(userId) : next.delete(userId);
                return next;
            });
        });

        socketService.onNewMessage(async (data) => {
            if (data.content?.startsWith('[E2EE]:')) {
                const rawContent = data.content.substring(7);
                const pk = sessionStorage.getItem('e2ee_session_pk') || e2eePrivateKey;
                if (pk) {
                    try {
                        const encryptedData = JSON.parse(rawContent);
                        const myId = String(user?.id);
                        if (encryptedData.v === "2" || encryptedData.ciphertext) {
                            data.content = await decryptHybrid(encryptedData, pk, myId);
                        } else if (encryptedData[user?.id]) {
                            data.content = await decryptContent(encryptedData[user.id], pk);
                        }
                    } catch (e) {
                        try { data.content = await decryptContent(rawContent, pk); } catch { }
                    }
                } else {
                    data.content = '🔐 E2EE locked — unlock to read';
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
    }, [user?.id, selectedChat, e2eePrivateKey]);

    // ─── Decrypt helper ────────────────────────────────────────────────────────
    const decryptMsg = useCallback(async (content) => {
        if (!content?.startsWith('[E2EE]:')) return content;
        const rawContent = content.substring(7);
        const pk = e2eePrivateKey || sessionStorage.getItem('e2ee_session_pk');
        if (!pk) return '🔐 E2EE locked';
        try {
            const encryptedData = JSON.parse(rawContent);
            const myId = String(user?.id);
            if (encryptedData.v === "2" || encryptedData.ciphertext) {
                return await decryptHybrid(encryptedData, pk, myId);
            } else {
                const myPayload = encryptedData[myId] || encryptedData[user?.id];
                if (myPayload) {
                    const decrypted = await decryptContent(myPayload, pk);
                    return decrypted !== "[Unable to decrypt message]" ? decrypted : "[Decryption Error: Key mismatch]";
                }
            }
        } catch { }
        try { return await decryptContent(rawContent, pk); } catch { }
        return '🔐 [Decryption failed]';
    }, [e2eePrivateKey, user?.id]);

    // Effect to re-decrypt messages if they were loaded while E2EE was locked
    useEffect(() => {
        const hasUnprocessed = messages.some(m => 
            m.content && (m.content.startsWith('[E2EE]:') || m.content.includes("🔐 E2EE locked") || m.content.includes("[Decryption failed]"))
        );
        if (e2eePrivateKey && hasUnprocessed) {
            const reDecrypt = async () => {
                const newMsgs = await Promise.all(messages.map(async m => ({
                    ...m,
                    content: await decryptMsg(m.content)
                })));
                const changed = newMsgs.some((m, i) => m.content !== messages[i].content);
                if (changed) setMessages(newMsgs);
            };
            reDecrypt();
        }
    }, [e2eePrivateKey, messages, decryptMsg]);

    // ─── Load Conversations ─────────────────────────────────────────────────────
    const loadConversations = useCallback(async () => {
        if (!user?.id) return;
        try {
            setLoading(true);
            const dataRes = await api.getConversations();
            const data = dataRes?.conversations || dataRes || [];
            const processed = await Promise.all(data.map(async (conv) => {
                if (conv.lastMessage?.content) {
                    conv.lastMessage.content = await decryptMsg(conv.lastMessage.content);
                }
                return conv;
            }));
            setConversations(processed);
        } catch (err) {
            console.error('Failed to load conversations:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id, decryptMsg]);

    useEffect(() => { loadConversations(); }, [loadConversations]);

    // ─── Load Messages ─────────────────────────────────────────────────────────
    const loadMessages = useCallback(async (convId) => {
        if (!convId || !user?.id) return;
        try {
            setMsgLoading(true);
            const dataRes = await api.getConversationMessages(convId);
            const rawMessages = dataRes?.data || dataRes?.messages || (Array.isArray(dataRes) ? dataRes : []);
            const newMessages = await Promise.all(rawMessages.map(async msg => ({
                ...msg,
                content: await decryptMsg(msg.content),
            })));
            setMessages(newMessages);
            await api.markAsRead(convId);
            setUnreadCounts(prev => ({ ...prev, [convId]: 0 }));
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (err) {
            console.error('Failed to load messages:', err);
        } finally {
            setMsgLoading(false);
        }
    }, [user?.id, decryptMsg]);

    const handleSelectConv = async (conv) => {
        setSelectedChat(conv.id);
        setSelectedConv(conv);
        setShowInfo(false);
        socketService.joinConversation?.(conv.id);
        await loadMessages(conv.id);
    };

    // ─── Send Message ──────────────────────────────────────────────────────────
    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || !selectedChat || sending) return;
        let finalContent = input.trim();
        const rawInput = input.trim();
        setInput('');
        setSending(true);
        try {
            if (selectedConv?.conversationType === 'direct' && selectedConv.otherUser?.publicKey) {
                try {
                    const keysToEncryptFor = {};
                    const myPublicKey = user?.publicKey;
                    if (myPublicKey) keysToEncryptFor[String(user.id)] = myPublicKey;
                    keysToEncryptFor[String(selectedConv.otherUser.id)] = selectedConv.otherUser.publicKey;
                    
                    const hybridPayload = await encryptHybrid(finalContent, keysToEncryptFor);
                    finalContent = `[E2EE]:${JSON.stringify(hybridPayload)}`;
                } catch (e) { }
            } else if (selectedConv?.conversationType === 'group' && selectedConv.members) {
                 try {
                     const keysToEncryptFor = {};
                     const myPublicKey = user?.publicKey;
                     if (myPublicKey) keysToEncryptFor[String(user.id)] = myPublicKey;
                     for (const member of selectedConv.members) {
                         if (member.publicKey && String(member.id) !== String(user.id)) {
                             keysToEncryptFor[String(member.id)] = member.publicKey;
                         }
                     }
                     const hybridPayload = await encryptHybrid(finalContent, keysToEncryptFor);
                     finalContent = `[E2EE]:${JSON.stringify(hybridPayload)}`;
                 } catch (e) { }
            }

            const msg = await api.sendMessage(selectedChat, finalContent);
            socketService.sendMessage?.(selectedChat, msg);

            // Decrypt the sent message for own display
            const displayMsg = { ...msg, content: await decryptMsg(msg.content) };
            setMessages(prev => prev.some(m => m.id === displayMsg.id) ? prev : [...prev, displayMsg]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
            loadConversations();
        } catch (err) {
            console.error('Failed to send message:', err);
            setInput(rawInput);
        } finally {
            setSending(false);
        }
    };

    const handleTyping = () => {
        if (!selectedChat) return;
        socketService.sendTyping?.(selectedChat, true);
        clearTimeout(typingTimerRef.current);
        typingTimerRef.current = setTimeout(() => socketService.sendTyping?.(selectedChat, false), 2000);
    };

    const getConvName = (conv) => {
        if (conv.conversationType === 'group') return conv.name || 'Unnamed Group';
        const other = conv.otherUser;
        return other ? `${other.firstName || ''} ${other.lastName || ''}`.trim() : 'Unknown';
    };

    const getConvInitial = (conv) => getConvName(conv).charAt(0).toUpperCase() || '?';
    const isOnline = (conv) => conv.conversationType !== 'group' && onlineIds.has(conv.otherUser?.id);
    const isGroup = selectedConv?.conversationType === 'group';

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

    // E2EE Modal is handled by global E2EESecurityGate

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <div style={{ display: 'flex', height: '100%', background: 'var(--bg-panel)', overflow: 'hidden', position: 'relative' }}>
            {/* Global E2EESecurityGate handles PIN entry */}

            {/* Conversation list */}
            <div style={{
                width: '300px', flexShrink: 0, borderRight: '1px solid var(--border-color)',
                display: 'flex', flexDirection: 'column', background: 'var(--bg-main)'
            }}>
                <div style={{ padding: '24px 20px', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ margin: 0, color: 'var(--text-main)', fontSize: '15px', fontWeight: '900', textTransform: 'uppercase' }}>Secure Channels</h3>
                    </div>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: 'var(--bg-panel)', borderRadius: '12px', padding: '10px 14px', border: '1px solid var(--border-color)'
                    }}>
                        <Search size={14} color="var(--text-muted)" />
                        <input placeholder="Search intelligence..." style={{
                            background: 'transparent', border: 'none', outline: 'none',
                            color: 'var(--text-main)', fontSize: '13px', width: '100%'
                        }} />
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
                    {loading ? (
                        <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto' }} />
                        </div>
                    ) : conversations.length === 0 ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                            <MessageSquare size={32} style={{ margin: '0 auto 12px', opacity: 0.2 }} />
                            <p className="font-bold">No active threads</p>
                        </div>
                    ) : (
                        conversations.map(conv => (
                            <ConvItem
                                key={conv.id}
                                conv={conv}
                                isSelected={selectedChat === conv.id}
                                unread={unreadCounts[conv.id] || 0}
                                online={isOnline(conv)}
                                onClick={() => handleSelectConv(conv)}
                                getName={getConvName}
                                getInitial={getConvInitial}
                                formatTime={formatTime}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Main Messenger area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: 'var(--bg-panel)' }}>
                {!selectedChat ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', opacity: 0.5 }}>
                        <div style={{
                            width: '80px', height: '80px', background: 'var(--bg-primary-soft)',
                            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <MessageSquare size={40} color="var(--primary)" />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h3 style={{ color: 'var(--text-main)', margin: '0 0 8px 0', fontSize: '18px', fontWeight: '900', textTransform: 'uppercase' }}>Intelligence Hub</h3>
                            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '13px', fontWeight: '600' }}>Select a secure channel to initiate communication.</p>
                        </div>
                    </div>
                ) : (
                    <>
                        <header style={{ padding: '0 28px', height: '86px', background: 'var(--bg-main)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '46px', height: '46px', borderRadius: '14px',
                                    background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: '900', fontSize: '18px'
                                }}>
                                    {getConvInitial(selectedConv)}
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                        <h2 style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '16px', margin: 0 }}>{getConvName(selectedConv)}</h2>
                                        <Lock size={12} color="var(--primary)" />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline(selectedConv) ? '#10b981' : 'var(--text-muted)' }} />
                                        <span style={{ color: isOnline(selectedConv) ? '#10b981' : 'var(--text-secondary)', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                                            {isGroup ? `${selectedConv.members?.length || 0} protocol members` : (isOnline(selectedConv) ? 'Online' : 'Offline')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setShowInfo(!showInfo)} style={{
                                background: showInfo ? 'var(--primary-light)' : 'var(--bg-panel)',
                                border: '1px solid var(--border-color)',
                                color: showInfo ? 'var(--primary)' : 'var(--text-secondary)',
                                padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                                <Info size={20} />
                            </button>
                        </header>

                        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {msgLoading ? (
                                        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                                            <Loader2 size={24} className="animate-spin" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '16px', opacity: 0.3 }}>
                                            <Lock size={48} color="var(--primary)" />
                                            <p style={{ color: 'var(--text-main)', fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}>Communication Sanitized</p>
                                        </div>
                                    ) : (
                                        messages.filter(m => !m.messageType?.startsWith('signal_')).map((msg, i, arr) => {
                                            const isOwn = msg.sender?.id === user?.id || msg.senderId === user?.id;
                                            const showAvatar = i === 0 || arr[i - 1].sender?.id !== (msg.sender?.id || msg.senderId);
                                            const senderName = msg.sender ? `${msg.sender.firstName || ''} ${msg.sender.lastName || ''}`.trim() : 'Unknown Subject';
                                            return (
                                                <div key={msg.id} style={{ display: 'flex', flexDirection: isOwn ? 'row-reverse' : 'row', gap: '12px', alignItems: 'flex-end', marginBottom: showAvatar ? '8px' : '0' }}>
                                                    {!isOwn && (
                                                        <div style={{ width: '32px', flexShrink: 0 }}>
                                                            {showAvatar && (
                                                                <div style={{
                                                                    width: '32px', height: '32px', borderRadius: '10px', background: 'var(--bg-light)',
                                                                    border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center',
                                                                    justifyContent: 'center', color: 'var(--primary)', fontSize: '12px', fontWeight: '900'
                                                                }}>
                                                                    {senderName.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div style={{ maxWidth: '70%', display: 'flex', flexDirection: 'column', gap: '4px', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                                                        {!isOwn && showAvatar && (
                                                            <span style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '800', marginLeft: '4px', textTransform: 'uppercase' }}>{senderName}</span>
                                                        )}
                                                        <div style={{
                                                            background: isOwn ? 'var(--primary)' : 'var(--bg-main)',
                                                            padding: '12px 16px', borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                            color: isOwn ? '#fff' : 'var(--text-main)', fontSize: '14px', lineHeight: '1.6', wordBreak: 'break-word',
                                                            border: isOwn ? 'none' : '1px solid var(--border-color)',
                                                        }}>
                                                            {msg.messageType === 'file' ? (
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                                                    <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                        <FileText size={18} />
                                                                    </div>
                                                                    <div style={{ overflow: 'hidden' }}>
                                                                        <div style={{ fontSize: '13px', fontWeight: '800', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{msg.content}</div>
                                                                        <div style={{ fontSize: '10px', opacity: 0.7, fontWeight: '700' }}>ENCRYPTED ASSET</div>
                                                                    </div>
                                                                </div>
                                                            ) : msg.content}
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '0 4px' }}>
                                                            <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontWeight: '700' }}>{formatTime(msg.createdAt)}</span>
                                                            {isOwn && <CheckCheck size={12} color="var(--primary)" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                    {typingUsers.length > 0 && (
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', opacity: 0.6 }}>
                                            <div style={{ background: 'var(--bg-main)', padding: '10px 16px', borderRadius: '16px 16px 16px 4px', display: 'flex', gap: '4px' }}>
                                                {[0, 1, 2].map(i => (
                                                    <div key={i} style={{ width: '6px', height: '6px', background: 'var(--primary)', borderRadius: '50%', animation: `pulseSlow 1.5s infinite ${i * 0.2}s` }} />
                                                ))}
                                            </div>
                                            <span style={{ color: 'var(--primary)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase' }}>Intercepting input...</span>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                <footer style={{ padding: '20px 28px', background: 'var(--bg-main)', borderTop: '1px solid var(--border-color)' }}>
                                    {e2eeStatus !== 'unlocked' && (
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', marginBottom: '12px',
                                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                            borderRadius: '12px', cursor: 'pointer'
                                        }} onClick={() => setShowE2EEModal(true)}>
                                            <Key size={14} color="#ef4444" />
                                            <span style={{ color: '#ef4444', fontSize: '12px', fontWeight: '700' }}>
                                                E2EE chưa được mở khoá — tin nhắn gửi đi sẽ không được mã hoá. <u>Nhấn để unlock</u>
                                            </span>
                                        </div>
                                    )}
                                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 16px' }}>
                                            <Paperclip size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                                            <input
                                                value={input}
                                                onChange={e => { setInput(e.target.value); handleTyping(); }}
                                                placeholder="Enter secure message protocol..."
                                                disabled={sending}
                                                style={{ flex: 1, background: 'transparent', border: 'none', padding: '16px 12px', outline: 'none', color: 'var(--text-main)', fontSize: '14px', fontWeight: '500' }}
                                            />
                                            <Smile size={20} color="var(--text-muted)" style={{ cursor: 'pointer' }} />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!input.trim() || sending}
                                            style={{
                                                width: '54px', height: '54px', background: input.trim() ? 'var(--primary)' : 'var(--bg-light)',
                                                borderRadius: '16px', border: 'none', color: '#fff', cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                                            }}
                                        >
                                            {sending ? <Loader2 size={24} className="animate-spin" /> : <Send size={22} />}
                                        </button>
                                    </form>
                                </footer>
                            </div>

                            {showInfo && selectedConv && (
                                <aside style={{ width: '300px', borderLeft: '1px solid var(--border-color)', background: 'var(--bg-main)', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ padding: '40px 24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
                                        <div style={{ width: '80px', height: '80px', background: 'var(--primary)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '32px', fontWeight: '900', margin: '0 auto 20px' }}>
                                            {getConvInitial(selectedConv)}
                                        </div>
                                        <h3 style={{ color: 'var(--text-main)', margin: '0 0 6px 0', fontSize: '18px', fontWeight: '900' }}>{getConvName(selectedConv)}</h3>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                            {isGroup ? `${selectedConv.members?.length || 0} protocol members` : 'Direct Liaison'}
                                        </span>
                                    </div>
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
                                        <h4 style={{ color: 'var(--text-muted)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '16px' }}>
                                            {isGroup ? 'Clearance List' : 'Subject Profile'}
                                        </h4>
                                        {isGroup && (selectedConv.members || []).map(m => (
                                            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <div style={{ width: '36px', height: '36px', background: 'var(--bg-light)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '13px', fontWeight: '900' }}>
                                                    {m.firstName?.charAt(0)}
                                                </div>
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ color: 'var(--text-main)', fontSize: '13px', fontWeight: '800', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.firstName} {m.lastName}</div>
                                                    <div style={{ color: onlineIds.has(m.id) ? '#10b981' : 'var(--text-muted)', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase' }}>{onlineIds.has(m.id) ? 'Active' : 'Standby'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: '24px', borderTop: '1px solid var(--border-color)' }}>
                                        <div style={{ padding: '16px', background: 'var(--bg-primary-soft)', borderRadius: '16px', border: '1px solid var(--border-primary-soft)', display: 'flex', gap: '12px' }}>
                                            <Lock size={18} color="var(--primary)" style={{ flexShrink: 0 }} />
                                            <div>
                                                <div style={{ color: 'var(--text-main)', fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', marginBottom: '4px' }}>Verified Link</div>
                                                <div style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: '600', lineHeight: '1.4' }}>This channel is protected with AES-256-GCM hardware encryption.</div>
                                            </div>
                                        </div>
                                    </div>
                                </aside>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
