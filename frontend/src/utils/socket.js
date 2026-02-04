/* Fallback Socket Service using window.io */

class SocketService {
    constructor() {
        this.socket = null;
        this.userId = null;
    }

    async connect(token, userId) {
        if (this.socket) {
            this.socket.disconnect();
        }

        this.userId = userId;
        const socketUrl = window.location.origin;

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
                transports: ['websocket', 'polling'],
            });

            this.socket.on('connect', () => {
                console.log('[Socket] Connected to gateway');
            });

            this.socket.on('connect_error', (err) => {
                console.error('[Socket] Connection error:', err.message);
            });
        }

        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.removeListeners();
            this.socket.disconnect();
            this.socket = null;
        }
    }

    removeListeners() {
        if (this.socket) {
            this.socket.off('newMessage');
            this.socket.off('userTyping');
            this.socket.off('notification');
            this.socket.off('call-made');
            this.socket.off('call-answered');
            this.socket.off('ice-candidate');
            this.socket.off('call-ended');
            this.socket.off('reaction-updated');
            this.socket.off('user-status');
        }
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
        if (this.socket) {
            this.socket.on('newMessage', callback);
        }
    }

    onUserTyping(callback) {
        if (this.socket) {
            this.socket.on('userTyping', callback);
        }
    }

    onNotification(callback) {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    // --- WebRTC Signaling ---

    sendCallInvite(conversationId, offer, type = 'voice') {
        if (this.socket) {
            this.socket.emit('call-invite', { conversationId, offer, type });
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
        if (this.socket) {
            this.socket.on('call-made', callback);
        }
    }

    onCallAnswered(callback) {
        if (this.socket) {
            this.socket.on('call-answered', callback);
        }
    }

    onIceCandidate(callback) {
        if (this.socket) {
            this.socket.on('ice-candidate', callback);
        }
    }

    onCallEnded(callback) {
        if (this.socket) {
            this.socket.on('call-ended', callback);
        }
    }

    // --- Reactions ---

    sendMessageReaction(conversationId, messageId, reaction) {
        if (this.socket) {
            this.socket.emit('message-reaction', { conversationId, messageId, reaction });
        }
    }

    onReactionUpdated(callback) {
        if (this.socket) {
            this.socket.on('reaction-updated', callback);
        }
    }

    onUserStatus(callback) {
        if (this.socket) {
            this.socket.on('user-status', callback);
        }
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
