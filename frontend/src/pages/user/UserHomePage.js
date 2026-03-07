import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, MessageSquare, MoreHorizontal, Phone, Video, Info, Lock, Send, Mic, Image, Paperclip, Smile, Settings, Bell, BellOff, Clock, Shield, LogOut, ChevronLeft, ChevronRight, User, File, Download, Trash2, ShieldCheck, CreditCard, HelpCircle, Key, Eye, EyeOff, Check, CheckCheck, Square, X, Forward, Reply, Edit2, Play, Pause, List, Pin, Star, Cloud, Heart, ChevronDown, Users, MoreVertical, FileText, Camera, MapPin, AlertTriangle, BarChart3, Folder, Maximize2, Minimize2, Compass, Briefcase, Layers, Building2, Bold, Italic, Link, Code, AtSign, Hash } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { encryptContent, decryptContent, encryptHybrid, decryptHybrid } from "../../utils/crypto";
import { SearchBar, PinnedMessagesBanner, ConversationSidebar, PollModal, StickerPicker } from '../../components/chat/ChatEnhancements';
import { DiscoverContent, MiniAppsContent } from '../../components/chat/ZaloStyleComponents';
import { EnhancedMessageBubble } from '../../components/chat/EnhancedMessage';

import socketService from '../../utils/socket';
import '../../chat.css';

export default function UserHomePage() {
  const { user, isAdmin, isManager, darkMode, toggleDarkMode } = useAuth();

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
      root.style.setProperty('--green-color', '#10b981');
      root.style.setProperty('--accent-amber', '#f59e0b');
      root.style.setProperty('--red-color', '#ef4444');
      root.style.setProperty('--shadow', '0 2px 10px rgba(0,0,0,0.3)');
      root.style.setProperty('--shadow-primary', 'rgba(102, 126, 234, 0.3)');
      root.style.setProperty('--primary-light', 'rgba(102, 126, 234, 0.1)');
      root.style.setProperty('--bg-primary-soft', 'rgba(102, 126, 234, 0.1)');
      root.style.setProperty('--border-primary-soft', 'rgba(102, 126, 234, 0.2)');
      root.style.setProperty('--bg-green-soft', 'rgba(16, 185, 129, 0.1)');
      root.style.setProperty('--bg-red-soft', 'rgba(239, 68, 68, 0.1)');
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
    }
  }, [darkMode]);

  useEffect(() => {
    if (selectedChat) {
      api.markAsRead(selectedChat);
      loadUnreadCount();
      setConversations(prev => prev.map(c =>
        c.id === selectedChat ? { ...c, unreadCount: 0 } : c
      ));
    }
  }, [selectedChat]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && user?.id) {
      const initSocket = async () => {
        await socketService.connect(token, user.id);

        socketService.onNotification(() => {
          loadUnreadCount();
        });

        socketService.onReactionUpdated(({ messageId, reaction, userId }) => {
          setMessages(prev => prev.map(msg => {
            if (msg.id === messageId) {
              const currentReactions = msg.reactions || {};
              const userList = currentReactions[reaction] || [];
              if (!userList.some(u => u.userId === userId)) {
                return {
                  ...msg,
                  reactions: {
                    ...currentReactions,
                    [reaction]: [...userList, { userId }]
                  }
                };
              }
            }
            return msg;
          }));
        });

        socketService.onCallMade(({ offer, conversationId, callerId, type }) => {
          // Use refs or functional updates to avoid dependency issues with socket listeners
          setCallStatus(currentStatus => {
            if (currentStatus === 'idle') {
              setAvailableUsers(currentUsers => {
                const from = currentUsers.find(u => u.id === callerId) || { id: callerId, firstName: 'User' };
                setIncomingCall({ offer, conversationId, from, type });
                return currentUsers;
              });
              startRingtone();
              return 'ringing';
            }
            return currentStatus;
          });
        });

        socketService.onUserStatus(({ userId, status }) => {
          setOnlineUserIds(prev => {
            const next = new Set(prev);
            if (status === 'online') next.add(userId);
            else next.delete(userId);
            return next;
          });
        });

        // Get initial online users
        const initialOnlineUsers = await socketService.getOnlineUsers();
        if (Array.isArray(initialOnlineUsers)) {
          setOnlineUserIds(new Set(initialOnlineUsers));
        }
      };
      initSocket();
    }
    return () => {
      socketService.disconnect();
      stopRingtone();
    };
  }, [user]);

  const [activeTab, setActiveTab] = useState('messages');
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultSort, setVaultSort] = useState('date'); // 'date' or 'name' or 'size'
  const [isVaultLocked, setIsVaultLocked] = useState(true);
  const [showVaultUnlockModal, setShowVaultUnlockModal] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [callStatus, setCallStatus] = useState('idle'); // 'idle', 'ringing', 'connected'
  const [handledCalls, setHandledCalls] = useState(new Set());
  const handledCallsRef = useRef(new Set());
  const videoRef = useRef(null);
  const callVideoRef = useRef(null);
  const canvasRef = useRef(null);
  const timerRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [hiddenChatIds, setHiddenChatIds] = useState(new Set());
  const [selectedSticker, setSelectedSticker] = useState(null);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pinnedChatIds, setPinnedChatIds] = useState(new Set());
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [selectedFileVersionData, setSelectedFileVersionData] = useState(null);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharingFile, setSharingFile] = useState(null);
  const [currentShares, setCurrentShares] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [sharePermission, setSharePermission] = useState('view');
  const [shareTargetUserId, setShareTargetUserId] = useState('');

  // E2EE Key Diagnostics
  useEffect(() => {
    if (user) {
      const privKey = localStorage.getItem(`e2ee_private_key_${user.id}`);
      console.log("[E2EE] Key Status:", {
        userId: user.id,
        hasPrivateKey: !!privKey,
        hasPublicKey: !!user.publicKey,
        pubKeyLen: user.publicKey?.length || 0
      });
    }
  }, [user]);
  const [mutedChatIds, setMutedChatIds] = useState(new Set());
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showSearchInChat, setShowSearchInChat] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatOptionsMenu, setShowChatOptionsMenu] = useState(false);
  const [isCallMaximized, setIsCallMaximized] = useState(true);
  const [onlineUserIds, setOnlineUserIds] = new useState(new Set());
  const [selfDestructTime, setSelfDestructTime] = useState(null); // null, 10, 60, 3600

  const peerConnectionRef = useRef(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callConversationId, setCallConversationId] = useState(null);
  const iceCandidatesQueue = useRef([]);

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const createPeerConnection = (convId) => {
    console.log('[WebRTC] Creating PeerConnection for', convId);
    const pc = new RTCPeerConnection(rtcConfig);

    pc.onicecandidate = (event) => {
      if (event.candidate && convId) {
        console.log('[WebRTC] Sending ICE candidate');
        socketService.sendIceCandidate(convId, event.candidate);
      }
    };

    pc.ontrack = (event) => {
      console.log('[WebRTC] Received remote track', event.streams[0]);
      if (event.streams && event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[WebRTC] ICE Connection State:', pc.iceConnectionState);
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        // Handle failure if needed
      }
    };

    peerConnectionRef.current = pc;

    // Process any queued candidates for this specific conversation
    if (iceCandidatesQueue.current.length > 0) {
      console.log(`[WebRTC] Processing ${iceCandidatesQueue.current.length} queued candidates`);
      iceCandidatesQueue.current.forEach(candidate => {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error('[WebRTC] Error adding queued ICE', e));
      });
      iceCandidatesQueue.current = [];
    }

    return pc;
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'voice_message.webm', { type: 'audio/webm' });

        try {
          setUploading(true);
          const response = await api.uploadFile(audioFile);
          await api.sendMessage(selectedChat, '', 'voice', response.id);
          loadMessages(selectedChat, true);
        } catch (e) {
          console.error(e);
          alert('Failed to send voice message');
        } finally {
          setUploading(false);
        }

        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      alert('Microphone access denied or error. Please check permissions and HTTPS.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (selectedChat) {
      socketService.joinConversation(selectedChat);
      loadMessages(selectedChat);
    }
    return () => {
      if (selectedChat) socketService.leaveConversation(selectedChat);
    };
  }, [selectedChat]);

  useEffect(() => {
    const handleNewMessage = async (message) => {
      if (message.conversationId === selectedChat) {
        const decrypted = await decryptMessage({ ...message });
        setMessages(prev => [...prev, decrypted]);
        // Scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
      // Also update conversation list (last message, unread count)
      loadConversations(true);
    };

    const handleUserTyping = (data) => {
      if (data.conversationId === selectedChat) {
        if (data.isTyping) {
          setTypingUsers(prev => {
            if (prev.find(u => u.id === data.userId)) return prev;
            return [...prev, { id: data.userId }];
          });
        } else {
          setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
        }
      }
    };

    socketService.onNewMessage(handleNewMessage);
    socketService.onUserTyping(handleUserTyping);

    return () => {
      // socket.off happens if implemented in socketService,
      // but for simplicity here we just hope it doesn't double up
    };
  }, [selectedChat]);

  useEffect(() => {
    if (activeTab === 'messages') {
      loadConversations();
    } else if (activeTab === 'vault') {
      loadFiles();
    }
    loadUnreadCount();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'messages' || activeTab === 'contacts') {
      api.getChatUsers().then(users => setAvailableUsers(users)).catch(e => console.error(e));
    }
  }, [activeTab]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    loadConversations();

    // Set up polling for new messages and conversations every 3 seconds
    // Set up polling for new messages and conversations every 4 seconds (fallback)
    const pollInterval = setInterval(() => {
      loadConversations(true);
      if (selectedChat) {
        loadMessages(selectedChat, true);
      }
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };



  // Toggle Audio Track
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !isMuted;
      });
    }
  }, [isMuted, localStream]);

  // Toggle Video Track
  useEffect(() => {
    if (localStream && callType === 'video') {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !isVideoOff;
      });
    }
  }, [isVideoOff, localStream, callType]);

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setConversationsLoading(true);
      const data = await api.getConversations();
      setConversations(data);
      return data;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return [];
    } finally {
      if (!silent) setConversationsLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await api.getNotifications(1, 1);
      setUnreadNotificationsCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to load unread count', err);
    }
  };

  const decryptMessage = async (msg) => {
    if (!msg || !msg.content || !msg.content.startsWith('[E2EE]:')) return msg;
    if (!user?.id) return msg;

    const rawContent = msg.content.substring(7);
    const privateKey = localStorage.getItem(`e2ee_private_key_${user.id}`);

    if (!privateKey) {
      console.warn("[E2EE] Missing private key for user", user.id);
      msg.content = "[E2EE: Thiếu khóa cá nhân]";
      return msg;
    }

    try {
      // Try to parse as JSON (New Dual-Encryption or Hybrid format)
      const encryptedData = JSON.parse(rawContent);
      const myId = String(user.id);

      // 1. Check for Hybrid Format (Version 2)
      if (encryptedData.v === "2" || encryptedData.ciphertext) {
        msg.content = await decryptHybrid(encryptedData, privateKey, myId);
        return msg;
      }

      // 2. Fallback to Legacy Dual-Encryption (Version 1 / RSA-only)
      const myPayload = encryptedData[myId] || encryptedData[user.id];

      if (myPayload) {
        try {
          const decrypted = await decryptContent(myPayload, privateKey);
          if (decrypted !== "[Unable to decrypt message]") {
            msg.content = decrypted;
          } else {
            console.error("[E2EE] RSA Decryption failed for msg:", msg.id);
            msg.content = "[Lỗi giải mã: Khóa không khớp]";
          }
        } catch (decryptErr) {
          console.error("[E2EE] decryptContent threw error:", decryptErr);
          msg.content = "[Lỗi giải mã: Lỗi hệ thống]";
        }
      } else {
        console.warn("[E2EE] No payload for my ID:", myId, "Found keys:", Object.keys(encryptedData));
        msg.content = "[E2EE: Không có mã giải cho bạn]";
      }
    } catch (e) {
      // Not JSON? Fallback (Oldest format: pure ciphertext)
      try {
        console.log("[E2EE] Fallback to legacy decryption format");
        const decrypted = await decryptContent(rawContent, privateKey);
        msg.content = decrypted;
      } catch (decryptErr) {
        console.error("[E2EE] Legacy Decryption failed:", decryptErr);
        msg.content = "[Lỗi giải mã: Format không hợp lệ]";
      }
    }
    return msg;
  };

  const loadMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      const response = await api.getConversationMessages(conversationId);
      const rawMessages = response.data || response || [];

      // E2EE Decryption Logic
      const newMessages = await Promise.all(rawMessages.map(m => decryptMessage({ ...m })));

      // Only update state if data actually changed to prevent UI flicker
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newMessages)) return prev;
        return newMessages;
      });
      return response;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return null;
    } finally {
      if (!silent) setMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (showCallModal && callStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callStatus === 'idle') {
        setCallDuration(0);
        stopStream();
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [showCallModal, callStatus]);

  const stopStream = () => {
    // Stop Local Stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    // Cleanup PeerConnection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    // Clear Remote Stream
    setRemoteStream(null);
    iceCandidatesQueue.current = [];
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')} `;
  };

  const loadFiles = async () => {
    try {
      setFilesLoading(true);
      const data = await api.getFiles();
      setFiles(data || []);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setFilesLoading(false);
    }
  };

  const handleContextMenu = (e, conversation) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      conversation
    });
  };

  const handleDeleteConversation = async (conv) => {
    // If called from Context Menu, conv is the conversation object.
    // If called from Header Button (no args or event), use selectedChat.
    let targetConv = conv;
    if (!targetConv || !targetConv.id) {
      targetConv = conversations.find(c => c.id === selectedChat);
    }

    if (!targetConv) return;

    if (!window.confirm(`Are you sure you want to delete this conversation with ${getConversationName(targetConv)}?`)) {
      setContextMenu(null);
      return;
    }

    try {
      await api.deleteConversation(targetConv.id);
      setConversations(prev => prev.filter(c => c.id !== targetConv.id));
      if (selectedChat === targetConv.id) setSelectedChat(null);
      setContextMenu(null);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation');
      setContextMenu(null);
    }
  };

  // Close context menu on click
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      alert('Failed to delete file');
    }
  };

  const handleViewVersions = async (fileId) => {
    try {
      setLoadingVersions(true);
      setShowVersionModal(true);
      const data = await api.getFileVersions(fileId);
      setSelectedFileVersionData(data);
    } catch (error) {
      console.error('Failed to load version history:', error);
      alert('Error fetching version history');
      setShowVersionModal(false);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleRestoreVersion = async (fileId, versionNumber) => {
    if (!window.confirm(`Restore file to Version ${versionNumber}? Current state will be saved as a new version.`)) return;
    try {
      await api.restoreFileVersion(fileId, versionNumber);
      alert('File restored successfully');
      loadFiles();
      setShowVersionModal(false);
    } catch (error) {
      alert('Failed to restore version');
    }
  };

  const handleDeleteVersion = async (fileId, versionNumber) => {
    if (!window.confirm(`Delete version snapshot v${versionNumber}? This action cannot be undone.`)) return;
    try {
      await api.deleteFileVersion(fileId, versionNumber);
      // Refresh
      const data = await api.getFileVersions(fileId);
      setSelectedFileVersionData(data);
    } catch (error) {
      alert('Failed to delete version snapshot');
    }
  };

  const handleOpenShare = async (file) => {
    try {
      setSharingFile(file);
      setShowShareModal(true);
      setSharesLoading(true);
      setShareTargetUserId('');
      setSharePermission('view');
      const shares = await api.getFileShares(file.id);
      setCurrentShares(shares);
    } catch (error) {
      console.error('Failed to load shares:', error);
    } finally {
      setSharesLoading(false);
    }
  };

  const handleShareFile = async () => {
    if (!shareTargetUserId) return;
    try {
      await api.shareFile(sharingFile.id, shareTargetUserId, sharePermission);
      alert('File shared successfully');
      // Refresh list
      const shares = await api.getFileShares(sharingFile.id);
      setCurrentShares(shares);
      setShareTargetUserId('');
    } catch (error) {
      alert('Failed to share file: ' + error.message);
    }
  };

  const handleRevokeShare = async (shareId) => {
    if (!window.confirm('Revoke access for this user?')) return;
    try {
      await api.revokeFileShare(sharingFile.id, shareId);
      setCurrentShares(prev => prev.filter(s => s.id !== shareId));
    } catch (error) {
      alert('Failed to revoke access');
    }
  };

  const loadTypingUsers = async (conversationId) => {
    try {
      const users = await api.getTypingUsers(conversationId);
      setTypingUsers(users || []);
    } catch (error) {
      // Silent fail
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socketService.sendTyping(selectedChat, true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.sendTyping(selectedChat, false);
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if ((!messageInput.trim() && !selectedFile) || !selectedChat || sending) return;

    try {
      setSending(true);
      setIsTyping(false);
      api.setTyping(selectedChat, false).catch(() => { });

      // Upload file first if selected via toolbar buttons
      if (selectedFile) {
        try {
          setUploading(true);
          const uploadedFile = await api.uploadFile(selectedFile);
          const fileContent = `Shared a file: ${selectedFile.name} `;
          await api.sendMessage(selectedChat, fileContent, 'file', uploadedFile.id, null, null);
          setSelectedFile(null);
        } catch (fileErr) {
          console.error('File upload failed:', fileErr);
          alert('Không thể tải file: ' + fileErr.message);
        } finally {
          setUploading(false);
        }
      }

      // Send text message if present
      if (messageInput.trim()) {
        if (editingMessage) {
          await api.editMessage(editingMessage.id, messageInput.trim());
          setEditingMessage(null);
        } else {
          let finalContent = messageInput.trim();

          // E2EE Encryption for Direct Chat
          const conv = conversations.find(c => c.id === selectedChat);
          if (conv && conv.conversationType === 'direct' && conv.otherUser?.publicKey) {
            console.log("[E2EE] Encrypting message (Hybrid Mode)...");
            try {
              const myPublicKey = user.publicKey || JSON.parse(localStorage.getItem('user'))?.publicKey;
              const keysToEncryptFor = {
                [conv.otherUser.id]: conv.otherUser.publicKey
              };
              if (myPublicKey) {
                keysToEncryptFor[user.id] = myPublicKey;
              }

              const hybridPayload = await encryptHybrid(finalContent, keysToEncryptFor);
              finalContent = `[E2EE]:${JSON.stringify(hybridPayload)}`;
            } catch (e) {
              console.error("[E2EE] Hybrid Encryption failed. Likely key invalid.", e);
              // Fallback happens to plain text if we don't change finalContent
            }
          }

          await api.sendMessage(
            selectedChat,
            finalContent,
            'text',
            null,
            replyingTo ? replyingTo.id : null,
            selfDestructTime
          );
        }
      }

      setMessageInput('');
      setReplyingTo(null);
      setSelfDestructTime(null);

      // Refresh list
      loadConversations();
      loadMessages(selectedChat, true);

      // Scroll down
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleForwardMessage = async (targetConversationId) => {
    if (!forwardingMessage) return;
    try {
      await api.forwardMessage(forwardingMessage.id, targetConversationId);
      setShowForwardModal(false);
      setForwardingMessage(null);
      if (targetConversationId === selectedChat) {
        loadMessages(selectedChat, true);
      }
      loadConversations(true);
    } catch (error) {
      console.error('Failed to forward:', error);
      alert('Failed to forward message.');
    }
  };



  const handleSelectUser = async (userId) => {
    try {
      console.log('Selecting user for chat:', userId);
      const conversation = await api.getOrCreateDirectConversation(userId);
      setShowNewChatModal(false);

      // Update conversations list immediately if the brand new conversation isn't there yet
      setConversations(prev => {
        const exists = prev.find(c => c.id === conversation.id);
        if (exists) return prev;
        return [conversation, ...prev];
      });

      setSelectedChat(conversation.id);
      if (isMobile) setShowSidebarOnMobile(false);

      // Still load everything to refresh metadata and relations
      await loadConversations();
    } catch (error) {
      console.error('Failed to create conversation:', error);
      alert('Could not start conversation. Please check your connection.');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length === 0) {
      alert('Please enter group name and select at least one member');
      return;
    }

    try {
      const conversation = await api.createGroupConversation(groupName, selectedMembers);
      setShowGroupModal(false);
      setGroupName('');
      setSelectedMembers([]);
      setSelectedChat(conversation.id);
      loadConversations();
    } catch (error) {
      console.error('Failed to create group:', error);
      alert('Failed to create group');
    }
  };

  const toggleMemberSelection = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // If uploading to Vault
    if (activeTab === 'vault') {
      try {
        setUploading(true);
        // If file with same name exists, api.uploadFile will automatically version it on backend
        await api.uploadFile(file);
        alert('File uploaded to vault successfully! Automatic versioning applied if duplicate found.');
        loadFiles();
      } catch (error) {
        console.error('Vault upload failed:', error);
        alert('Failed to upload file to vault: ' + error.message);
      } finally {
        setUploading(false);
        if (e.target) e.target.value = '';
      }
      return;
    }

    if (!selectedChat) return;

    try {
      setUploading(true);
      setShowAttachmentMenu(false);
      const uploadedFile = await api.uploadFile(file);

      const messageContent = `Shared a file: ${file.name} `;
      await api.sendMessage(selectedChat, messageContent, 'file', uploadedFile.id);

      // Refresh
      loadMessages(selectedChat);
      loadConversations(true);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload file: ' + error.message);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = ''; // Reset input
    }
  };

  const shareFromVault = () => {
    loadFiles();
    setShowVaultModal(true);
    setShowAttachmentMenu(false);
  };

  const handleShareVaultFile = async (file) => {
    if (!selectedChat) return;
    try {
      setUploading(true);
      setShowVaultModal(false);

      const messageContent = `Shared a file: ${file.name} `;
      await api.sendMessage(selectedChat, messageContent, 'file', file.id);

      loadMessages(selectedChat);
      loadConversations(true);
    } catch (error) {
      console.error('Failed to share file:', error);
      alert('Failed to share file');
    } finally {
      setUploading(false);
    }
  };

  const handleStartNewChat = async () => {
    try {
      const users = await api.getChatUsers();
      setAvailableUsers(users);
      setShowNewChatModal(true);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const startCamera = async () => {
    try {
      setShowCamera(true);
      setShowAttachmentMenu(false);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera: ' + err.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const capturePhoto = async () => {
    if (!canvasRef.current || !videoRef.current || !selectedChat) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `captured_photo_${Date.now()}.jpg`, { type: 'image/jpeg' });

      stopCamera();
      try {
        setUploading(true);
        // Use FormData directly for better compatibility
        const uploadedFile = await api.uploadFile(blob, `photo_${Date.now()}.jpg`);
        await api.sendMessage(selectedChat, `Shared a photo`, 'file', uploadedFile.id);

        loadMessages(selectedChat, true);
        loadConversations(true);
      } catch (error) {
        console.error('Photo upload/send failed:', error);
        alert('Failed to send photo: ' + (error.message || 'Unknown error'));
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg');
  };

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      const mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
      await api.sendMessage(selectedChat, `Shared location: ${mapLink}`, 'text');
    }, () => {
      alert('Unable to retrieve your location');
    });
    setShowAttachmentMenu(false);
  };

  const ringtoneRef = useRef(null);
  const ringtoneTimeoutRef = useRef(null);

  const startRingtone = () => {
    if (ringtoneRef.current) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playFreq = (freq, time, duration) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.2, time + 0.1);
        gain.gain.setValueAtTime(0.2, time + duration - 0.1);
        gain.gain.linearRampToValueAtTime(0, time + duration);
        osc.start(time);
        osc.stop(time + duration);
      };

      const loop = () => {
        const now = audioCtx.currentTime;
        playFreq(440, now, 0.5);
        playFreq(554, now + 0.2, 0.5);
        ringtoneTimeoutRef.current = setTimeout(loop, 2000);
      };
      loop();
      ringtoneRef.current = audioCtx;
    } catch (e) { console.error('Audio error', e); }
  };

  const stopRingtone = () => {
    if (ringtoneTimeoutRef.current) {
      clearTimeout(ringtoneTimeoutRef.current);
      ringtoneTimeoutRef.current = null;
    }
    if (ringtoneRef.current) {
      try {
        ringtoneRef.current.close();
      } catch (e) { }
      ringtoneRef.current = null;
    }
  };

  const initiateCall = async (type) => {
    if (!selectedChat) {
      alert('Please select a chat first');
      return;
    }
    try {
      console.log(`[Calls] Initiating ${type} call to ${selectedChat}`);
      setCallConversationId(selectedChat);
      setCallType(type);
      setCallStatus('ringing');
      setShowCallModal(true);
      setIsCallMaximized(true);
      startRingtone();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      setLocalStream(stream);

      const pc = createPeerConnection(selectedChat);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketService.sendCallInvite(selectedChat, offer, type);
    } catch (error) {
      console.error('Call initiation error:', error);
      alert('Could not start call: ' + (error.message || 'Unknown error'));
      stopRingtone();
      setCallStatus('idle');
      setCallConversationId(null);
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        setLocalStream(null);
      }
    }
  };

  // Alias for UI buttons
  const handleCall = (type) => initiateCall(type);


  useEffect(() => {
    if (!socketService.socket) return;

    socketService.onCallAnswered(async ({ answer, accepted, conversationId }) => {
      console.log(`[Calls] Call answered: ${accepted}`);
      stopRingtone();
      if (accepted && answer) {
        const pc = peerConnectionRef.current;
        if (pc && pc.signalingState === 'have-local-offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          setCallStatus('connected');
        }
      } else {
        setCallStatus('idle');
        setShowCallModal(false);
        if (localStream) {
          localStream.getTracks().forEach(t => t.stop());
          setLocalStream(null);
        }
      }
    });

    socketService.onCallEnded(() => {
      console.log('[Calls] Signal received: Call ended');
      stopRingtone();
      setCallStatus('idle');
      setShowCallModal(false);
      setCallConversationId(null);
      if (localStream) {
        localStream.getTracks().forEach(t => t.stop());
        setLocalStream(null);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    });

    socketService.onIceCandidate(({ candidate }) => {
      if (peerConnectionRef.current && peerConnectionRef.current.remoteDescription) {
        peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate))
          .catch(e => console.error('[WebRTC] Error adding ICE', e));
      } else {
        console.log('[WebRTC] Queuing ICE candidate');
        iceCandidatesQueue.current.push(candidate);
      }
    });

    return () => {
      if (socketService.socket) {
        socketService.socket.off('call-answered');
        socketService.socket.off('ice-candidate');
        socketService.socket.off('call-ended');
      }
    };
  }, [localStream, callStatus]);

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    const { offer, conversationId, type } = incomingCall;
    stopRingtone();

    try {
      setCallConversationId(conversationId);
      setCallStatus('connected');
      setCallType(type);
      setShowCallModal(true);
      setIsCallMaximized(true);
      setIncomingCall(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      setLocalStream(stream);

      const pc = createPeerConnection(conversationId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      await pc.setRemoteDescription(new RTCSessionDescription(offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socketService.sendCallResponse(conversationId, answer, true);
    } catch (e) {
      console.error(e);
      setCallStatus('idle');
      setShowCallModal(false);
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (hours < 48) {
      return 'Yesterday';
    } else {
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getConversationName = (conv) => {
    if (!conv) return 'Unknown';
    if (conv.conversationType === 'direct') {
      if (conv.otherUser) {
        return `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim() || conv.otherUser.username || 'Direct Chat';
      }
      // Fallback to checking members
      const otherMember = conv.members?.find(m => m.id !== user?.id);
      if (otherMember) {
        return `${otherMember.firstName || ''} ${otherMember.lastName || ''}`.trim() || otherMember.username || 'Direct Chat';
      }
    }
    return conv.name || 'Group Chat';
  };

  const getConversationAvatar = (conv) => {
    if (!conv) return '?';
    if (conv.conversationType === 'direct') {
      const name = getConversationName(conv);
      return name.charAt(0) || '?';
    }
    return 'G';
  };

  const isConversationOnline = (conv) => {
    if (!conv) return false;
    if (conv.conversationType === 'direct') {
      const otherUserId = conv.otherUser?.id || conv.members?.find(m => m.id !== user?.id)?.id;
      return onlineUserIds.has(otherUserId);
    }
    return true; // Groups are "online" if you can reach them, or add group presence logic later
  };

  const selectedConversation = React.useMemo(() => {
    return conversations.find(c => c.id === selectedChat);
  }, [conversations, selectedChat]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--bg-app)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: '64px',
        background: 'var(--bg-main)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        zIndex: 100,
        boxShadow: 'var(--shadow)',
        overflowY: 'auto',
        overflowX: 'hidden'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          <Shield size={28} color="#fff" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', flex: 1 }}>
          <NavIcon
            icon={<MessageSquare size={22} />}
            active={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
            label="Messages"
          />
          <NavIcon
            icon={<Users size={22} />}
            active={activeTab === 'contacts' || activeTab === 'team'}
            onClick={() => setActiveTab('contacts')}
            label="Contacts"
          />
          <NavIcon
            icon={<Briefcase size={22} />}
            active={activeTab === 'projects'}
            onClick={() => setActiveTab('projects')}
            label="Projects"
          />
          {(isManager || isAdmin) && (
            <NavIcon
              icon={<BarChart3 size={22} />}
              active={activeTab === 'team'}
              onClick={() => setActiveTab('team')}
              label="Team Management"
            />
          )}
          <NavIcon
            icon={<Compass size={22} />}
            active={activeTab === 'discover'}
            onClick={() => setActiveTab('discover')}
            label="Discover"
          />
          <NavIcon
            icon={<Phone size={22} />}
            active={activeTab === 'calls'}
            onClick={() => setActiveTab('calls')}
            label="Calls"
          />
          <NavIcon
            icon={<Shield size={22} />}
            active={activeTab === 'vault'}
            onClick={() => {
              if (isVaultLocked) {
                setShowVaultUnlockModal(true);
              } else {
                setActiveTab('vault');
              }
            }}
            label="Vault"
          />
          <NavIcon
            icon={<Bell size={22} />}
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
            label="Alerts"
            badge={unreadNotificationsCount}
          />
          <NavIcon
            icon={<Settings size={22} />}
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            label="Settings"
          />
        </div>

        {/* Bottom: Avatar + Logout */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', padding: '12px 0', borderTop: '1px solid var(--border-color)', marginTop: '4px', flexShrink: 0 }}>
          <div
            title={`${user?.firstName} ${user?.lastName} \n${user?.email}`}
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--primary)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '15px',
              fontWeight: '900',
              color: '#fff',
              boxShadow: '0 2px 8px rgba(0,123,255,0.25)',
              flexShrink: 0
            }}
          >
            {user?.firstName?.charAt(0) || '?'}
          </div>

          <div
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                localStorage.clear();
                window.location.href = '/login';
              }
            }}
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--bg-red-soft)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0
            }}
            title="Logout"
          >
            <LogOut size={18} color="var(--red-color)" />
          </div>
        </div>
      </div>

      {/* CHAT LIST PANEL (Sidebar) */}
      {activeTab === 'messages' && (
        <div style={{
          width: isMobile ? '100%' : '280px',
          display: (isMobile && !showSidebarOnMobile) ? 'none' : 'flex',
          background: 'var(--bg-panel)',
          borderRight: '1px solid var(--border-color)',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          {/* Workspace Header */}
          <div style={{
            padding: '24px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'var(--primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Building2 size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, color: 'var(--text-main)', fontSize: '18px', fontWeight: '800' }}>TechCorp</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--green-color)' }}></div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{onlineUserIds.size} Online</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 0' }}>
            {/* CHANNELS SECTION */}
            <div style={{ padding: '20px 20px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Channels</span>
                <button onClick={() => setShowGroupModal(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {conversations
                  .filter(c => c.conversationType === 'group')
                  .map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: selectedChat === conv.id ? 'var(--bg-selected)' : 'transparent',
                        color: selectedChat === conv.id ? 'var(--primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: selectedChat === conv.id ? '600' : '400',
                        fontSize: '14px'
                      }}
                    >
                      <Hash size={16} /> {getConversationName(conv)}
                    </div>
                  ))}
              </div>
            </div>

            {/* DIRECT MESSAGES SECTION */}
            <div style={{ padding: '20px 20px 10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Direct Messages</span>
                <button onClick={handleStartNewChat} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><Plus size={16} /></button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {conversations
                  .filter(c => c.conversationType === 'direct')
                  .map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        background: selectedChat === conv.id ? 'var(--bg-selected)' : 'transparent',
                        color: selectedChat === conv.id ? 'var(--primary)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: selectedChat === conv.id ? '600' : '400',
                        fontSize: '14px'
                      }}
                    >
                      <div style={{ position: 'relative' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '4px', background: 'var(--bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700' }}>
                          {getConversationAvatar(conv)}
                        </div>
                        {isConversationOnline(conv) && (
                          <div style={{ position: 'absolute', bottom: '-2px', right: '-2px', width: '8px', height: '8px', background: 'var(--green-color)', borderRadius: '50%', border: '2px solid var(--bg-panel)' }}></div>
                        )}
                      </div>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getConversationName(conv)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer - Cleaned up per user request */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        display: (isMobile && showSidebarOnMobile) ? 'none' : 'flex',
        flexDirection: 'column',
        background: 'var(--bg-app)',
        minWidth: 0,
        position: 'relative'
      }}>
        {activeTab === 'messages' && !selectedChat && !isMobile && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '24px',
            background: 'var(--bg-panel)',
            zIndex: 5
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'var(--bg-primary-soft)',
              borderRadius: '35px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid var(--border-primary-soft)'
            }}>
              <Shield size={60} color="var(--primary)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '900', textTransform: 'uppercase', tracking: '-0.02em', color: 'var(--text-main)' }}>TechCorp Secure Terminal</h2>
              <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', fontWeight: '500' }}>Quantum-safe end-to-end encrypted protocol active.</p>
            </div>
          </div>
        )}
        {activeTab === 'projects' && <ProjectsTasksContent />}
        {activeTab === 'settings' && <SettingsContent user={user} darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}
        {activeTab === 'contacts' && <ContactsContent users={availableUsers} onSelect={(id) => { setActiveTab('messages'); handleSelectUser(id); }} />}
        {activeTab === 'team' && (isManager || isAdmin) && (
          <TeamContent
            users={availableUsers}
            currentUser={user}
            isAdmin={isAdmin}
            onSelect={(id) => { setActiveTab('messages'); handleSelectUser(id); }}
          />
        )}
        {activeTab === 'discover' && <DiscoverContent />}
        {activeTab === 'alerts' && <AlertsContent onUpdateCount={loadUnreadCount} />}
        {activeTab === 'calls' && <CallsContent />}
        {activeTab === 'vault' && !selectedChat && (
          <div style={{ width: '100%', maxWidth: '1000px', flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
              <div>
                <h2 style={{ color: 'var(--text-main)', margin: 0, fontSize: '28px', fontWeight: '900', textTransform: 'uppercase', tracking: '-0.02em' }}>Secure Repo</h2>
                <p style={{ color: 'var(--text-secondary)', margin: '5px 0 0 0', fontSize: '13px', fontWeight: '500' }}>AES-256 cloud-synchronized asset storage</p>
              </div>
              <button
                onClick={handleFileClick}
                style={{
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontWeight: '900',
                  fontSize: '13px',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(0,123,255,0.2)'
                }}
              >
                <Plus size={20} /> Upload New File
              </button>
            </div>

            {/* Vault Controls */}
            <div style={{
              display: 'flex',
              gap: '15px',
              marginBottom: '20px',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                flex: 1,
                minWidth: '250px',
                position: 'relative',
                background: 'var(--bg-panel)',
                borderRadius: '10px',
                border: '1px solid var(--border-color)',
                padding: '12px 15px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <Search size={16} color="var(--text-secondary)" />
                <input
                  type="text"
                  placeholder="Filter objects by name..."
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-main)',
                    width: '100%',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-panel)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                {['date', 'name', 'size'].map(sort => (
                  <button
                    key={sort}
                    onClick={() => setVaultSort(sort)}
                    style={{
                      background: vaultSort === sort ? 'var(--bg-light)' : 'transparent',
                      border: vaultSort === sort ? '1px solid var(--border-color)' : '1px solid transparent',
                      color: vaultSort === sort ? 'var(--primary)' : 'var(--text-secondary)',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '800',
                      textTransform: 'uppercase'
                    }}
                  >
                    {sort}
                  </button>
                ))}
              </div>
            </div>

            <div style={{
              background: 'var(--bg-panel)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              shadow: '0 4px 20px rgba(0,0,0,0.02)'
            }}>
              {filesLoading ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <div className="loader"></div>
                  <span style={{ marginLeft: '12px' }}>Accessing secure storage...</span>
                </div>
              ) : (
                <div style={{ overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-light)', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.05em' }}>Asset Label</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.05em' }}>Size</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.05em' }}>Timestamp</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-main)', fontSize: '11px', fontWeight: '900', textTransform: 'uppercase', tracking: '0.05em' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {files
                        .filter(f => f.name.toLowerCase().includes(vaultSearch.toLowerCase()))
                        .sort((a, b) => {
                          if (vaultSort === 'name') return a.name.localeCompare(b.name);
                          if (vaultSort === 'size') return b.sizeBytes - a.sizeBytes;
                          return new Date(b.createdAt) - new Date(a.createdAt);
                        })
                        .map(f => (
                          <tr key={f.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.2s' }} className="vault-row">
                            <td style={{ padding: '16px 24px', color: 'var(--text-main)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                  width: '36px',
                                  height: '36px',
                                  background: 'var(--bg-primary-soft)',
                                  borderRadius: '10px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid var(--border-primary-soft)'
                                }}>
                                  <FileText size={18} color="var(--primary)" />
                                </div>
                                <div style={{ overflow: 'hidden' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                                    {f.ownerId !== user?.id && (
                                      <span style={{ fontSize: '9px', background: 'var(--bg-selected)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: '900' }}>SHARED</span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-secondary)', fontWeight: '800', uppercase: 'true' }}>AES-256 SECURE</div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>
                              {(f.sizeBytes / 1024 / 1024).toFixed(2)} MB
                            </td>
                            <td style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: '600' }}>
                              {new Date(f.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                <button
                                  onClick={() => api.downloadFile(f.id, f.name)}
                                  style={{
                                    background: 'var(--bg-primary-soft)',
                                    border: 'none',
                                    color: 'var(--primary)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                  }}
                                  title="Download"
                                >
                                  <Download size={18} />
                                </button>
                                <button
                                  onClick={async () => {
                                    try {
                                      const result = await api.verifyFileIntegrity(f.id);
                                      if (result.isValid) {
                                        alert(`Integrity Verified! \nFile: ${f.name}\nHash: ${result.currentHash} \nStatus: Secure and untouched.`);
                                      } else {
                                        alert(`WARNING: Integrity Failure! \nFile: ${f.name}\nExpected: ${result.originalHash} \nActual: ${result.currentHash} \nThis file may have been tampered with!`);
                                      }
                                    } catch (err) {
                                      alert('Integrity check failed to execute.');
                                    }
                                  }}
                                  style={{
                                    background: 'var(--bg-green-soft)',
                                    border: 'none',
                                    color: 'var(--green-color)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                  }}
                                  title="Verify Integrity"
                                >
                                  <ShieldCheck size={18} />
                                </button>
                                <button
                                  onClick={() => handleOpenShare(f)}
                                  disabled={f.ownerId !== user?.id}
                                  style={{
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    cursor: f.ownerId === user?.id ? 'pointer' : 'not-allowed',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s',
                                    opacity: f.ownerId === user?.id ? 1 : 0.5
                                  }}
                                  title="Manage Shares"
                                >
                                  <Users size={18} />
                                </button>
                                <button
                                  onClick={() => handleViewVersions(f.id)}
                                  style={{
                                    background: 'var(--bg-panel)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                  }}
                                  title="Version History"
                                >
                                  <Clock size={18} />
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(f.id)}
                                  style={{
                                    background: 'var(--bg-red-soft)',
                                    border: 'none',
                                    color: 'var(--red-color)',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s'
                                  }}
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'messages' && selectedChat && selectedConversation ? (
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* Main Chat Content */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {/* Chat Header */}
              <div style={{
                background: 'var(--bg-panel)',
                borderBottom: '1px solid var(--border-color)',
                padding: '0 20px',
                flexShrink: 0
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '56px'
                }}>
                  {/* Left: Avatar + Name + Online status */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '40px', height: '40px',
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '16px', fontWeight: '700', color: '#fff'
                      }}>
                        {getConversationName(selectedConversation)?.charAt(0)?.toUpperCase()}
                      </div>
                      {isConversationOnline(selectedConversation) && (
                        <div style={{
                          position: 'absolute', bottom: 1, right: 1,
                          width: 11, height: 11, background: '#4ade80',
                          border: '2px solid var(--bg-panel)', borderRadius: '50%'
                        }} />
                      )}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-main)' }}>
                        {getConversationName(selectedConversation)}
                      </div>
                      <div style={{ fontSize: '12px', color: isConversationOnline(selectedConversation) ? '#4ade80' : 'var(--text-secondary)' }}>
                        {isConversationOnline(selectedConversation) ? 'Đang hoạt động' : 'Ngoại tuyến'}
                      </div>
                    </div>
                  </div>

                  {/* Right: Action buttons */}
                  <div style={{ display: 'flex', gap: '2px', alignItems: 'center' }}>
                    <button
                      title="Gọi thoại"
                      onClick={() => initiateCall('voice')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-light)'; e.currentTarget.style.color = '#667eea'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Phone size={20} />
                    </button>
                    <button
                      title="Gọi video"
                      onClick={() => initiateCall('video')}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-light)'; e.currentTarget.style.color = '#667eea'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                    >
                      <Video size={20} />
                    </button>
                    <button
                      title="Tìm kiếm tin nhắn"
                      onClick={() => setShowSearchInChat && setShowSearchInChat(v => !v)}
                      style={{ background: showSearchInChat ? 'rgba(102,126,234,0.12)' : 'transparent', border: 'none', color: showSearchInChat ? '#667eea' : 'var(--text-secondary)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = showSearchInChat ? 'rgba(102,126,234,0.12)' : 'transparent'}
                    >
                      <Search size={20} />
                    </button>
                    <button
                      title="Thông tin hội thoại"
                      onClick={() => setShowRightSidebar(v => !v)}
                      style={{ background: showRightSidebar ? 'rgba(102,126,234,0.12)' : 'transparent', border: 'none', color: showRightSidebar ? '#667eea' : 'var(--text-secondary)', padding: '8px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'all 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = showRightSidebar ? 'rgba(102,126,234,0.12)' : 'transparent'}
                    >
                      <Info size={20} />
                    </button>
                  </div>
                </div>

                {/* Inline Search Bar (shown when search icon clicked) */}
                {showSearchInChat && (
                  <div style={{ padding: '8px 0 12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                      <input
                        autoFocus
                        type="text"
                        value={chatSearchQuery || ''}
                        onChange={e => setChatSearchQuery && setChatSearchQuery(e.target.value)}
                        placeholder="Tìm kiếm trong cuộc trò chuyện..."
                        style={{ width: '100%', background: 'var(--bg-light)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '7px 14px 7px 34px', fontSize: '13px', outline: 'none', color: 'var(--text-main)', boxSizing: 'border-box' }}
                      />
                    </div>
                    <button type="button" onClick={() => { setShowSearchInChat && setShowSearchInChat(false); setChatSearchQuery && setChatSearchQuery(''); }}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px', display: 'flex' }}>
                      <X size={18} />
                    </button>
                  </div>
                )}
              </div>

              {/* Pinned Messages Banner */}
              <PinnedMessagesBanner
                conversationId={selectedChat}
                userId={user?.id}
              />

              {/* Messages Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 30px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {messagesLoading ? (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <Lock size={48} color="var(--primary)" style={{ opacity: 0.3 }} />
                    <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
                      Start a secure conversation
                    </p>
                  </div>
                ) : (
                  <>
                    {messages
                      .filter(m => !m.messageType || !m.messageType.startsWith('signal_'))
                      .map((msg, index, arr) => (
                        <div key={msg.id} className="message-appear">
                          <EnhancedMessageBubble
                            message={msg}
                            isOwn={msg.sender?.id === user?.id}
                            showAvatar={index === 0 || arr[index - 1].sender?.id !== msg.sender?.id}
                            currentUserId={user?.id}
                            conversationId={selectedChat}
                            onDelete={() => loadMessages(selectedChat, true)}
                            onReply={(msg) => setReplyingTo(msg)}
                            onForward={(msg) => { setForwardingMessage(msg); setShowForwardModal(true); }}
                            onEdit={(msg) => { setEditingMessage(msg); setMessageInput(msg.content); }}
                            isRead={msg.isRead}
                          />
                        </div>
                      ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
                {typingUsers.length > 0 && (
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                    padding: '8px 20px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      background: 'var(--bg-main)',
                      padding: '10px 16px',
                      borderRadius: '16px 16px 16px 4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <div className="typing-dots">
                        <span></span><span></span><span></span>
                      </div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        {typingUsers.length === 1 ? 'Typing...' : 'Several people are typing...'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Area (Enhanced & Consolidated) */}
              <form onSubmit={handleSendMessage} style={{
                padding: '12px 20px 20px',
                background: 'var(--bg-panel)',
                borderTop: '1px solid var(--border-color)',
                flexShrink: 0
              }}>
                {/* Advanced Toolbar Row (Top) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginBottom: '8px',
                  padding: '4px 0',
                  borderBottom: '1px solid var(--border-color)',
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}>
                  {(() => {
                    const toolbarButtonStyle = {
                      background: 'transparent',
                      border: 'none',
                      padding: '6px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    };
                    return (
                      <>
                        <button type="button" onClick={() => setShowStickerPicker(!showStickerPicker)} style={toolbarButtonStyle} title="Emoji & Stickers" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Smile size={20} /></button>
                        <button type="button" onClick={() => { const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*'; inp.onchange = ev => { if (ev.target.files[0]) setSelectedFile(ev.target.files[0]); }; inp.click(); }} style={toolbarButtonStyle} title="Gửi ảnh" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Image size={20} /></button>
                        <button type="button" onClick={handleFileClick} style={toolbarButtonStyle} title="Gửi file" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Paperclip size={20} /></button>
                        <button type="button" onClick={startCamera} style={toolbarButtonStyle} title="Chụp ảnh" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Camera size={20} /></button>
                        <button type="button" onClick={() => setShowPollModal(true)} style={toolbarButtonStyle} title="Bình chọn" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><BarChart3 size={20} /></button>
                        <button type="button" style={toolbarButtonStyle} title="Tin nhắn tự xóa" onClick={() => setSelfDestructTime(v => v ? null : 30)} onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Clock size={20} color={selfDestructTime ? 'var(--primary)' : 'inherit'} /></button>

                        <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 8px' }} />

                        <button type="button" onClick={() => setMessageInput(v => v + '@')} style={toolbarButtonStyle} title="Nhắc tên" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><AtSign size={20} /></button>
                        <button type="button" onClick={() => setMessageInput(v => v + '**bold**')} style={toolbarButtonStyle} title="Chữ đậm" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Bold size={20} /></button>
                        <button type="button" onClick={() => setMessageInput(v => v + '*italic*')} style={toolbarButtonStyle} title="Chữ nghiêng" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Italic size={20} /></button>
                        <button type="button" onClick={() => setMessageInput(v => v + '`code`')} style={toolbarButtonStyle} title="Mã code" onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-light)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}><Code size={20} /></button>
                      </>
                    );
                  })()}
                </div>

                {/* Replying/Editing UI inside Form */}
                {(replyingTo || editingMessage) && (
                  <div style={{
                    padding: '8px 12px',
                    background: 'var(--bg-light)',
                    borderRadius: '8px 8px 0 0',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--primary)', marginBottom: '2px' }}>
                        {editingMessage ? 'Đang sửa tin nhắn' : `Đang trả lời ${replyingTo.sender?.firstName || 'người dùng'}`}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {editingMessage ? editingMessage.content : replyingTo.content}
                      </div>
                    </div>
                    <button type="button" onClick={() => { setReplyingTo(null); setEditingMessage(null); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={16} /></button>
                  </div>
                )}

                {/* Main Input Area Row (Bottom) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  background: 'var(--bg-light)',
                  borderRadius: (replyingTo || editingMessage) ? '0 0 12px 12px' : '12px',
                  padding: '8px 12px',
                  gap: '10px'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      marginBottom: '2px'
                    }}
                  >
                    <Plus size={22} />
                  </button>

                  <textarea
                    ref={inputRef}
                    rows={1}
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    placeholder={`Nhập tin nhắn tới ${getConversationName(selectedConversation)}...`}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-main)',
                      fontSize: '15px',
                      padding: '6px 0',
                      resize: 'none',
                      maxHeight: '150px'
                    }}
                  />

                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginBottom: '2px' }}>
                    <button type="button" onClick={() => setShowStickerPicker(v => !v)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', padding: '4px' }}>
                      <Smile size={24} />
                    </button>
                    <button type="submit"
                      disabled={!messageInput.trim() && !selectedFile}
                      style={{
                        background: (messageInput.trim() || selectedFile) ? 'var(--primary)' : 'transparent',
                        border: 'none',
                        color: (messageInput.trim() || selectedFile) ? '#fff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        borderRadius: '10px',
                        padding: '10px',
                        transition: 'all 0.2s',
                        boxShadow: (messageInput.trim() || selectedFile) ? '0 4px 12px var(--shadow-primary)' : 'none'
                      }}>
                      <Send size={20} />
                    </button>
                  </div>
                </div>

                {/* Footer Hint */}
                <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                    <span><b>Enter</b> để gửi</span>
                    <span><b>Shift + Enter</b> xuống dòng</span>
                  </div>
                  <div style={{ fontSize: '11px', color: messageInput.length > 4000 ? '#ef4444' : 'var(--text-secondary)', fontWeight: '600' }}>
                    {messageInput.length > 0 && `${messageInput.length}/4096`}
                  </div>
                </div>
              </form>
            </div>

            {/* Right Sidebar */}
            {
              showRightSidebar && (
                <ConversationSidebar
                  conversation={{
                    ...selectedConversation,
                    isOnline: isConversationOnline(selectedConversation),
                    isPinned: pinnedChatIds.has(selectedChat),
                    isMuted: mutedChatIds.has(selectedChat),
                    onTogglePin: () => setPinnedChatIds(prev => {
                      const next = new Set(prev);
                      if (next.has(selectedChat)) next.delete(selectedChat);
                      else next.add(selectedChat);
                      return next;
                    }),
                    onToggleMute: () => setMutedChatIds(prev => {
                      const next = new Set(prev);
                      if (next.has(selectedChat)) next.delete(selectedChat);
                      else next.add(selectedChat);
                      return next;
                    }),
                    onDelete: () => handleDeleteConversation({ id: selectedChat })
                  }}
                  onlineUserIds={onlineUserIds}
                  onClose={() => setShowRightSidebar(false)}
                  currentUserId={user.id}
                  onConversationUpdated={() => loadConversations()}
                />
              )
            }
          </div>
        ) : (
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            padding: '40px'
          }}>
            <>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'rgba(102, 126, 234, 0.1)',
                borderRadius: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Shield size={60} color="#667eea" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '24px' }}>
                  {activeTab === 'messages' && !selectedChat && 'Select a conversation'}
                  {activeTab === 'vault' && 'Your Encrypted Files'}
                  {activeTab === 'alerts' && 'Security Alerts'}
                  {activeTab === 'settings' && 'Settings & Preferences'}
                </h2>
                <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>
                  {activeTab === 'messages' && 'All messages are end-to-end encrypted'}
                  {activeTab === 'vault' && 'AES-256 encryption for all files'}
                  {activeTab === 'alerts' && 'Real-time security monitoring'}
                </p>
              </div>
            </>
          </div>
        )}

        {/* New Chat Modal */}
        {
          showNewChatModal && !showGroupModal && (
            <Modal title="Start New Chat" onClose={() => setShowNewChatModal(false)}>
              <div style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 80px)' }}>
                {availableUsers.map(u => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectUser(u.id)}
                    style={{
                      padding: '16px 20px',
                      cursor: 'pointer',
                      borderBottom: '1px solid #2a3441',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#1a2332'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      background: '#667eea',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontWeight: '700'
                    }}>
                      {u.firstName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>
                        {u.firstName} {u.lastName}
                      </div>
                      <div style={{ color: '#8b98a5', fontSize: '12px' }}>
                        {u.email}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Modal>
          )
        }

        {/* Group Chat Modal */}
        {
          showGroupModal && (
            <Modal title="Create Group Chat" onClose={() => {
              setShowGroupModal(false);
              setGroupName('');
              setSelectedMembers([]);
            }}>
              <div style={{ padding: '20px' }}>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#1a2332',
                    border: '1px solid #2a3441',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    marginBottom: '15px'
                  }}
                />
                <div style={{ position: 'relative', marginBottom: '15px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: '#8b98a5' }} />
                  <input
                    type="text"
                    placeholder="Search members to add..."
                    value={memberSearchQuery || ''}
                    onChange={(e) => setMemberSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#0e1621',
                      border: '1px solid #2a3441',
                      borderRadius: '8px',
                      padding: '8px 12px 8px 36px',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ color: '#8b98a5', fontSize: '12px' }}>
                    Selected: {selectedMembers.length} members
                  </div>
                  {(isManager || isAdmin) && (
                    <button
                      onClick={() => {
                        const teamIds = availableUsers
                          .filter(u => isAdmin ? true : (u.managerId === user.id || u.department === user.department))
                          .map(u => u.id);
                        setSelectedMembers(prev => [...new Set([...prev, ...teamIds])]);
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#667eea', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}
                    >
                      + Select My Team
                    </button>
                  )}
                </div>
              </div>
              <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
                {availableUsers
                  .filter(u => {
                    const q = (memberSearchQuery || '').toLowerCase();
                    return u.firstName?.toLowerCase().includes(q) || u.lastName?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
                  })
                  .map(u => (
                    <div
                      key={u.id}
                      onClick={() => toggleMemberSelection(u.id)}
                      style={{
                        padding: '12px 20px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #2a3441',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        background: selectedMembers.includes(u.id) ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '6px',
                        border: `2px solid ${selectedMembers.includes(u.id) ? '#667eea' : '#2a3441'}`,
                        background: selectedMembers.includes(u.id) ? '#667eea' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0
                      }}>
                        {selectedMembers.includes(u.id) && <Check size={14} />}
                      </div>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: '#2a3441',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontWeight: '700',
                        fontSize: '14px',
                        flexShrink: 0
                      }}>
                        {u.firstName?.charAt(0) || '?'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#fff', fontWeight: '600', fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.firstName} {u.lastName}
                        </div>
                        <div style={{ color: '#8b98a5', fontSize: '11px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {u.email}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              <div style={{ padding: '20px', borderTop: '1px solid #2a3441' }}>
                <button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || selectedMembers.length === 0}
                  style={{
                    width: '100%',
                    background: groupName.trim() && selectedMembers.length > 0 ? '#667eea' : 'rgba(102, 126, 234, 0.3)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#fff',
                    fontWeight: '600',
                    cursor: groupName.trim() && selectedMembers.length > 0 ? 'pointer' : 'not-allowed'
                  }}
                >
                  Create Group ({selectedMembers.length} members)
                </button>
              </div>
            </Modal>
          )
        }

        {/* Select File from Vault Modal */}
        {
          showVaultModal && (
            <Modal title="Select File from Vault" onClose={() => setShowVaultModal(false)}>
              <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                {filesLoading ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#8b98a5' }}>Loading...</div>
                ) : files.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#8b98a5' }}>
                    <FileText size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                    <p>Vault is empty</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {files.map(f => (
                      <div
                        key={f.id}
                        onClick={() => handleShareVaultFile(f)}
                        style={{
                          padding: '12px',
                          background: '#1a2332',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          border: '1px solid #2a3441',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#667eea';
                          e.currentTarget.style.background = '#222b3c';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2a3441';
                          e.currentTarget.style.background = '#1a2332';
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          background: 'rgba(102, 126, 234, 0.1)',
                          borderRadius: '8px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FileText size={18} color="#667eea" />
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                          <div style={{ color: '#fff', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: '500' }}>{f.name}</div>
                          <div style={{ color: '#8b98a5', fontSize: '11px' }}>{(f.sizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                        <Plus size={16} color="#4a5568" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Modal>
          )
        }

        {/* Camera Capture Modal */}
        {
          showCamera && (
            <Modal title="Capture Photo" onClose={stopCamera}>
              <div style={{ padding: '20px', background: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  style={{
                    width: '100%',
                    maxHeight: '400px',
                    borderRadius: '12px',
                    background: '#151f2e',
                    transform: 'scaleX(-1)'
                  }}
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
                  <button
                    onClick={stopCamera}
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      color: '#ef4444',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={capturePhoto}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 40px',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                    }}
                  >
                    Capture & Send
                  </button>
                </div>
              </div>
            </Modal>
          )
        }

        {showPollModal && (
          <PollModal
            onClose={() => setShowPollModal(false)}
            onCreate={async (pollData) => {
              try {
                const content = `📊 Bình chọn: ${pollData.question}\n\n${pollData.options.map((o, i) => `${i + 1}. ${o}`).join('\n')}`;
                // Using a generic message for now, in a real app this would be a structured 'poll' type
                await handleSendMessage(null, content);
                setShowPollModal(false);
              } catch (err) {
                alert('Không thể tạo bình chọn: ' + err.message);
              }
            }}
          />
        )}

        {/* File Version History Modal */}
        {showVersionModal && (
          <Modal title="Version History" onClose={() => setShowVersionModal(false)}>
            <div style={{ padding: '20px', minWidth: '400px' }}>
              {loadingVersions ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-secondary)' }}>Loading history...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div style={{ padding: '15px', background: 'var(--bg-primary-soft)', borderRadius: '12px', border: '1px solid var(--border-primary-soft)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>Current Version</div>
                        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginTop: '4px' }}>v{selectedFileVersionData?.current?.versionNumber}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Latest: {new Date(selectedFileVersionData?.current?.updatedAt).toLocaleString()}</div>
                      </div>
                      <div style={{ fontSize: '12px', background: 'var(--green-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: '800' }}>LATEST</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Historical Snapshots</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '5px' }}>
                      {selectedFileVersionData?.versions?.length > 0 ? (
                        selectedFileVersionData.versions.map(v => (
                          <div key={v.id} style={{ padding: '12px', background: 'var(--bg-light)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>Version {v.versionNumber}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>{new Date(v.createdAt).toLocaleString()}</div>
                              {v.changesDescription && (
                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '4px' }}>"{v.changesDescription}"</div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <button
                                onClick={() => handleRestoreVersion(selectedFileVersionData.current.id, v.versionNumber)}
                                style={{ background: 'var(--bg-primary-soft)', border: 'none', color: 'var(--primary)', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Restore
                              </button>
                              <button
                                onClick={() => handleDeleteVersion(selectedFileVersionData.current.id, v.versionNumber)}
                                style={{ background: 'var(--bg-red-soft)', border: 'none', color: 'var(--red-color)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>No previous versions found</div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}

        {/* File Sharing Management Modal */}
        {showShareModal && (
          <Modal title={`Sharing: ${sharingFile?.name}`} onClose={() => setShowShareModal(false)}>
            <div style={{ padding: '20px', minWidth: '450px' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Add New Collaborator</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    value={shareTargetUserId}
                    onChange={(e) => setShareTargetUserId(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'var(--bg-light)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      padding: '10px',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  >
                    <option value="">Select a user...</option>
                    {availableUsers
                      .filter(u => u.id !== user?.id)
                      .map(u => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.email})</option>
                      ))}
                  </select>
                  <select
                    value={sharePermission}
                    onChange={(e) => setSharePermission(e.target.value)}
                    style={{
                      background: 'var(--bg-light)',
                      border: '1px solid var(--border-color)',
                      color: 'var(--text-main)',
                      padding: '10px',
                      borderRadius: '8px',
                      outline: 'none'
                    }}
                  >
                    <option value="view">View Only</option>
                    <option value="edit">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    onClick={handleShareFile}
                    disabled={!shareTargetUserId}
                    style={{
                      background: 'var(--primary)',
                      color: '#fff',
                      border: 'none',
                      padding: '0 20px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: shareTargetUserId ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Share
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', fontWeight: '900', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>Current Access</div>
                <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sharesLoading ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>Loading...</div>
                  ) : currentShares.length > 0 ? (
                    currentShares.map(s => {
                      const u = availableUsers.find(au => au.id === s.sharedWithId);
                      return (
                        <div key={s.id} style={{ padding: '12px', background: 'var(--bg-light)', borderRadius: '10px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-selected)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff' }}>
                              {u?.firstName?.charAt(0) || '?'}
                            </div>
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{u ? `${u.firstName} ${u.lastName}` : 'Unknown User'}</div>
                              <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Permission: <span style={{ color: 'var(--primary)', fontWeight: '800', textTransform: 'uppercase' }}>{s.permissionLevel}</span></div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRevokeShare(s.id)}
                            style={{ background: 'var(--bg-red-soft)', border: 'none', color: 'var(--red-color)', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                            title="Revoke access"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>This file hasn't been shared yet.</div>
                  )}
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Calling Modal (Premium & Dynamic) */}
        {
          showCallModal && (
            <div style={{
              position: 'fixed',
              inset: isCallMaximized ? 0 : 'auto',
              bottom: isCallMaximized ? 0 : '30px',
              right: isCallMaximized ? 0 : '30px',
              width: isCallMaximized ? '100%' : '320px',
              height: isCallMaximized ? '100%' : '480px',
              background: '#0a0f1b',
              zIndex: 7000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: isCallMaximized ? '60px 20px' : '20px',
              color: '#fff',
              borderRadius: isCallMaximized ? '0' : '24px',
              boxShadow: isCallMaximized ? 'none' : '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: isCallMaximized ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
              overflow: 'hidden',
              transition: 'all 0.5s cubic-bezier(0.19, 1, 0.22, 1)'
            }}>
              {/* Background Decor */}
              {isCallMaximized && !remoteStream && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: `radial-gradient(circle at center, rgba(102, 126, 234, 0.15) 0%, transparent 70%)`,
                  opacity: 0.6,
                  zIndex: 0
                }} />
              )}

              {/* Remote Video (Full Screen) */}
              {callType === 'video' && remoteStream && (
                <video
                  ref={(ref) => {
                    if (ref && ref.srcObject !== remoteStream) {
                      ref.srcObject = remoteStream;
                    }
                  }}
                  autoPlay
                  playsInline
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    zIndex: 0
                  }}
                />
              )}

              {/* Header Controls */}
              <div style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                zIndex: 10,
                position: 'absolute',
                top: isCallMaximized ? '30px' : '15px',
                right: isCallMaximized ? '30px' : '15px'
              }}>
                <button
                  onClick={() => setIsCallMaximized(!isCallMaximized)}
                  style={{
                    padding: '8px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  {isCallMaximized ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                </button>
              </div>

              {/* Contact Info (Visible when no video or maximized) */}
              <div style={{
                textAlign: 'center',
                zIndex: 1,
                marginTop: isCallMaximized ? '2vh' : '40px',
                display: (callType === 'video' && remoteStream && !isCallMaximized) ? 'none' : 'block'
              }}>
                <div style={{
                  width: isCallMaximized ? '140px' : '80px',
                  height: isCallMaximized ? '140px' : '80px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                  fontSize: isCallMaximized ? '56px' : '32px',
                  fontWeight: '800',
                  border: '4px solid rgba(255,255,255,0.1)'
                }}>
                  {selectedChat ? (conversations.find(c => c.id === selectedChat)?.otherUser?.firstName?.charAt(0) || 'U') : '?'}
                </div>
                <h2 style={{ fontSize: isCallMaximized ? '32px' : '20px', marginBottom: '8px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                  {selectedChat ? getConversationName(conversations.find(c => c.id === selectedChat)) : 'Unknown'}
                </h2>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: '#818cf8',
                  fontSize: isCallMaximized ? '18px' : '14px',
                  fontWeight: '600'
                }}>
                  {callStatus === 'ringing' ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#818cf8', animation: 'pulse 1.5s infinite' }} />
                      Ringing...
                    </span>
                  ) : (
                    <span>{formatDuration(callDuration)}</span>
                  )}
                </div>
              </div>

              {/* Local Video Overlay (Always PIP) */}
              {callType === 'video' && !isVideoOff && (
                <div style={{
                  position: 'absolute',
                  top: isCallMaximized ? 'auto' : '20px',
                  bottom: isCallMaximized ? '180px' : 'auto',
                  right: '25px',
                  width: isCallMaximized ? '150px' : '100px',
                  height: isCallMaximized ? '220px' : '140px',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  zIndex: 5,
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                  background: '#111'
                }}>
                  <video
                    ref={(ref) => {
                      if (ref && localStream && ref.srcObject !== localStream) {
                        ref.srcObject = localStream;
                      }
                    }}
                    autoPlay
                    muted
                    playsInline
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}

              {/* Call Controls Box */}
              <div style={{
                zIndex: 10,
                background: 'rgba(255, 255, 255, 0.08)',
                backdropFilter: 'blur(30px)',
                padding: isCallMaximized ? '20px 40px' : '15px 25px',
                borderRadius: '35px',
                display: 'flex',
                gap: isCallMaximized ? '25px' : '15px',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: isCallMaximized ? '20px' : '10px'
              }}>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  title={isMuted ? "Unmute" : "Mute"}
                  style={{
                    width: isCallMaximized ? '55px' : '45px',
                    height: isCallMaximized ? '55px' : '45px',
                    borderRadius: '50%',
                    background: isMuted ? '#fff' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: isMuted ? '#000' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  {isMuted ? <Mic size={isCallMaximized ? 24 : 20} strokeWidth={2} /> : <Mic size={isCallMaximized ? 24 : 20} />}
                </button>

                {callType === 'video' && (
                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    title={isVideoOff ? "Start Video" : "Stop Video"}
                    style={{
                      width: isCallMaximized ? '55px' : '45px',
                      height: isCallMaximized ? '55px' : '45px',
                      borderRadius: '50%',
                      background: isVideoOff ? '#fff' : 'rgba(255,255,255,0.1)',
                      border: 'none',
                      color: isVideoOff ? '#000' : '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                  >
                    <Video size={isCallMaximized ? 24 : 20} />
                  </button>
                )}

                <button
                  onClick={async () => {
                    const chatId = selectedChat;
                    setShowCallModal(false);
                    setCallStatus('idle');
                    stopStream();
                    stopRingtone();
                    if (chatId) socketService.sendHangUp(chatId);
                  }}
                  title="End Call"
                  style={{
                    width: isCallMaximized ? '65px' : '55px',
                    height: isCallMaximized ? '65px' : '55px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 10px 30px rgba(239, 68, 68, 0.4)',
                    transition: 'all 0.2s'
                  }}
                >
                  <Phone size={isCallMaximized ? 28 : 24} style={{ transform: 'rotate(135deg)' }} />
                </button>
              </div>
            </div>
          )
        }

        {/* Incoming Call UI */}
        {
          incomingCall && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 15, 25, 0.95)',
              backdropFilter: 'blur(40px)',
              zIndex: 8000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }} className="calling-overlay">
              {/* Background Avatar Blur */}
              <div style={{
                position: 'absolute',
                inset: '-20px',
                background: `url(${incomingCall.from?.avatarUrl || 'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=800'})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(80px) brightness(0.4)',
                zIndex: -1,
                opacity: 0.8
              }} />

              <div style={{
                width: '160px',
                height: '160px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '55px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '35px',
                boxShadow: '0 0 80px rgba(102, 126, 234, 0.4)',
                border: '6px solid rgba(255,255,255,0.05)',
                animation: 'callPulse 2s infinite cubic-bezier(0.4, 0, 0.2, 1)'
              }}>
                <span style={{ fontSize: '64px', color: '#fff', fontWeight: '800' }}>
                  {incomingCall.from?.firstName?.charAt(0) || '?'}
                </span>
              </div>
              <h2 style={{ color: '#fff', fontSize: '36px', margin: '0 0 10px 0', fontWeight: '800', textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                {incomingCall.from?.firstName} {incomingCall.from?.lastName}
              </h2>
              <div style={{
                background: 'rgba(102, 126, 234, 0.15)',
                padding: '8px 20px',
                borderRadius: '20px',
                color: '#818cf8',
                fontSize: '18px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '4px',
                border: '1px solid rgba(102, 126, 234, 0.3)'
              }}>
                Incoming {incomingCall.type}...
              </div>

              <div style={{ marginTop: '100px', display: 'flex', gap: '50px' }}>
                {/* Reject Button */}
                <button
                  onClick={() => {
                    stopRingtone();
                    if (incomingCall.conversationId) socketService.sendCallResponse(incomingCall.conversationId, null, false);
                    setIncomingCall(null);
                  }}
                  style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    boxShadow: '0 20px 40px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s'
                  }}
                >
                  <X size={32} />
                  <span style={{ fontSize: '13px', marginTop: '6px', fontWeight: '700' }}>Decline</span>
                </button>

                {/* Accept Button */}
                <button
                  onClick={() => acceptIncomingCall()}
                  style={{
                    width: '85px',
                    height: '85px',
                    borderRadius: '50%',
                    background: '#10b981',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)',
                    transition: 'all 0.2s',
                    animation: 'incomingPulse 2s infinite ease-in-out'
                  }}
                >
                  {incomingCall.type === 'video' ? <Video size={32} /> : <Phone size={32} />}
                  <span style={{ fontSize: '13px', marginTop: '6px', fontWeight: '700' }}>Accept</span>
                </button>
              </div>
            </div>
          )
        }

        {/* Forward Message Modal */}
        {
          showForwardModal && (
            <Modal title="Forward Message" onClose={() => setShowForwardModal(false)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    onClick={() => handleForwardMessage(conv.id)}
                    style={{
                      padding: '12px',
                      background: '#1a2332',
                      border: '1px solid #2a3441',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a3441'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1a2332'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      background: '#667eea',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '700',
                      color: '#fff'
                    }}>
                      {getConversationAvatar(conv)}
                    </div>
                    <div style={{ color: '#fff', fontWeight: '600' }}>
                      {getConversationName(conv)}
                    </div>
                  </div>
                ))}
              </div>
            </Modal>
          )
        }

        {
          showPollModal && (
            <PollModal
              onClose={() => setShowPollModal(false)}
              onCreate={async (pollData) => {
                try {
                  await api.sendMessage(selectedChat, `Poll: ${pollData.question}\nOptions: ${pollData.options.join(', ')}`, 'poll');
                  loadMessages(selectedChat, true);
                } catch (error) {
                  alert('Failed to create poll');
                }
              }}
            />
          )
        }

        {/* Vault Unlock Modal */}
        {showVaultUnlockModal && (
          <Modal title="Secure Vault Access" onClose={() => setShowVaultUnlockModal(false)}>
            <div style={{ padding: '30px', textAlign: 'center' }}>
              <div style={{
                width: '70px', height: '70px', borderRadius: '20px',
                background: 'var(--bg-primary-soft)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
              }}>
                <Lock size={30} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'var(--text-main)', margin: '0 0 10px 0', textTransform: 'uppercase' }}>Identity Verification</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '25px', fontWeight: '500' }}>
                Please confirm your password to access the end-to-end encrypted storage vault.
              </p>

              <form onSubmit={async (e) => {
                e.preventDefault();
                setUnlockLoading(true);
                try {
                  await api.verifyPassword(unlockPassword);
                  setIsVaultLocked(false);
                  setShowVaultUnlockModal(false);
                  setActiveTab('vault');
                  setUnlockPassword('');
                } catch (err) {
                  alert('Verification failed. System access denied.');
                  setUnlockPassword('');
                } finally {
                  setUnlockLoading(false);
                }
              }}>
                <input
                  type="password"
                  autoFocus
                  placeholder="Enter your password"
                  value={unlockPassword}
                  onChange={(e) => setUnlockPassword(e.target.value)}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px',
                    background: 'var(--bg-panel)', border: '1px solid var(--border-color)',
                    color: 'var(--text-main)', fontSize: '15px', outline: 'none',
                    textAlign: 'center', marginBottom: '20px', fontWeight: '700'
                  }}
                />
                <button
                  type="submit"
                  disabled={unlockLoading || !unlockPassword}
                  style={{
                    width: '100%', padding: '15px', borderRadius: '12px',
                    background: 'var(--primary)', color: '#fff', border: 'none',
                    fontWeight: '900', cursor: 'pointer', transition: 'all 0.2s',
                    opacity: unlockPassword ? 1 : 0.5
                  }}
                >
                  {unlockLoading ? 'VERIFYING...' : 'UNLOCK VAULT'}
                </button>
              </form>
            </div>
          </Modal>
        )}

        {/* Context Menu */}
        <ContextMenu
          contextMenu={contextMenu}
          onDelete={handleDeleteConversation}
          pinnedChatIds={pinnedChatIds}
          mutedChatIds={mutedChatIds}
          onClose={(conv, action) => {
            setContextMenu(null);
            if (action === 'hide' && conv) {
              setHiddenChatIds(prev => new Set([...prev, conv.id]));
              alert('Conversation hidden. You can find it by searching.');
            } else if (action === 'read' && conv) {
              api.markAsRead(conv.id);
              loadUnreadCount();
            } else if (action === 'pin' && conv) {
              setPinnedChatIds(prev => {
                const next = new Set(prev);
                if (next.has(conv.id)) next.delete(conv.id);
                else next.add(conv.id);
                return next;
              });
            } else if (action === 'mute' && conv) {
              setMutedChatIds(prev => {
                const next = new Set(prev);
                if (next.has(conv.id)) next.delete(conv.id);
                else next.add(conv.id);
                return next;
              });
            }
          }}
        />

        <style>
          {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.5); opacity: 0.3; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          @keyframes callPulse {
            0% { transform: scale(1); box-shadow: 0 0 60px rgba(102, 126, 234, 0.6); }
            50% { transform: scale(1.08); box-shadow: 0 0 90px rgba(102, 126, 234, 0.8); }
            100% { transform: scale(1); box-shadow: 0 0 60px rgba(102, 126, 234, 0.6); }
          }
        `}
        </style>
      </div >
    </div >
  );
}

// HELPER COMPONENTS
function NavIcon({ icon, active, onClick, label, badge }) {
  return (
    <div
      onClick={onClick}
      title={label}
      style={{
        width: '50px',
        height: '50px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        background: active ? 'rgba(102, 126, 234, 0.15)' : 'transparent',
        color: active ? '#667eea' : '#8b98a5',
        transition: 'all 0.2s',
        border: active ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent',
        position: 'relative'
      }}
    >
      {icon}
      {badge > 0 && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          background: '#ef4444',
          color: '#fff',
          fontSize: '10px',
          fontWeight: 'bold',
          width: '18px',
          height: '18px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #0e1621'
        }}>
          {badge > 99 ? '99+' : badge}
        </div>
      )}
    </div>
  );
}

function ChatItem({ chat, active, onClick, getName, getAvatar, formatTime, onContextMenu, isPinned, isMuted, isOnline }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onContextMenu={onContextMenu}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '10px 16px',
        margin: '1px 8px',
        borderRadius: '8px',
        cursor: 'pointer',
        background: active ? '#007bff15' : (hovered ? '#f1f3f5' : 'transparent'),
        transition: 'all 0.15s ease',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: active ? '#007bff' : '#f1f3f5',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '14px',
          fontWeight: '800',
          color: active ? '#fff' : '#1a1d21'
        }}>
          {getAvatar(chat)}
        </div>
        {isOnline && (
          <div style={{
            position: 'absolute',
            bottom: '-1px',
            right: '-1px',
            width: '10px',
            height: '10px',
            background: '#4ade80',
            border: '2px solid #fff',
            borderRadius: '50%'
          }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h4 style={{
            margin: 0,
            color: '#1a1d21',
            fontSize: '14px',
            fontWeight: chat.unreadCount > 0 ? '800' : (active ? '700' : '400'),
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {getName(chat)}
          </h4>
          <span style={{ color: '#616061', fontSize: '11px' }}>
            {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
          <p style={{
            margin: 0,
            color: chat.unreadCount > 0 ? '#1a1d21' : '#616061',
            fontSize: '12px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontWeight: chat.unreadCount > 0 ? '600' : '400'
          }}>
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && (
            <div style={{
              background: '#ef4444',
              borderRadius: '20px',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              fontSize: '10px',
              color: '#fff',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginLeft: '8px',
              boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
            }}>
              {chat.unreadCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={onClose}>
      <div style={{
        background: '#151f2e',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflow: 'hidden',
        border: '1px solid #2a3441'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #2a3441',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#fff', fontSize: '18px' }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b98a5',
              cursor: 'pointer',
              padding: '8px'
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', maxHeight: 'calc(80vh - 100px)' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ContextMenu({ contextMenu, onDelete, onClose, pinnedChatIds, mutedChatIds }) {
  if (!contextMenu) return null;
  return (
    <div style={{
      position: 'fixed',
      top: contextMenu.y,
      left: contextMenu.x,
      zIndex: 9999,
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      minWidth: '200px',
      padding: '4px 0',
      animation: 'fadeIn 0.1s ease-out'
    }}>
      <div
        onClick={(e) => { e.stopPropagation(); onClose(contextMenu.conversation, 'pin'); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Pin size={16} color={pinnedChatIds.has(contextMenu.conversation.id) ? '#667eea' : '#8b98a5'} />
        {pinnedChatIds.has(contextMenu.conversation.id) ? 'Unpin Chat' : 'Pin to Top'}
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); onClose(contextMenu.conversation, 'mute'); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        {mutedChatIds.has(contextMenu.conversation.id) ? (
          <><Bell size={16} color="#667eea" /> Unmute Notifications</>
        ) : (
          <><BellOff size={16} color="#8b98a5" /> Mute Notifications</>
        )}
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); alert('Added to favorites!'); onClose(); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Star size={16} color="#fbbf24" /> Mark as Favorite
      </div>
      <div style={{ height: '1px', background: '#334155', margin: '4px 0' }} />
      <div
        onClick={(e) => { e.stopPropagation(); onDelete(contextMenu.conversation); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Trash2 size={16} /> Delete Conversation
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); onClose(contextMenu.conversation, 'hide'); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <EyeOff size={16} color="#667eea" /> Hide Conversation
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); onClose(contextMenu.conversation, 'read'); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          transition: 'background 0.2s',
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Check size={16} color="#4ade80" /> Mark as Read
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); alert('Block User feature coming soon!'); onClose(); }}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          color: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '14px',
          borderTop: '1px solid #334155'
        }}
        onMouseEnter={(e) => e.target.style.background = '#334155'}
        onMouseLeave={(e) => e.target.style.background = 'transparent'}
      >
        <Shield size={16} /> Block User (Coming Soon)
      </div>
    </div>
  );
}

function SettingsContent({ user, darkMode, toggleDarkMode }) {
  const fileInputRef = React.useRef(null);
  const [isChangingPass, setIsChangingPass] = React.useState(false);
  const [passData, setPassData] = React.useState({ newPass: '', confirmPass: '' });
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);

  // MFA States
  const [showMfaSetup, setShowMfaSetup] = React.useState(false);
  const [mfaQrCode, setMfaQrCode] = React.useState('');
  const [mfaBackupCodes, setMfaBackupCodes] = React.useState([]);
  const [mfaVerifyToken, setMfaVerifyToken] = React.useState('');
  const [isVerifyingMfa, setIsVerifyingMfa] = React.useState(false);
  const [profileData, setProfileData] = React.useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    department: user?.department || '',
    jobTitle: user?.jobTitle || ''
  });
  const [activeSubTab, setActiveSubTab] = React.useState('profile'); // profile, security, activity, preferences, sessions
  const [activity, setActivity] = React.useState([]);
  const [sessions, setSessions] = React.useState([]);
  const [preferences, setPreferences] = React.useState(user?.preferences || {
    themeColor: '#667eea',
    notificationsEnabled: true,
    soundsEnabled: true,
    readReceipts: true,
    onlineStatus: true
  });

  const updatePreference = async (newPrefs) => {
    setPreferences(newPrefs);
    try {
      await api.updateProfile({ preferences: newPrefs });
    } catch (err) {
      console.error('Failed to save preferences', err);
    }
  };

  React.useEffect(() => {
    if (activeSubTab === 'activity') loadActivity();
    if (activeSubTab === 'sessions') loadSessions();
  }, [activeSubTab]);

  const loadActivity = async () => {
    try {
      const logs = await api.getUserActivity();
      setActivity(logs);
    } catch (err) {
      console.error('Failed to load activity', err);
    }
  };

  const loadSessions = async () => {
    try {
      const resp = await api.getUserSessions();
      setSessions(resp);
    } catch (err) {
      console.error('Failed to load sessions', err);
    }
  };

  const handleRevokeSession = async (sid) => {
    if (!window.confirm('Revoke this session? You will be logged out from that device.')) return;
    try {
      await api.revokeSession(sid);
      loadSessions();
    } catch (err) { alert('Revoke failed'); }
  };

  const handleMfaInit = async () => {
    try {
      const data = await api.setupMfa();
      setMfaQrCode(data.qrCode);
      setMfaBackupCodes(data.backupCodes || []);
      setShowMfaSetup(true);
    } catch (err) {
      alert('MFA setup failed');
    }
  };

  const handleConfirmMfa = async () => {
    if (mfaVerifyToken.length !== 6) return alert('Enter 6-digit code');
    setIsVerifyingMfa(true);
    try {
      const { verified } = await api.verifyMfaSetup(mfaVerifyToken);
      if (verified) {
        alert('MFA Enabled Successfully!');
        setShowMfaSetup(false);
        window.location.reload();
      } else {
        alert('Invalid code. Please try again.');
      }
    } catch (err) {
      alert('Verification error');
    } finally {
      setIsVerifyingMfa(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await api.uploadAvatar(file);
      alert('Avatar updated!');
      window.location.reload();
    } catch (err) {
      alert('Failed to upload avatar.');
    }
  };

  const handlePassUpdate = async () => {
    if (!passData.newPass || passData.newPass !== passData.confirmPass) {
      alert('Passwords do not match');
      return;
    }
    try {
      await api.updateProfile({ password: passData.newPass });
      alert('Password updated');
      setIsChangingPass(false);
    } catch (err) {
      alert('Update failed');
    }
  };

  const handleProfileUpdate = async () => {
    try {
      await api.updateProfile(profileData);
      alert('Profile updated!');
      setIsEditingProfile(false);
      // Ideally update context here, but reload is simpler for demo
      window.location.reload();
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div style={{ padding: '40px', color: 'var(--text-main)', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', margin: 0, color: 'var(--text-main)' }}>Settings</h2>
        <div style={{ display: 'flex', background: 'var(--bg-panel)', padding: '4px', borderRadius: '10px', flexWrap: 'wrap', gap: '5px' }}>
          {['profile', 'security', 'preferences', 'sessions', 'activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              style={{
                padding: '8px 16px',
                background: activeSubTab === tab ? '#667eea' : 'transparent',
                color: activeSubTab === tab ? '#fff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                fontSize: '13px',
                transition: 'all 0.2s'
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeSubTab === 'profile' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          {/* Profile Card */}
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '30px' }}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
            <div
              onClick={handleAvatarClick}
              style={{
                width: '120px', height: '120px', borderRadius: '30px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '48px', fontWeight: 'bold', overflow: 'hidden', position: 'relative', cursor: 'pointer'
              }}
            >
              {user?.avatarUrl ? (
                <img src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${api.baseURL}${user.avatarUrl}`} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} alt={`${user.firstName}'s avatar`} />
              ) : (
                <div style={{ color: '#fff' }}>{user?.firstName?.charAt(0)}</div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                <Camera size={24} color="#fff" />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0', fontSize: '26px', color: 'var(--text-main)' }}>{user?.firstName} {user?.lastName}</h3>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>{user?.email}</p>
                </div>
                <button
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  style={{ padding: '8px 16px', background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                  {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                </button>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <span style={{ padding: '4px 10px', background: 'var(--bg-main)', borderRadius: '6px', fontSize: '12px', color: '#667eea' }}>{user?.role || 'User'}</span>
                <span style={{ padding: '4px 10px', background: 'var(--bg-main)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-muted)' }}>ID: {user?.employeeId || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Details Form */}
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)' }}>Personal Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              {[
                { label: 'First Name', key: 'firstName' },
                { label: 'Last Name', key: 'lastName' },
                { label: 'Phone Number', key: 'phone' },
                { label: 'Department', key: 'department' },
                { label: 'Job Title', key: 'jobTitle' }
              ].map(field => (
                <div key={field.key}>
                  <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '8px' }}>{field.label}</label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      value={profileData[field.key]}
                      onChange={e => setProfileData({ ...profileData, [field.key]: e.target.value })}
                      style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none', boxSizing: 'border-box' }}
                    />
                  ) : (
                    <div style={{ padding: '10px', background: 'var(--bg-main)', borderRadius: '8px', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}>{user?.[field.key] || 'Not specified'}</div>
                  )}
                </div>
              ))}
            </div>
            {isEditingProfile && (
              <button
                onClick={handleProfileUpdate}
                style={{ marginTop: '25px', width: '100%', padding: '12px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      )}

      {activeSubTab === 'security' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Shield size={20} color="#667eea" /> Security Settings</h3>

            {/* MFA */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Multi-Factor Authentication</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{user?.mfaRequired ? 'Account is secured with 2FA' : 'Your account is less secure without 2FA'}</div>
              </div>
              <button
                onClick={user?.mfaRequired ?
                  async () => {
                    if (window.confirm('Disable 2FA?')) {
                      await api.updateProfile({ mfaRequired: false });
                      window.location.reload();
                    }
                  } : handleMfaInit
                }
                style={{ padding: '8px 16px', background: user?.mfaRequired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', color: user?.mfaRequired ? '#ef4444' : '#22c55e', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                {user?.mfaRequired ? 'Disable' : 'Setup 2FA'}
              </button>
            </div>

            {showMfaSetup && (
              <Modal title="Secure Your Account with 2FA" onClose={() => setShowMfaSetup(false)}>
                <div style={{ padding: '0 20px 20px 20px', textAlign: 'center' }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <p style={{ color: '#8b98a5', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                      1. Scan this QR code with a mobile authenticator app (e.g., Google Authenticator, Authy, or Microsoft Authenticator).
                    </p>

                    <div style={{
                      background: '#fff',
                      padding: '15px',
                      borderRadius: '16px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                      display: 'inline-block'
                    }}>
                      <img src={mfaQrCode} alt="MFA QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                    </div>

                    <div style={{
                      width: '100%',
                      background: 'rgba(102, 126, 234, 0.05)',
                      padding: '15px',
                      borderRadius: '12px',
                      border: '1px dashed rgba(102, 126, 234, 0.3)',
                      textAlign: 'left'
                    }}>
                      <p style={{ color: '#667eea', fontSize: '13px', fontWeight: 'bold', margin: '0 0 10px 0' }}>
                        2. Save your Backup Codes (Crucial!)
                      </p>
                      <p style={{ color: '#8b98a5', fontSize: '11px', margin: '0 0 12px 0' }}>
                        If you lose access to your device, these codes will be the ONLY way to recover your account.
                      </p>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                        fontSize: '11px',
                        fontFamily: 'monospace'
                      }}>
                        {mfaBackupCodes.map((code, idx) => (
                          <div key={idx} style={{ background: 'var(--bg-main)', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
                            {code}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ width: '100%', textAlign: 'left' }}>
                      <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '13px', fontWeight: '600', marginBottom: '10px' }}>
                        3. Enter the 6-digit code from your app
                      </label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input
                          type="text"
                          maxLength="6"
                          placeholder="000 000"
                          value={mfaVerifyToken}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 6) setMfaVerifyToken(val);
                          }}
                          style={{
                            flex: 1,
                            padding: '14px',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '12px',
                            color: 'var(--text-main)',
                            textAlign: 'center',
                            fontSize: '24px',
                            fontWeight: 'bold',
                            letterSpacing: '5px',
                            outline: 'none'
                          }}
                        />
                      </div>
                    </div>

                    <button
                      disabled={isVerifyingMfa || mfaVerifyToken.length !== 6}
                      onClick={handleConfirmMfa}
                      style={{
                        width: '100%',
                        padding: '16px',
                        background: mfaVerifyToken.length === 6 ? '#667eea' : 'var(--border-color)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        cursor: mfaVerifyToken.length === 6 ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s',
                        marginTop: '10px',
                        boxShadow: mfaVerifyToken.length === 6 ? '0 4px 15px rgba(102, 126, 234, 0.4)' : 'none'
                      }}
                    >
                      {isVerifyingMfa ? 'Securing Account...' : 'Verify and Activate 2FA'}
                    </button>
                  </div>
                </div>
              </Modal>
            )}

            {/* Password */}
            <div style={{ padding: '20px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>Change Password</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Last changed: {user?.lastPasswordChange ? new Date(user.lastPasswordChange).toLocaleDateString() : 'Never'}</div>
                </div>
                {!isChangingPass && (
                  <button onClick={() => setIsChangingPass(true)} style={{ padding: '8px 16px', background: 'rgba(102, 126, 234, 0.1)', color: '#667eea', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Update</button>
                )}
              </div>
              {isChangingPass && (
                <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
                  <input type="password" placeholder="New Password" value={passData.newPass} onChange={e => setPassData({ ...passData, newPass: e.target.value })} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                  <input type="password" placeholder="Confirm New Password" value={passData.confirmPass} onChange={e => setPassData({ ...passData, confirmPass: e.target.value })} style={{ padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-main)', outline: 'none' }} />
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handlePassUpdate} style={{ flex: 1, padding: '10px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save Password</button>
                    <button onClick={() => setIsChangingPass(false)} style={{ flex: 1, padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'preferences' && (
        <div style={{ display: 'grid', gap: '30px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Settings size={20} color="#667eea" /> Appearance & Preferences</h3>

            {/* Dark Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderRadius: '16px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: darkMode ? 'rgba(102,126,234,0.15)' : 'rgba(234, 179, 8, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                  {darkMode ? '🌙' : '☀️'}
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '15px' }}>Dark Mode</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{darkMode ? 'Currently using dark theme' : 'Currently using light theme'}</div>
                </div>
              </div>
              <div
                onClick={toggleDarkMode}
                style={{
                  width: '52px', height: '28px',
                  background: darkMode ? '#667eea' : 'var(--border-color)',
                  borderRadius: '20px', position: 'relative', cursor: 'pointer',
                  transition: 'background 0.3s',
                  flexShrink: 0
                }}
              >
                <div style={{
                  position: 'absolute', top: '3px',
                  left: darkMode ? '26px' : '3px',
                  width: '22px', height: '22px',
                  background: '#fff', borderRadius: '50%',
                  transition: 'left 0.3s',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.25)'
                }} />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '15px' }}>Accent Color</label>
              <div style={{ display: 'flex', gap: '15px' }}>
                {['#667eea', '#22c55e', '#ef4444', '#eab308', '#ec4899', '#8b5cf6'].map(color => (
                  <div
                    key={color}
                    onClick={() => updatePreference({ ...preferences, themeColor: color })}
                    style={{
                      width: '35px', height: '35px', borderRadius: '50%', background: color, cursor: 'pointer',
                      border: preferences.themeColor === color ? '3px solid #fff' : 'none',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                ))}
              </div>
            </div>

            {[
              { label: 'Notifications', desc: 'Enable desktop notifications', key: 'notificationsEnabled' },
              { label: 'Sounds', desc: 'Enable in-app sound effects', key: 'soundsEnabled' },
              { label: 'Read Receipts', desc: 'Allow others to see when you read messages', key: 'readReceipts' },
              { label: 'Online Status', desc: 'Show your current online availability', key: 'onlineStatus' }
            ].map(pref => (
              <div key={pref.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{pref.label}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{pref.desc}</div>
                </div>
                <div
                  onClick={() => updatePreference({ ...preferences, [pref.key]: !preferences[pref.key] })}
                  style={{
                    width: '45px', height: '22px', background: preferences[pref.key] ? '#667eea' : 'var(--border-color)',
                    borderRadius: '15px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s'
                  }}
                >
                  <div style={{
                    width: '16px', height: '16px', background: '#fff', borderRadius: '50%',
                    position: 'absolute', top: '3px', left: preferences[pref.key] ? '26px' : '3px',
                    transition: 'left 0.3s'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'sessions' && (
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}><Lock size={20} color="#667eea" /> Active Sessions</h3>
              <button onClick={loadSessions} style={{ background: 'transparent', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: '14px' }}>Refresh</button>
            </div>
            <div style={{ display: 'grid', gap: '15px' }}>
              {sessions.length > 0 ? sessions.map(s => (
                <div key={s.id} style={{ background: 'var(--bg-main)', padding: '20px', borderRadius: '15px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ width: '45px', height: '45px', borderRadius: '12px', background: 'var(--bg-panel)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {s.deviceType === 'mobile' ? <Phone size={20} color="#667eea" /> : <Settings size={20} color="#667eea" />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.deviceName || 'Unknown Device'} • {s.browser || 'Unknown Browser'}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.ipAddress} • {s.city || 'Unknown Location'}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', opacity: 0.7 }}>Last accessed: {new Date(s.lastAccessedAt).toLocaleString()}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRevokeSession(s.id)}
                    style={{ padding: '8px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Logout
                  </button>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#8b98a5' }}>No active sessions found.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'activity' && (
        <div style={{ background: 'var(--bg-panel)', padding: '30px', borderRadius: '20px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px', color: 'var(--text-main)' }}>Recent Activity</h3>
          <div style={{ display: 'grid', gap: '0' }}>
            {activity.length > 0 ? activity.map((log, idx) => (
              <div key={idx} style={{ padding: '15px 0', borderBottom: idx === activity.length - 1 ? 'none' : '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#667eea', fontSize: '14px' }}>{log.eventType.replace(/_/g, ' ')}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>{log.description}</div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', opacity: 0.7 }}>{new Date(log.createdAt).toLocaleString()}</div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '40px', color: '#8b98a5' }}>No recent activity found.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


function ContactsContent({ users, onSelect }) {
  const [term, setTerm] = React.useState('');
  const [filter, setFilter] = useState('all'); // all, online

  const filtered = users?.filter(u => {
    const matchSearch = u.firstName?.toLowerCase().includes(term.toLowerCase()) ||
      u.lastName?.toLowerCase().includes(term.toLowerCase()) ||
      u.email?.toLowerCase().includes(term.toLowerCase());
    return matchSearch;
  }) || [];

  return (
    <div style={{ padding: '30px', color: 'var(--text-main)', height: '100%', display: 'flex', flexDirection: 'column', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Directory</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Connect with your colleagues securely</p>
        </div>
      </div>

      <div style={{ marginBottom: '30px', position: 'relative' }}>
        <Search size={20} style={{ position: 'absolute', left: '20px', top: '15px', color: '#667eea' }} />
        <input
          value={term}
          onChange={e => setTerm(e.target.value)}
          placeholder="Search by name, email or department..."
          style={{
            width: '100%',
            padding: '16px 16px 16px 55px',
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            color: 'var(--text-main)',
            outline: 'none',
            fontSize: '15px',
            transition: 'all 0.2s',
            boxSizing: 'border-box'
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto' }}>
        {filtered.map(u => (
          <div
            key={u.id}
            onClick={() => onSelect(u.id)}
            style={{
              background: 'var(--bg-panel)',
              padding: '24px',
              borderRadius: '24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              border: '1px solid var(--border-color)'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
              e.currentTarget.style.borderColor = '#667eea';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '800',
              color: '#fff',
              flexShrink: 0
            }}>
              {u.firstName?.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: '700', fontSize: '17px', color: 'var(--text-main)', marginBottom: '2px' }}>{u.firstName} {u.lastName}</div>
              <div style={{ fontSize: '13px', color: '#667eea', fontWeight: '600', marginBottom: '4px' }}>{u.jobTitle || u.department || 'Team Member'}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
            </div>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: 'var(--green-color)',
              boxShadow: '0 0 8px var(--green-color)',
              flexShrink: 0
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamContent({ users, currentUser, onSelect, isAdmin }) {
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [showBroadcast, setShowBroadcast] = useState(false);

  const teamMembers = users?.filter(u => isAdmin ? true : (u.managerId === currentUser.id || u.department === currentUser.department)) || [];

  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return;
    try {
      const promises = teamMembers.map(async (u) => {
        const conv = await api.getOrCreateDirectConversation(u.id);
        return api.sendMessage(conv.id, broadcastMsg, 'broadcast');
      });
      await Promise.all(promises);
      setBroadcastSent(true);
      setBroadcastMsg('');
      setTimeout(() => setBroadcastSent(false), 3000);
      setShowBroadcast(false);
    } catch (err) {
      alert('Failed to send broadcast');
    }
  };

  return (
    <div style={{ padding: '40px', color: 'var(--text-main)', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Team Management</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage and communicate with your direct reports</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setShowBroadcast(!showBroadcast)}
            style={{
              background: '#667eea', border: 'none', color: '#fff',
              padding: '12px 24px', borderRadius: '14px', cursor: 'pointer',
              fontWeight: '700', display: 'flex', alignItems: 'center', gap: '10px',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)'
            }}
          >
            <Send size={18} /> Team Broadcast
          </button>
        </div>
      </div>

      {showBroadcast && (
        <div style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '24px', border: '1px solid #667eea', marginBottom: '30px', animation: 'fadeIn 0.3s ease' }}>
          <h4 style={{ margin: '0 0 15px 0', color: 'var(--text-main)' }}>Send message to all {teamMembers.length} members</h4>
          <textarea
            value={broadcastMsg}
            onChange={e => setBroadcastMsg(e.target.value)}
            placeholder="Type your message here..."
            style={{ width: '100%', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '15px', color: 'var(--text-main)', height: '100px', outline: 'none', marginBottom: '15px', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button onClick={() => setShowBroadcast(false)} style={{ background: 'transparent', border: 'none', color: '#8b98a5', padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
            <button onClick={handleBroadcast} style={{ background: '#667eea', border: 'none', color: '#fff', padding: '10px 25px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>Send Broadcast</button>
          </div>
        </div>
      )}

      {broadcastSent && (
        <div style={{ background: '#10b981', color: '#fff', padding: '15px', borderRadius: '15px', marginBottom: '30px', textAlign: 'center', fontWeight: '700' }}>
          Broadcast message sent successfully!
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '25px', marginBottom: '40px' }}>
        {[
          { label: 'Team Size', val: teamMembers.length, color: '#667eea', icon: <Users /> },
          { label: 'Online Now', val: teamMembers.length, color: '#10b981', icon: <Clock /> },
          { label: 'Files Shared', val: '42', color: '#f59e0b', icon: <File /> },
          { label: 'Security Level', val: 'SECURED', color: '#ef4444', icon: <Shield /> },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-panel)', padding: '25px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ color: s.color, marginBottom: '15px' }}>{s.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '5px' }}>{s.val}</div>
            <div style={{ color: '#8b98a5', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <h3 style={{ fontSize: '20px', marginBottom: '20px', fontWeight: '700', color: 'var(--text-main)' }}>Team Members</h3>
        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
              <th style={{ padding: '0 20px' }}>Name</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th style={{ textAlign: 'right', padding: '0 20px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {teamMembers.map(u => (
              <tr key={u.id} style={{ background: 'var(--bg-panel)', transition: 'all 0.2s' }}>
                <td style={{ padding: '15px 20px', borderRadius: '16px 0 0 16px', borderLeft: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-main)', fontWeight: '700' }}>
                      {u.firstName?.charAt(0)}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{u.firstName} {u.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-main)' }}>{u.jobTitle || 'Engineer'}</td>
                <td style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-main)' }}>{u.department}</td>
                <td style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '12px', fontWeight: '700' }}>Active</span>
                </td>
                <td style={{ padding: '15px 20px', borderRadius: '0 16px 16px 0', borderRight: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', textAlign: 'right' }}>
                  <button
                    onClick={() => onSelect(u.id)}
                    style={{ background: 'rgba(102, 126, 234, 0.14)', border: 'none', color: '#667eea', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}
                  >
                    Quick Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CallsContent() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCalls = async () => {
    try {
      setLoading(true);
      const data = await api.getCallHistory();
      setCalls(data || []);
    } catch (err) {
      console.error('Failed to load call history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getOtherParty = (call) => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return 'Unknown';
    const currentUser = JSON.parse(userJson);

    if (call.callerId === currentUser.id) {
      const otherMember = call.conversation?.members?.find(m => m.userId !== currentUser.id);
      return otherMember?.user ? `${otherMember.user.firstName} ${otherMember.user.lastName}` : 'Direct Chat';
    }
    return call.caller ? `${call.caller.firstName} ${call.caller.lastName}` : 'Unknown';
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: '#8b98a5' }}>Loading call history...</div>;

  return (
    <div style={{ padding: '30px', color: 'var(--text-main)', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontSize: '28px', margin: 0, color: 'var(--text-main)' }}>Call History</h2>
        <button
          onClick={loadCalls}
          style={{
            background: 'rgba(102, 126, 234, 0.1)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            color: '#667eea',
            padding: '8px 15px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)'}
        >
          Refresh List
        </button>
      </div>
      <div style={{ background: 'var(--bg-panel)', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        {calls.length === 0 ? (
          <div style={{ padding: '60px 40px', textAlign: 'center', color: '#8b98a5' }}>
            <Phone size={48} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <p style={{ margin: 0, fontSize: '16px' }}>No call records found</p>
            <p style={{ margin: '8px 0 0', fontSize: '14px', opacity: 0.6 }}>Your voice and video call logs will appear here</p>
          </div>
        ) : (
          calls.map(call => {
            const userJson = localStorage.getItem('user');
            const currentUser = userJson ? JSON.parse(userJson) : null;
            const isOutgoing = call.callerId === currentUser?.id;
            const typeLabel = isOutgoing ? 'Outgoing' : (call.status === 'missed' ? 'Missed' : 'Incoming');

            return (
              <div key={call.id} style={{
                padding: '20px',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'background 0.2s',
                cursor: 'default'
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--active-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '12px',
                    background: call.status === 'missed' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${call.status === 'missed' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(102, 126, 234, 0.2)'}`
                  }}>
                    {call.callType === 'video' ? (
                      <Video size={18} color={call.status === 'missed' ? '#ef4444' : '#667eea'} />
                    ) : (
                      <Phone size={18} color={call.status === 'missed' ? '#ef4444' : '#667eea'} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: call.status === 'missed' ? 'var(--red-color)' : 'var(--text-main)', fontSize: '15px' }}>
                      {getOtherParty(call)}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {typeLabel} • {new Date(call.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-main)', fontWeight: '500' }}>{formatDuration(call.duration)}</div>
                  <div style={{
                    fontSize: '11px',
                    color: call.status === 'completed' ? '#4ade80' : (call.status === 'missed' ? '#ef4444' : '#8b98a5'),
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginTop: '4px',
                    fontWeight: '700'
                  }}>{call.status}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function AlertsContent({ onUpdateCount }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, security

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await api.getNotifications();
      setNotifications(data.items || []);
      setUnreadCount(data.unreadCount || 0);
      if (onUpdateCount) onUpdateCount();
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.markNotificationAsRead(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      loadNotifications();
    } catch (err) {
      console.error('Failed to mark all as read', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteNotification(id);
      loadNotifications();
    } catch (err) {
      console.error('Failed to delete notification', err);
    }
  };

  const filtered = (notifications || []).filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'security') return n.type?.includes('SECURITY') || n.priority === 'high' || n.priority === 'critical';
    return true;
  });

  const getIcon = (item) => {
    if (item.type?.includes('SECURITY') || item.priority === 'high' || item.priority === 'critical')
      return <AlertTriangle size={20} color="#ef4444" />;
    if (item.type === 'MESSAGE') return <MessageSquare size={20} color="#667eea" />;
    if (item.type?.includes('FILE')) return <FileText size={20} color="#22c55e" />;
    return <Bell size={20} color="#8b98a5" />;
  };

  return (
    <div style={{ padding: '40px', color: 'var(--text-main)', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', margin: 0, fontWeight: '700', color: 'var(--text-main)' }}>Notification Center</h2>
          <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Stay updated with your account activity</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handleMarkAllRead}
            style={{
              background: 'var(--bg-panel)', color: 'var(--text-main)', border: '1px solid var(--border-color)',
              padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', fontSize: '14px',
              display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--active-bg)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-panel)'}
          >
            <CheckCheck size={16} /> Mark all read
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {['all', 'unread', 'security'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '10px 24px',
              background: filter === f ? '#667eea' : 'var(--bg-panel)',
              color: filter === f ? '#fff' : 'var(--text-main)',
              border: filter === f ? 'none' : '1px solid var(--border-color)',
              borderRadius: '12px',
              cursor: 'pointer',
              textTransform: 'capitalize',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s',
              boxShadow: filter === f ? '0 4px 12px rgba(102, 126, 234, 0.4)' : 'none'
            }}
          >
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: '#8b98a5' }}>
            <div className="shimmer" style={{ width: '100%', height: '100px', borderRadius: '20px', background: '#151f2e' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px', background: 'var(--bg-panel)', borderRadius: '24px', border: '2px dashed var(--border-color)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(102, 126, 234, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Bell size={40} color="#667eea" style={{ opacity: 0.5 }} />
            </div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '20px', color: 'var(--text-main)' }}>No News is Good News</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '300px', margin: '0 auto' }}>You are all caught up! There are no {filter !== 'all' ? filter : ''} notifications at the moment.</p>
          </div>
        ) : (
          filtered.map(n => (
            <div
              key={n.id}
              style={{
                background: n.isRead ? 'var(--bg-panel)' : 'rgba(102, 126, 234, 0.05)',
                padding: '24px',
                borderRadius: '24px',
                border: n.isRead ? '1px solid var(--border-color)' : '1px solid #667eea',
                display: 'flex',
                gap: '20px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                cursor: 'default'
              }}
            >
              <div style={{
                width: '56px', height: '56px', borderRadius: '18px', background: 'var(--bg-main)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}>
                {getIcon(n)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: '700', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)' }}>
                    {n.title}
                    {!n.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#667eea' }} />}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(n.createdAt).toLocaleDateString()} {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '20px' }}>{n.message}</div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    {!n.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        style={{ background: '#667eea', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                      >
                        Mark as Read
                      </button>
                    )}
                    {n.actionUrl && (
                      <button
                        onClick={() => window.open(n.actionUrl, '_blank')}
                        style={{ background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--active-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        {n.actionLabel || 'View Detail'}
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(n.id)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', width: '36px', height: '36px',
                      borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                    title="Delete permanently"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function ProjectsTasksContent() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/v1/projects', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        const data = await res.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  const loadTasks = async (projectId) => {
    try {
      setTasksLoading(true);
      const res = await fetch(`/api/v1/projects/${projectId}/tasks`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      });
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setTasksLoading(false);
    }
  };

  const handleProjectClick = (p) => {
    setSelectedProject(p);
    loadTasks(p.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': case 'in_progress': return '#10b981';
      case 'planned': return '#667eea';
      case 'on_hold': return '#f59e0b';
      case 'completed': return '#8b98a5';
      default: return '#8b98a5';
    }
  };

  return (
    <div style={{ padding: '30px', color: 'var(--text-main)', height: '100%', display: 'flex', gap: '30px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      <div style={{ width: selectedProject ? '350px' : '100%', display: 'flex', flexDirection: 'column' }}>
        <h2 style={{ fontSize: '32px', margin: '0 0 20px 0', fontWeight: '800', color: 'var(--text-main)' }}>Secure Projects</h2>
        {loading ? <div style={{ color: 'var(--text-muted)' }}>Loading...</div> : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedProject ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', overflowY: 'auto' }}>
            {projects.map(p => (
              <div key={p.id} onClick={() => handleProjectClick(p)} style={{ background: 'var(--bg-panel)', padding: '24px', borderRadius: '24px', border: `1px solid ${selectedProject?.id === p.id ? '#667eea' : 'var(--border-color)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', color: getStatusColor(p.status), background: `${getStatusColor(p.status)}15`, padding: '4px 8px', borderRadius: '6px' }}>{p.status}</span>
                  <Layers size={16} color="#8b98a5" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>{p.name}</h3>
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={14} /> {p.deadline ? new Date(p.deadline).toLocaleDateString() : 'N/A'}</div>
                  <ChevronRight size={16} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedProject && (
        <div style={{ flex: 1, background: 'var(--bg-panel)', borderRadius: '24px', padding: '30px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, color: 'var(--text-main)' }}>{selectedProject.name}</h2>
            <button onClick={() => setSelectedProject(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}><X size={24} /></button>
          </div>
          {tasksLoading ? <div style={{ color: '#8b98a5' }}>Loading...</div> : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {tasks.length > 0 ? tasks.map(t => (
                <div key={t.id} style={{ background: '#0e1621', padding: '16px', borderRadius: '14px', border: '1px solid #2a3441', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '2px solid #667eea', background: t.status === 'done' ? '#667eea' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t.status === 'done' && <Check size={12} />}</div>
                  <div>{t.title}</div>
                </div>
              )) : <div style={{ color: '#8b98a5' }}>No tasks found in archives.</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
