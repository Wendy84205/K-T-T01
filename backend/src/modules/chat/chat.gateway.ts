import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ChatService } from './chat.service';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedUsers = new Map<string, string>(); // userId -> socketId

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;

            this.connectedUsers.set(userId, client.id);
            client.data.userId = userId;

            console.log(`[ChatGateway] User connected: ${userId} (${client.id})`);

            // Join a room specifically for this user to handle private notifications
            client.join(`user_${userId}`);

            // Broadcast online status
            this.server.emit('user-status', { userId, status: 'online' });
        } catch (err) {
            console.error('[ChatGateway] Connection error:', err.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            this.connectedUsers.delete(userId);
            console.log(`[ChatGateway] User disconnected: ${userId}`);
            // Broadcast offline status
            this.server.emit('user-status', { userId, status: 'offline' });
        }
    }

    @SubscribeMessage('get-online-users')
    handleGetOnlineUsers() {
        return Array.from(this.connectedUsers.keys());
    }

    @SubscribeMessage('joinConversation')
    handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        client.join(`conv_${data.conversationId}`);
        return { event: 'joinedConversation', data: { conversationId: data.conversationId } };
    }

    @SubscribeMessage('leaveConversation')
    handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        client.leave(`conv_${data.conversationId}`);
        return { event: 'leftConversation', data: { conversationId: data.conversationId } };
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, isTyping: boolean },
    ) {
        const userId = client.data.userId;
        const typingUsers = this.chatService.setTyping(data.conversationId, userId, data.isTyping);

        // Broadcast to the conversation room (except the sender)
        client.to(`conv_${data.conversationId}`).emit('userTyping', {
            conversationId: data.conversationId,
            userId,
            isTyping: data.isTyping,
        });
    }

    // Help method to emit new messages to relevant rooms
    emitNewMessage(conversationId: string, message: any) {
        this.server.to(`conv_${conversationId}`).emit('newMessage', message);

        // Also notify users in the conversation who are not currently in the room
        this.server.emit('notification', {
            type: 'NEW_MESSAGE',
            conversationId,
            messagePreview: message.content,
            senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        });
    }

    // --- WEBRTC SIGNALING ---

    private activeCalls = new Map<string, string>(); // conversationId -> callLogId

    @SubscribeMessage('call-invite')
    async handleCallInvite(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, offer: any, type: 'voice' | 'video' },
    ) {
        const userId = client.data.userId;

        // Log the call
        const log = await this.chatService.createCallLog({
            conversationId: data.conversationId,
            callerId: userId,
            callType: data.type,
            status: 'ringing',
            startTime: new Date()
        });
        this.activeCalls.set(data.conversationId, log.id);

        // Broadcast to all members in their private user rooms
        const members = await this.chatService.getConversationMembers(data.conversationId);
        for (const member of members) {
            if (member.userId !== userId) {
                this.server.to(`user_${member.userId}`).emit('call-made', {
                    offer: data.offer,
                    conversationId: data.conversationId,
                    callerId: userId,
                    type: data.type
                });
            }
        }
    }

    @SubscribeMessage('call-response')
    async handleCallResponse(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, answer: any, accepted: boolean },
    ) {
        if (data.accepted) {
            const logId = this.activeCalls.get(data.conversationId);
            if (logId) {
                await this.chatService.updateCallLog(logId, {
                    status: 'connected',
                    startTime: new Date() // Reset start time to when actually connected
                });
            }
        } else {
            const logId = this.activeCalls.get(data.conversationId);
            if (logId) {
                await this.chatService.updateCallLog(logId, { status: 'declined' });
                this.activeCalls.delete(data.conversationId);
            }
        }

        // Broadcast answer to the caller and other participants in their private rooms
        const members = await this.chatService.getConversationMembers(data.conversationId);
        for (const member of members) {
            if (member.userId !== client.data.userId) {
                this.server.to(`user_${member.userId}`).emit('call-answered', {
                    answer: data.answer,
                    accepted: data.accepted,
                    conversationId: data.conversationId
                });
            }
        }
    }

    @SubscribeMessage('ice-candidate')
    handleIceCandidate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, candidate: any },
    ) {
        // Send ICE candidate to all other participants' private rooms
        this.chatService.getConversationMembers(data.conversationId).then(members => {
            for (const member of members) {
                if (member.userId !== client.data.userId) {
                    this.server.to(`user_${member.userId}`).emit('ice-candidate', {
                        candidate: data.candidate,
                        conversationId: data.conversationId
                    });
                }
            }
        });
    }

    @SubscribeMessage('hang-up')
    async handleHangUp(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        const logId = this.activeCalls.get(data.conversationId);
        if (logId) {
            const endTime = new Date();
            const log = await this.chatService.updateCallLog(logId, {
                endTime,
                status: 'completed'
            });

            if (log && log.startTime) {
                const duration = Math.floor((endTime.getTime() - log.startTime.getTime()) / 1000);
                await this.chatService.updateCallLog(logId, { duration });
            }
            this.activeCalls.delete(data.conversationId);
        }

        // Notify all members that the call has ended
        const members = await this.chatService.getConversationMembers(data.conversationId);
        for (const member of members) {
            if (member.userId !== client.data.userId) {
                this.server.to(`user_${member.userId}`).emit('call-ended', {
                    conversationId: data.conversationId
                });
            }
        }
    }

    // --- REACTIONS ---

    @SubscribeMessage('message-reaction')
    handleMessageReaction(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, messageId: string, reaction: string },
    ) {
        const userId = client.data.userId;
        // Broadcast the reaction to all users in the conversation
        this.server.to(`conv_${data.conversationId}`).emit('reaction-updated', {
            messageId: data.messageId,
            reaction: data.reaction,
            userId
        });
    }
}
