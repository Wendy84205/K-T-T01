import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, FileText, MessageSquare, Bell, Settings, LogOut, Send, Plus, X, Users, MoreVertical, Paperclip, ChevronDown, Download, Camera, Video, Phone, MapPin, Search, Trash2, Mic, Square } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { SearchBar, PinnedMessagesBanner } from '../../components/chat/ChatEnhancements';
import { EnhancedMessageBubble } from '../../components/chat/EnhancedMessage';

export default function UserHomePage() {
  const { user } = useAuth();
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
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState(null); // 'voice' or 'video'
  const [vaultSearch, setVaultSearch] = useState('');
  const [vaultSort, setVaultSort] = useState('date'); // 'date' or 'name' or 'size'
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
    if (activeTab === 'messages') {
      loadConversations();
    } else if (activeTab === 'vault') {
      loadFiles();
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
    const pollInterval = setInterval(() => {
      loadConversations(true);
      if (selectedChat) {
        loadMessages(selectedChat, true);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [selectedChat, showCallModal, callStatus]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async (silent = false) => {
    try {
      if (!silent) setConversationsLoading(true);
      const data = await api.getConversations();
      setConversations(data);

      // Check for incoming calls in any conversation
      if (data && data.length > 0) {
        data.forEach(async (conv) => {
          if (!conv.lastMessage) return;

          const lastMsg = conv.lastMessage;
          const isOtherSender = lastMsg.sender.id !== user.id;

          // Detected Call End - Close UI for both parties
          if (showCallModal && conv.id === selectedChat && lastMsg.messageType === 'call_end' && isOtherSender) {
            console.log('[Calls] Detected call end from other party');
            setShowCallModal(false);
            setCallStatus('idle');
            stopStream();
            return;
          }

          // Detected Call Accept - Switch from Ringing to Connected
          if (showCallModal && callStatus === 'ringing' && conv.id === selectedChat && lastMsg.messageType === 'call_accept' && isOtherSender) {
            console.log('[Calls] Call accepted by other party');
            setCallStatus('connected');
          }

          // Detected New Incoming Call
          if (lastMsg.messageType === 'call_init' && isOtherSender) {
            const callTime = new Date(lastMsg.createdAt).getTime();
            const now = new Date().getTime();

            if (now - callTime < 30000 && !handledCallsRef.current.has(lastMsg.id)) {
              if (!incomingCall || incomingCall.id !== lastMsg.id) {
                setIncomingCall({
                  id: lastMsg.id,
                  from: lastMsg.sender,
                  type: (lastMsg.content || '').toLowerCase().includes('video') ? 'video' : 'voice',
                  conversationId: conv.id
                });
              }
            }
          }
        });
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      if (!silent) setConversationsLoading(false);
    }
  };

  const loadMessages = async (conversationId, silent = false) => {
    try {
      if (!silent) setMessagesLoading(true);
      const response = await api.getConversationMessages(conversationId);
      const newMessages = response.data || response || [];

      // Only update state if data actually changed to prevent UI flicker
      setMessages(prev => {
        if (JSON.stringify(prev) === JSON.stringify(newMessages)) return prev;

        // CHECK SIGNALING IN MESSAGES (More reliable than lastMessage in conv list)
        if (newMessages.length > 0) {
          const lastMsg = newMessages[newMessages.length - 1];
          const isOtherSender = lastMsg.sender.id !== user.id;

          // Call Accept Signal
          if (showCallModal && callStatus === 'ringing' && lastMsg.messageType === 'call_accept' && isOtherSender) {
            console.log('[Calls] Signaling: Call accepted via messages');
            setCallStatus('connected');
          }

          // Call End Signal
          if (showCallModal && lastMsg.messageType === 'call_end' && isOtherSender) {
            console.log('[Calls] Signaling: Call ended via messages');
            setShowCallModal(false);
            setCallStatus('idle');
            stopStream();
          }
        }

        return newMessages;
      });
    } catch (error) {
      console.error('Failed to load messages:', error);
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
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await api.deleteFile(fileId);
      loadFiles();
    } catch (error) {
      alert('Failed to delete file');
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
      api.setTyping(selectedChat, true).catch(() => { });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      api.setTyping(selectedChat, false).catch(() => { });
    }, 3000);
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageInput.trim() || !selectedChat || sending) return;

    try {
      setSending(true);
      setIsTyping(false);
      api.setTyping(selectedChat, false).catch(() => { });

      if (editingMessage) {
        await api.editMessage(editingMessage.id, messageInput.trim());
        setEditingMessage(null);
      } else {
        const newMessage = await api.sendMessage(
          selectedChat,
          messageInput.trim(),
          'text',
          null,
          replyingTo ? replyingTo.id : null
        );
      }

      setMessageInput('');
      setReplyingTo(null);

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

  const handleDeleteConversation = async () => {
    if (!selectedChat) return;
    if (!window.confirm('Are you sure you want to delete this conversation? This will remove it from your chat list.')) return;

    try {
      await api.deleteConversation(selectedChat);
      setSelectedChat(null);
      loadConversations();
    } catch (error) {
      console.error('Failed to delete conversation:', error);
      alert('Failed to delete conversation. Please try again.');
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
    if (!file || !selectedChat) return;

    try {
      setUploading(true);
      setShowAttachmentMenu(false);
      const uploadedFile = await api.uploadFile(file);

      const messageContent = `📎 Shared a file: ${file.name}`;
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

      const messageContent = `📎 Shared a file: ${file.name}`;
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
        await api.sendMessage(selectedChat, `📷 Shared a photo`, 'file', uploadedFile.id);

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
      await api.sendMessage(selectedChat, `📍 Shared location: ${mapLink}`, 'text');
    }, () => {
      alert('Unable to retrieve your location');
    });
    setShowAttachmentMenu(false);
  };

  const initiateCall = async (type) => {
    if (!selectedChat) {
      alert('Please select a chat first');
      return;
    }
    try {
      console.log(`[Calls] Initiating ${type} call to ${selectedChat}`);
      setCallType(type);
      setCallStatus('ringing');
      setShowCallModal(true);

      // Send signaling message
      await api.sendMessage(selectedChat, `Calling ${type}...`, 'call_init');

      // Start local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true
      });
      setLocalStream(stream);
      if (callVideoRef.current) {
        callVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Call initiation error:', error);
      alert(`Failed to start ${type} call: ${error.message || 'Server error'}`);
      setShowCallModal(false);
      setCallStatus('idle');
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
    if (!conv) return '👤';
    if (conv.conversationType === 'direct') {
      const name = getConversationName(conv);
      return name.charAt(0) || '👤';
    }
    return '👥';
  };

  const selectedConversation = React.useMemo(() => {
    return conversations.find(c => c.id === selectedChat);
  }, [conversations, selectedChat]);

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: '#0e1621',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      overflow: 'hidden'
    }}>
      {/* SIDEBAR */}
      <div style={{
        width: isMobile ? '60px' : '80px',
        background: '#1a2332',
        borderRight: '1px solid #2a3441',
        display: (isMobile && !showSidebarOnMobile) ? 'none' : 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px 0',
        flexShrink: 0
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

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <NavIcon
            icon={<MessageSquare size={24} />}
            active={activeTab === 'messages'}
            onClick={() => setActiveTab('messages')}
            label="Messages"
          />
          <NavIcon
            icon={<FileText size={24} />}
            active={activeTab === 'vault'}
            onClick={() => setActiveTab('vault')}
            label="Vault"
          />
          <NavIcon
            icon={<Bell size={24} />}
            active={activeTab === 'alerts'}
            onClick={() => setActiveTab('alerts')}
            label="Alerts"
          />
          <NavIcon
            icon={<Settings size={24} />}
            active={activeTab === 'settings'}
            onClick={() => setActiveTab('settings')}
            label="Settings"
          />
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'center'
        }}>
          <div
            onClick={() => setActiveTab('settings')}
            style={{
              width: '45px',
              height: '45px',
              background: '#667eea',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              cursor: 'pointer',
              border: '2px solid #2a3441',
              transition: 'all 0.2s',
              fontWeight: '700',
              color: '#fff'
            }}
            title={user?.email}
          >
            {user?.firstName?.charAt(0) || '👤'}
          </div>

          <div
            onClick={() => {
              if (window.confirm('Are you sure you want to logout?')) {
                localStorage.clear();
                window.location.href = '/login';
              }
            }}
            style={{
              width: '45px',
              height: '45px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              transition: 'all 0.2s'
            }}
            title="Logout"
          >
            <LogOut size={20} color="#ef4444" />
          </div>
        </div>
      </div>

      {/* CHAT LIST PANEL */}
      {activeTab === 'messages' && (
        <div style={{
          width: isMobile ? '100%' : '340px',
          display: (isMobile && !showSidebarOnMobile) ? 'none' : 'flex',
          background: '#151f2e',
          borderRight: '1px solid #2a3441',
          flexDirection: 'column',
          flexShrink: 0
        }}>
          <div style={{
            padding: '20px',
            borderBottom: '1px solid #2a3441'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{
                margin: 0,
                color: '#fff',
                fontSize: '24px',
                fontWeight: '700'
              }}>
                Secure Chat
              </h2>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    handleStartNewChat();
                    setShowGroupModal(true);
                    setShowNewChatModal(false);
                  }}
                  style={{
                    background: '#667eea',
                    border: 'none',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                  title="New Group"
                >
                  <Users size={20} />
                </button>
                <button
                  onClick={handleStartNewChat}
                  style={{
                    background: '#667eea',
                    border: 'none',
                    borderRadius: '10px',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#fff'
                  }}
                  title="New Chat"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            {selectedChat && (
              <SearchBar
                conversationId={selectedChat}
                onResultClick={(messageId) => {
                  // In a real implementation with infinite scroll,
                  // we would scroll to the specific message.
                  // For now, we just ensure it's loaded if possible.
                  console.log('Jump to message:', messageId);
                }}
              />
            )}
            {!selectedChat && (
              <div style={{
                background: '#1a2332',
                borderRadius: '10px',
                padding: '10px 15px',
                color: '#8b98a5'
              }}>
                Select a chat to search...
              </div>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversationsLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#8b98a5' }}>
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#8b98a5' }}>
                <MessageSquare size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                <p>No conversations yet</p>
                <button
                  onClick={handleStartNewChat}
                  style={{
                    background: '#667eea',
                    border: 'none',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '12px'
                  }}
                >
                  Start New Chat
                </button>
              </div>
            ) : (
              conversations.map(chat => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  active={selectedChat === chat.id}
                  onClick={() => {
                    setSelectedChat(chat.id);
                    api.markAsRead(chat.id).catch(() => { });
                    if (isMobile) setShowSidebarOnMobile(false);
                  }}
                  getName={getConversationName}
                  getAvatar={getConversationAvatar}
                  formatTime={formatTime}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <div style={{
        flex: 1,
        display: (isMobile && showSidebarOnMobile) ? 'none' : 'flex',
        flexDirection: 'column',
        background: '#0e1621',
        minWidth: 0,
        position: 'relative'
      }}>
        {!selectedChat && !isMobile && (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '20px',
            background: '#0e1621',
            zIndex: 5
          }}>
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
              <h2 style={{ color: '#fff', margin: '0 0 10px 0', fontSize: '24px' }}>Secure Cyber Communication</h2>
              <p style={{ color: '#8b98a5', margin: 0, fontSize: '14px' }}>End-to-end encrypted messaging for your safety.</p>
            </div>
          </div>
        )}
        {activeTab === 'messages' && selectedChat && selectedConversation ? (
          <>
            {/* Chat Header */}
            <div style={{
              background: '#151f2e',
              borderBottom: '1px solid #2a3441',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                {isMobile && (
                  <button
                    onClick={() => setShowSidebarOnMobile(true)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#667eea',
                      padding: '8px 0',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <ChevronDown size={24} style={{ transform: 'rotate(90deg)' }} />
                  </button>
                )}
                <div style={{
                  width: '45px',
                  height: '45px',
                  background: '#667eea',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#fff'
                }}>
                  {getConversationAvatar(selectedConversation)}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#fff', fontSize: '16px', fontWeight: '600' }}>
                    {getConversationName(selectedConversation)}
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginTop: '4px'
                  }}>
                    <Lock size={12} color="#667eea" />
                    <span style={{ color: '#667eea', fontSize: '12px', fontWeight: '600' }}>
                      {selectedConversation.conversationType === 'group'
                        ? `${selectedConversation.members?.length || 0} members`
                        : 'End-to-End Encrypted'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => initiateCall('voice')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #2a3441',
                    color: '#8b98a5',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Voice Call"
                >
                  <Phone size={18} />
                </button>
                <button
                  onClick={() => initiateCall('video')}
                  style={{
                    background: 'transparent',
                    border: '1px solid #2a3441',
                    color: '#8b98a5',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Video Call"
                >
                  <Video size={18} />
                </button>

                <button
                  onClick={handleDeleteConversation}
                  style={{
                    background: 'transparent',
                    border: '1px solid #2a3441',
                    color: '#8b98a5',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title="Delete Conversation"
                >
                  <Trash2 size={18} />
                </button>

                <button style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  border: '1px solid #667eea',
                  color: '#667eea',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: isMobile ? 'none' : 'block'
                }}>
                  <Lock size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                  AES-256
                </button>
                {selectedConversation.conversationType === 'group' && (
                  <button
                    style={{
                      background: 'transparent',
                      border: '1px solid #2a3441',
                      color: '#8b98a5',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    title="Group Settings"
                  >
                    <MoreVertical size={16} />
                  </button>
                )}
              </div>
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
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b98a5' }}>
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
                  <Lock size={48} color="#667eea" style={{ opacity: 0.3 }} />
                  <p style={{ color: '#8b98a5', margin: 0 }}>
                    Start a secure conversation
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <EnhancedMessageBubble
                    key={msg.id}
                    message={msg}
                    isOwn={msg.sender?.id === user?.id}
                    showAvatar={index === 0 || messages[index - 1].sender?.id !== msg.sender?.id}
                    currentUserId={user?.id}
                    conversationId={selectedChat}
                    onDelete={() => loadMessages(selectedChat, true)}
                    onReply={(msg) => setReplyingTo(msg)}
                    onForward={(msg) => { setForwardingMessage(msg); setShowForwardModal(true); }}
                    onEdit={(msg) => { setEditingMessage(msg); setMessageInput(msg.content); }}
                    isRead={(() => {
                      if (!msg.sender || msg.sender.id !== user?.id) return false;
                      const currentConv = conversations.find(c => c.id === selectedChat);
                      if (!currentConv) return false;
                      // For 1-1 chat read receipt
                      if (currentConv.conversationType === 'direct') {
                        const other = currentConv.members?.find(m => m.id !== user?.id);
                        return other?.lastReadAt && new Date(other.lastReadAt) >= new Date(msg.createdAt);
                      }
                      return false;
                    })()}
                  />
                ))
              )}
              {typingUsers.length > 0 && (
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'center',
                  paddingLeft: '44px'
                }}>
                  <div style={{
                    background: '#1a2332',
                    padding: '12px 16px',
                    borderRadius: '16px 16px 16px 4px',
                    color: '#8b98a5',
                    fontSize: '14px'
                  }}>
                    <span className="typing-dots">
                      {typingUsers.map(u => `${u.firstName}`).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{
              padding: '20px 30px',
              background: '#151f2e',
              borderTop: '1px solid #2a3441',
              flexShrink: 0
            }}>
              {/* Edit/Reply Preview */}
              {(replyingTo || editingMessage) && (
                <div style={{
                  background: 'rgba(102, 126, 234, 0.1)',
                  borderLeft: '3px solid #667eea',
                  padding: '8px 12px',
                  marginBottom: '10px',
                  borderRadius: '0 8px 8px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#667eea', marginBottom: '2px' }}>
                      {editingMessage ? 'Editing Message' : `Replying to ${replyingTo.sender?.firstName || 'User'}`}
                    </div>
                    <div style={{
                      fontSize: '13px',
                      color: '#8b98a5',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {editingMessage ? editingMessage.content : replyingTo.content}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setReplyingTo(null); setEditingMessage(null); if (editingMessage) setMessageInput(''); }}
                    style={{ background: 'transparent', border: 'none', color: '#8b98a5', cursor: 'pointer' }}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <div style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-end',
                position: 'relative'
              }}>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                    disabled={uploading}
                    style={{
                      background: uploading ? '#2a3441' : (showAttachmentMenu ? '#2a3441' : 'transparent'),
                      border: '1px solid #2a3441',
                      borderRadius: '12px',
                      width: '48px',
                      height: '48px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: uploading ? 'not-allowed' : 'pointer',
                      color: uploading ? '#4a5568' : '#8b98a5',
                      transition: 'all 0.2s'
                    }}
                    title="Attachments"
                  >
                    <Paperclip size={20} style={{ transform: showAttachmentMenu ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>

                  {showAttachmentMenu && (
                    <div style={{
                      position: 'absolute',
                      bottom: '60px',
                      left: '0',
                      background: '#1a2332',
                      border: '1px solid #2a3441',
                      borderRadius: '12px',
                      padding: '8px',
                      width: '180px',
                      boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                      zIndex: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <button
                        type="button"
                        onClick={handleFileClick}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '10px',
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2a3441'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <FileText size={16} color="#667eea" /> Upload from PC
                      </button>
                      <button
                        type="button"
                        onClick={startCamera}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '10px',
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2a3441'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <Camera size={16} color="#667eea" /> Take Photo
                      </button>
                      <button
                        type="button"
                        onClick={shareFromVault}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '10px',
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2a3441'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <Shield size={16} /> Share from Vault
                      </button>
                      <div style={{ height: '1px', background: '#2a3441', margin: '4px 0' }} />
                      <button
                        type="button"
                        onClick={handleShareLocation}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#fff',
                          padding: '10px',
                          textAlign: 'left',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2a3441'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <MapPin size={16} color="#667eea" /> Share Location
                      </button>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                <div style={{
                  flex: 1,
                  background: '#1a2332',
                  borderRadius: '12px',
                  border: '1px solid #2a3441',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Type a secure message..."
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#fff',
                      fontSize: '14px'
                    }}
                    disabled={sending}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending || uploading}
                  onClick={(e) => {
                    if (isRecording) {
                      e.preventDefault();
                      handleStopRecording();
                    } else if (!messageInput.trim()) {
                      e.preventDefault();
                      handleStartRecording();
                    }
                  }}
                  style={{
                    background: isRecording ? '#ef4444' : (messageInput.trim() && !sending ? '#667eea' : '#2a3441'),
                    border: 'none',
                    borderRadius: '12px',
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: (sending || uploading) ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    flexShrink: 0
                  }}
                >
                  {isRecording ? <Square size={20} fill="#fff" color="#fff" /> : (messageInput.trim() ? <Send size={20} color="#fff" /> : <Mic size={20} color="#fff" />)}
                </button>
              </div>
            </form>
          </>
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
            {activeTab === 'vault' ? (
              <div style={{ width: '100%', maxWidth: '1000px', flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <h2 style={{ color: '#fff', margin: 0, fontSize: '28px', fontWeight: '800' }}>Encrypted Vault</h2>
                    <p style={{ color: '#8b98a5', margin: '5px 0 0 0', fontSize: '14px' }}>Secure storage for your sensitive documents</p>
                  </div>
                  <button
                    onClick={handleFileClick}
                    style={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: '600',
                      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
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
                    background: '#151f2e',
                    borderRadius: '12px',
                    border: '1px solid #2a3441',
                    padding: '10px 15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Search size={18} color="#8b98a5" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={vaultSearch}
                      onChange={(e) => setVaultSearch(e.target.value)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        outline: 'none',
                        color: '#fff',
                        width: '100%',
                        fontSize: '14px'
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', background: '#151f2e', padding: '4px', borderRadius: '10px', border: '1px solid #2a3441' }}>
                    {['date', 'name', 'size'].map(sort => (
                      <button
                        key={sort}
                        onClick={() => setVaultSort(sort)}
                        style={{
                          background: vaultSort === sort ? '#2a3441' : 'transparent',
                          border: 'none',
                          color: vaultSort === sort ? '#fff' : '#8b98a5',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}
                      >
                        {sort}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{
                  background: '#151f2e',
                  borderRadius: '16px',
                  border: '1px solid #2a3441',
                  overflow: 'hidden',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {filesLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b98a5' }}>
                      <div className="loader"></div>
                      <span style={{ marginLeft: '12px' }}>Accessing secure storage...</span>
                    </div>
                  ) : (
                    <div style={{ overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ background: '#1a2332', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10 }}>
                            <th style={{ padding: '15px 20px', color: '#8b98a5', fontSize: '13px', fontWeight: '600' }}>File Name</th>
                            <th style={{ padding: '15px 20px', color: '#8b98a5', fontSize: '13px', fontWeight: '600' }}>Size</th>
                            <th style={{ padding: '15px 20px', color: '#8b98a5', fontSize: '13px', fontWeight: '600' }}>Created At</th>
                            <th style={{ padding: '15px 20px', color: '#8b98a5', fontSize: '13px', fontWeight: '600' }}></th>
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
                              <tr key={f.id} style={{ borderBottom: '1px solid #2a3441', transition: 'all 0.2s' }} className="vault-row">
                                <td style={{ padding: '15px 20px', color: '#fff' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                      width: '36px',
                                      height: '36px',
                                      background: 'rgba(102, 126, 234, 0.1)',
                                      borderRadius: '10px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}>
                                      <FileText size={18} color="#667eea" />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                      <div style={{ fontSize: '14px', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</div>
                                      <div style={{ fontSize: '11px', color: '#8b98a5' }}>AES-256 Encrypted</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '15px 20px', color: '#8b98a5', fontSize: '13px' }}>
                                  {(f.sizeBytes / 1024 / 1024).toFixed(2)} MB
                                </td>
                                <td style={{ padding: '15px 20px', color: '#8b98a5', fontSize: '13px' }}>
                                  {new Date(f.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => api.downloadFile(f.id, f.name)}
                                      style={{
                                        background: 'rgba(102, 126, 234, 0.1)',
                                        border: 'none',
                                        color: '#667eea',
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
                                      onClick={() => handleDeleteFile(f.id)}
                                      style={{
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        transition: 'all 0.2s'
                                      }}
                                      title="Delete"
                                    >
                                      <X size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                      {files.filter(f => f.name.toLowerCase().includes(vaultSearch.toLowerCase())).length === 0 && (
                        <div style={{ padding: '60px', textAlign: 'center' }}>
                          <Search size={48} color="#2a3441" style={{ marginBottom: '15px' }} />
                          <p style={{ color: '#8b98a5', margin: 0 }}>No files found matching your search</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
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
            )}
          </div>
        )}
      </div>

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
                  marginBottom: '20px'
                }}
              />
              <div style={{ marginBottom: '20px' }}>
                <div style={{ color: '#8b98a5', fontSize: '12px', marginBottom: '12px' }}>
                  Selected: {selectedMembers.length} members
                </div>
              </div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
              {availableUsers.map(u => (
                <div
                  key={u.id}
                  onClick={() => toggleMemberSelection(u.id)}
                  style={{
                    padding: '16px 20px',
                    cursor: 'pointer',
                    borderBottom: '1px solid #2a3441',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: selectedMembers.includes(u.id) ? '#1a2332' : 'transparent',
                    transition: 'background 0.2s'
                  }}
                >
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '6px',
                    border: `2px solid ${selectedMembers.includes(u.id) ? '#667eea' : '#2a3441'}`,
                    background: selectedMembers.includes(u.id) ? '#667eea' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}>
                    {selectedMembers.includes(u.id) && '✓'}
                  </div>
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

      {/* Calling Modal (Professional) */}
      {
        showCallModal && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: '#0a0f19',
            zIndex: 7000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '60px 20px',
            color: '#fff',
            overflow: 'hidden'
          }}>
            {/* Video Background (if applicable) */}
            {callType === 'video' && localStream && (
              <video
                ref={callVideoRef}
                autoPlay
                muted
                playsInline
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.4,
                  zIndex: -1,
                  transform: 'scaleX(-1)'
                }}
                onLoadedMetadata={(e) => {
                  e.target.srcObject = localStream;
                }}
              />
            )}

            <div style={{ textAlign: 'center', zIndex: 1, marginTop: '40px' }}>
              <div style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 25px',
                boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                fontSize: '48px',
                fontWeight: '800'
              }}>
                {selectedConversation ? getConversationAvatar(selectedConversation) : '?'}
              </div>
              <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
                {selectedConversation ? getConversationName(selectedConversation) : 'User'}
              </h2>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                color: '#667eea',
                fontWeight: '600'
              }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#667eea', animation: 'pulse 1.5s infinite' }}></span>
                {callStatus === 'ringing' ? 'Ringing...' : (callDuration > 0 ? formatDuration(callDuration) : 'Connected')}
              </div>
            </div>

            {/* Call Controls */}
            <div style={{
              zIndex: 1,
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)',
              padding: '25px 40px',
              borderRadius: '40px',
              display: 'flex',
              gap: '30px',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '40px'
            }}>
              <button
                onClick={() => setIsMuted(!isMuted)}
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: isMuted ? '#fff' : 'rgba(255,255,255,0.1)',
                  border: 'none',
                  color: isMuted ? '#000' : '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Phone size={24} style={{ transform: isMuted ? 'none' : 'rotate(135deg)' }} />
              </button>

              {callType === 'video' && (
                <button
                  onClick={() => setIsVideoOff(!isVideoOff)}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: isVideoOff ? '#fff' : 'rgba(255,255,255,0.1)',
                    border: 'none',
                    color: isVideoOff ? '#000' : '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Video size={24} />
                </button>
              )}

              <button
                onClick={async () => {
                  const chatId = selectedChat;
                  setShowCallModal(false);
                  setCallStatus('idle');
                  stopStream();
                  // Send signal if possible
                  if (chatId) {
                    try { await api.sendMessage(chatId, 'Call ended', 'call_end'); } catch (e) { }
                  }
                }}
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 20px rgba(239, 68, 68, 0.3)'
                }}
              >
                <X size={32} />
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
            background: 'rgba(10, 15, 25, 0.98)',
            backdropFilter: 'blur(30px)',
            zIndex: 8000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '45px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '40px',
              boxShadow: '0 0 60px rgba(102, 126, 234, 0.6)',
              animation: 'callPulse 1.5s infinite'
            }}>
              <span style={{ fontSize: '56px', color: '#fff', fontWeight: '800' }}>
                {incomingCall.from?.firstName?.charAt(0) || '?'}
              </span>
            </div>
            <h2 style={{ color: '#fff', fontSize: '32px', margin: '0 0 12px 0', fontWeight: '800' }}>
              {incomingCall.from?.firstName} {incomingCall.from?.lastName}
            </h2>
            <p style={{ color: '#667eea', fontSize: '20px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '3px' }}>
              Incoming {incomingCall.type} Call...
            </p>

            <div style={{ marginTop: '100px', display: 'flex', gap: '50px' }}>
              <button
                onClick={() => {
                  const callId = incomingCall.id;
                  handledCallsRef.current.add(callId);
                  setHandledCalls(prev => new Set(prev).add(callId));
                  setIncomingCall(null);
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '40px',
                  background: '#ef4444',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 15px 30px rgba(239, 68, 68, 0.4)'
                }}
              >
                <X size={36} />
              </button>
              <button
                onClick={async () => {
                  const callId = incomingCall.id;
                  const convId = incomingCall.conversationId;
                  const type = incomingCall.type;

                  // Mark as handled instantly to prevent loops
                  handledCallsRef.current.add(callId);
                  setHandledCalls(prev => new Set(prev).add(callId));

                  setSelectedChat(convId);
                  setCallType(type);
                  setCallStatus('connected');
                  setShowCallModal(true);
                  setIncomingCall(null);

                  // Send Accept signal to Caller
                  try {
                    await api.sendMessage(convId, 'Call accepted', 'call_accept');
                  } catch (e) {
                    console.error('Failed to send accept signal', e);
                  }

                  try {
                    const stream = await navigator.mediaDevices.getUserMedia({
                      video: type === 'video',
                      audio: true
                    });
                    setLocalStream(stream);
                    if (callVideoRef.current) {
                      callVideoRef.current.srcObject = stream;
                    }
                  } catch (e) {
                    console.error('Failed to get media for incoming call', e);
                  }
                }}
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '40px',
                  background: '#4caf50',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 15px 30px rgba(76, 175, 80, 0.4)'
                }}
              >
                {incomingCall.type === 'video' ? <Video size={36} /> : <Phone size={36} />}
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
  );
}

// HELPER COMPONENTS
function NavIcon({ icon, active, onClick, label }) {
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
        border: active ? '1px solid rgba(102, 126, 234, 0.3)' : '1px solid transparent'
      }}
    >
      {icon}
    </div>
  );
}

function ChatItem({ chat, active, onClick, getName, getAvatar, formatTime }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '15px 20px',
        cursor: 'pointer',
        background: active ? '#1a2332' : 'transparent',
        borderLeft: active ? '3px solid #667eea' : '3px solid transparent',
        transition: 'all 0.2s',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}
    >
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: '#667eea',
          borderRadius: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
          fontWeight: '700',
          color: '#fff'
        }}>
          {getAvatar(chat)}
        </div>
        {chat.encryptionRequired && (
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            background: '#0e1621',
            borderRadius: '50%',
            padding: '3px',
            display: 'flex'
          }}>
            <Lock size={12} color="#667eea" />
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h4 style={{
            margin: 0,
            color: '#fff',
            fontSize: '15px',
            fontWeight: '600',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {getName(chat)}
          </h4>
          <span style={{ color: '#8b98a5', fontSize: '12px', flexShrink: 0, marginLeft: '8px' }}>
            {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ''}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{
            margin: 0,
            color: '#8b98a5',
            fontSize: '13px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {chat.lastMessage?.content || 'No messages yet'}
          </p>
          {chat.unreadCount > 0 && (
            <div style={{
              background: '#667eea',
              borderRadius: '10px',
              padding: '2px 8px',
              fontSize: '11px',
              color: '#fff',
              fontWeight: '700',
              flexShrink: 0,
              marginLeft: '8px'
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
