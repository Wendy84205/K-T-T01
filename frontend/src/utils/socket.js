/* Fallback Socket Service using window.io */
import { BACKEND_URL } from '../config';

class SocketService {
    constructor() {
        this.socket = null;
        this.userId = null;
        // Store all registered callbacks: event -> array of callbacks
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

    /**
     * Register a SINGLE authoritative callback for an event.
     * Overwrites any previous callback registered under the same key.
     * Used for events where only one handler should exist (e.g. typing, newMessage).
     */
    _on(event, callback) {
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }
        // Replace any existing entry with the same key (single-owner events)
        this._callbacks[event] = [{ key: event, fn: callback }];
        if (this.socket) {
            this.socket.off(event);
            this.socket.on(event, callback);
        }
    }

    /**
     * Register a NAMED callback for an event, allowing multiple subscribers.
     * Use this for call events where both CallContext and UserHomePage need to listen.
     * @param {string} event - Socket event name
     * @param {string} key   - Unique key for this handler (e.g. 'context', 'homepage')
     * @param {Function} callback
     */
    _onNamed(event, key, callback) {
        if (!this._callbacks[event]) {
            this._callbacks[event] = [];
        }
        // Remove any existing entry with the same key, then add new one
        this._callbacks[event] = this._callbacks[event].filter(c => c.key !== key);
        this._callbacks[event].push({ key, fn: callback });

        if (this.socket) {
            // Remove old combined listener and re-attach a combined one
            this.socket.off(event);
            this.socket.on(event, (...args) => {
                (this._callbacks[event] || []).forEach(c => c.fn(...args));
            });
        }
    }

    /**
     * Remove a named callback for an event.
     */
    _offNamed(event, key) {
        if (this._callbacks[event]) {
            this._callbacks[event] = this._callbacks[event].filter(c => c.key !== key);
        }
        if (this.socket) {
            this.socket.off(event);
            if (this._callbacks[event] && this._callbacks[event].length > 0) {
                this.socket.on(event, (...args) => {
                    (this._callbacks[event] || []).forEach(c => c.fn(...args));
                });
            }
        }
    }

    // Re-register all stored callbacks onto the current socket
    _reRegisterCallbacks() {
        const seen = new Set();
        Object.entries(this._callbacks).forEach(([event, entries]) => {
            if (!this.socket || seen.has(event)) return;
            seen.add(event);
            this.socket.off(event);
            if (entries.length === 1) {
                // Single handler – register directly
                this.socket.on(event, entries[0].fn);
            } else if (entries.length > 1) {
                // Multiple handlers – combine
                this.socket.on(event, (...args) => {
                    (this._callbacks[event] || []).forEach(c => c.fn(...args));
                });
            }
            console.log(`[Socket] Re-registered ${entries.length} listener(s) for:`, event);
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

    onTaskAssigned(callback) {
        this._on('task-assigned', callback);
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

    /**
     * Register a call-made listener with an optional subscriber key.
     * Multiple components can subscribe simultaneously.
     */
    onCallMade(callback, key = 'default') {
        console.log(`[Socket] Registering call-made listener [${key}]`);
        this._onNamed('call-made', key, callback);
    }

    offCallMade(key = 'default') {
        this._offNamed('call-made', key);
    }

    onCallAnswered(callback, key = 'default') {
        this._onNamed('call-answered', key, callback);
    }

    offCallAnswered(key = 'default') {
        this._offNamed('call-answered', key);
    }

    onIceCandidate(callback, key = 'default') {
        this._onNamed('ice-candidate', key, callback);
    }

    offIceCandidate(key = 'default') {
        this._offNamed('ice-candidate', key);
    }

    /**
     * Register a call-ended listener with an optional subscriber key.
     */
    onCallEnded(callback, key = 'default') {
        this._onNamed('call-ended', key, callback);
    }

    offCallEnded(key = 'default') {
        this._offNamed('call-ended', key);
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
