/* Fallback Socket Service using window.io */
import { BACKEND_URL } from '../config';

class SocketService {
    constructor() {
        this.socket = null;
        this.userId = null;
        // Store all registered callbacks so we can re-register them on reconnect
        this._callbacks = {};
    }

    async connect(token, userId) {
        // If already connected with same user, skip to avoid re-connection loop
        if (this.socket && this.socket.connected && this.userId === userId) {
            console.log('[Socket] Already connected, skipping reconnect');
            return this.socket;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }

        this.userId = userId;
        const socketUrl = BACKEND_URL;

        // Try to get io from window first (loaded via index.html script tag)
        let io = window.io;

        if (!io) {
            console.warn('[Socket] window.io not found, attempting dynamic import...');
            try {
                const module = await import('socket.io-client');
                io = module.io;
            } catch (err) {
                console.error('[Socket] Failed to load socket.io-client via both script tag and dynamic import', err);
                return null;
            }
        }

        if (io) {
            this.socket = io(socketUrl, {
                auth: { token },
                transports: ['polling'], // Force polling ONLY for Cloudflare Tunnel compatibility
                upgrade: false,
                reconnectionAttempts: 10,
                reconnectionDelay: 2000,
                timeout: 20000,
            });

            this.socket.on('connect', () => {
                console.log('[Socket] Connected to gateway:', this.socket.id);
                // Re-register all stored callbacks on reconnect
                this._reRegisterCallbacks();
            });

            this.socket.on('connect_error', (err) => {
                console.error('[Socket] Connection error:', err.message);
            });

            this.socket.on('disconnect', (reason) => {
                console.warn('[Socket] Disconnected:', reason);
            });
        }

        return this.socket;
    }

    // Store and register a callback for an event
    _on(event, callback) {
        this._callbacks[event] = callback;
        if (this.socket) {
            this.socket.off(event); // remove old listener first
            this.socket.on(event, callback);
        }
    }

    // Re-register all stored callbacks onto the current socket
    _reRegisterCallbacks() {
        Object.entries(this._callbacks).forEach(([event, callback]) => {
            if (this.socket) {
                this.socket.off(event);
                this.socket.on(event, callback);
                console.log('[Socket] Re-registered listener for:', event);
            }
        });
    }

    disconnect() {
        this._callbacks = {};
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    removeListeners() {
        if (this.socket) {
            Object.keys(this._callbacks).forEach(event => {
                this.socket.off(event);
            });
        }
        this._callbacks = {};
    }

    joinConversation(conversationId) {
        if (this.socket) {
            this.socket.emit('joinConversation', { conversationId });
        }
    }

    leaveConversation(conversationId) {
        if (this.socket) {
            this.socket.emit('leaveConversation', { conversationId });
        }
    }

    sendTyping(conversationId, isTyping) {
        if (this.socket) {
            this.socket.emit('typing', { conversationId, isTyping });
        }
    }

    onNewMessage(callback) {
        this._on('newMessage', callback);
    }

    onUserTyping(callback) {
        this._on('userTyping', callback);
    }

    onNotification(callback) {
        this._on('notification', callback);
    }

    onMessageDeleted(callback) {
        this._on('message_deleted', callback);
    }

    // --- WebRTC Signaling ---

    sendCallInvite(conversationId, offer, type = 'voice') {
        if (this.socket) {
            console.log('[Socket] Sending call-invite to conversation:', conversationId);
            this.socket.emit('call-invite', { conversationId, offer, type });
        } else {
            console.error('[Socket] Cannot send call-invite: socket is null or disconnected!');
        }
    }

    sendCallResponse(conversationId, answer, accepted) {
        if (this.socket) {
            this.socket.emit('call-response', { conversationId, answer, accepted });
        }
    }

    sendIceCandidate(conversationId, candidate) {
        if (this.socket) {
            this.socket.emit('ice-candidate', { conversationId, candidate });
        }
    }

    sendHangUp(conversationId) {
        if (this.socket) {
            this.socket.emit('hang-up', { conversationId });
        }
    }

    onCallMade(callback) {
        console.log('[Socket] Registering call-made listener');
        this._on('call-made', callback);
    }

    onCallAnswered(callback) {
        this._on('call-answered', callback);
    }

    onIceCandidate(callback) {
        this._on('ice-candidate', callback);
    }

    onCallEnded(callback) {
        this._on('call-ended', callback);
    }

    // --- Reactions ---

    sendMessageReaction(conversationId, messageId, reaction) {
        if (this.socket) {
            this.socket.emit('message-reaction', { conversationId, messageId, reaction });
        }
    }

    onReactionUpdated(callback) {
        this._on('reaction-updated', callback);
    }

    onUserStatus(callback) {
        this._on('user-status', callback);
    }

    getOnlineUsers() {
        return new Promise((resolve) => {
            if (this.socket) {
                this.socket.emit('get-online-users', (users) => {
                    resolve(users);
                });
            } else {
                resolve([]);
            }
        });
    }
}

const socketService = new SocketService();
export default socketService;
