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
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { ChatService } from './chat.service';
import { ConversationMember } from '../../database/entities/chat/conversation-member.entity';

// FIX LỖ HỔNG 3: Đổi Map<string, string> -> Map<string, Set<string>>
// để hỗ trợ nhiều thiết bị cùng lúc và tránh Race Condition Online/Offline
// FIX LỖ HỔNG 12: Đồng bộ CORS WebSocket Gateway với cấu hình CORS ở main.ts
// Trước đây: origin: true → wildcard, cho phép bất kỳ domain nào kết nối WS
const wsAllowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim());

@WebSocketGateway({
    cors: {
        origin: (origin: string, callback: (err: Error | null, allow?: boolean) => void) => {
            // Cho phép kết nối không có Origin (Postman, server-to-server)
            if (!origin) return callback(null, true);
            if (wsAllowedOrigins.includes(origin)) return callback(null, true);
            return callback(new Error(`WS CORS: Origin '${origin}' is not allowed`), false);
        },
        credentials: true,
    },
    transports: ['polling', 'websocket'],
    allowUpgrades: true,
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    // FIX LỖ HỔNG 3: Đổi sang Set<string> để lưu nhiều socketId cho 1 userId
    private connectedUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>

    constructor(
        private readonly jwtService: JwtService,
        private readonly chatService: ChatService,
        // FIX LỖ HỔNG 1 & 4: Inject ConversationMemberRepository để kiểm tra quyền
        @InjectRepository(ConversationMember)
        private readonly memberRepo: Repository<ConversationMember>,
    ) { }

    // FIX LỖ HỔNG 1 & 4: Helper method tái sử dụng để kiểm tra tư cách thành viên
    private async isUserMemberOf(userId: string, conversationId: string): Promise<boolean> {
        if (!userId || !conversationId) return false;
        const member = await this.memberRepo.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });
        return !!member;
    }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }

            const payload = this.jwtService.verify(token);
            const userId = payload.sub;
            client.data.userId = userId;

            // FIX LỖ HỔNG 3: Thêm socketId vào Set thay vì ghi đè
            if (!this.connectedUsers.has(userId)) {
                this.connectedUsers.set(userId, new Set());
            }
            this.connectedUsers.get(userId).add(client.id);

            console.log(`[ChatGateway] User connected: ${userId} (${client.id}) — total sockets: ${this.connectedUsers.get(userId).size}`);

            client.join(`user_${userId}`);

            // FIX LỖ HỔNG 3: Chỉ broadcast 'online' khi đây là thiết bị ĐẦU TIÊN kết nối
            if (this.connectedUsers.get(userId).size === 1) {
                this.server.emit('user-status', { userId, status: 'online' });
            }
        } catch (err) {
            console.error('[ChatGateway] Connection error:', err.message);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        const userId = client.data.userId;
        if (userId) {
            const sockets = this.connectedUsers.get(userId);
            if (sockets) {
                sockets.delete(client.id);
                console.log(`[ChatGateway] User ${userId} socket ${client.id} disconnected — remaining: ${sockets.size}`);

                // FIX LỖ HỔNG 3: Chỉ broadcast 'offline' khi TẤT CẢ thiết bị đã ngắt kết nối
                if (sockets.size === 0) {
                    this.connectedUsers.delete(userId);
                    this.server.emit('user-status', { userId, status: 'offline' });
                    console.log(`[ChatGateway] User ${userId} is now fully offline`);
                }
            }
        }
    }

    @SubscribeMessage('get-online-users')
    handleGetOnlineUsers() {
        // FIX LỖ HỔNG 3: keys() vẫn trả về unique userId list vì Map dùng userId làm key
        return Array.from(this.connectedUsers.keys());
    }

    @SubscribeMessage('joinConversation')
    async handleJoinConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        const userId = client.data.userId;

        // FIX LỖ HỔNG 1: Kiểm tra quyền thành viên TRƯỚC KHI cho vào phòng
        if (!userId) {
            client.emit('error', { message: 'Unauthorized' });
            return;
        }

        // FIX LỖ HỔNG 11: Validate input đầu vào — chặn conversationId null/rỗng/sai kiểu
        if (!data?.conversationId || typeof data.conversationId !== 'string' || !data.conversationId.trim()) {
            client.emit('error', { message: 'Invalid conversationId' });
            return;
        }

        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) {
            console.warn(`[ChatGateway] SECURITY: User ${userId} tried to join unauthorized conversation ${data.conversationId}`);
            client.emit('error', { message: 'Access denied: not a member of this conversation' });
            return;
        }

        client.join(`conv_${data.conversationId}`);
        return { event: 'joinedConversation', data: { conversationId: data.conversationId } };
    }

    @SubscribeMessage('leaveConversation')
    async handleLeaveConversation(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        const userId = client.data.userId;

        // FIX LỖ HỔNG 4: Xác thực user trước khi thực thi
        if (!userId) return;

        // FIX LỖ HỔNG 11: Validate input — chặn conversationId bất thường
        if (!data?.conversationId || typeof data.conversationId !== 'string' || !data.conversationId.trim()) return;

        client.leave(`conv_${data.conversationId}`);
        return { event: 'leftConversation', data: { conversationId: data.conversationId } };
    }

    @SubscribeMessage('typing')
    async handleTyping(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, isTyping: boolean },
    ) {
        // FIX LỖ HỔNG 4: Lấy userId từ server-side session, KHÔNG tin data từ client
        const userId = client.data.userId;
        if (!userId) return;

        // FIX LỖ HỔNG 11: Validate input — chặn dữ liệu thô bất thường từ client
        if (!data?.conversationId || typeof data.conversationId !== 'string' || !data.conversationId.trim()) return;
        if (typeof data.isTyping !== 'boolean') return;

        // FIX LỖ HỔNG 4: Kiểm tra quyền thành viên trước khi broadcast typing
        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) return;

        this.chatService.setTyping(data.conversationId, userId, data.isTyping);

        client.to(`conv_${data.conversationId}`).emit('userTyping', {
            conversationId: data.conversationId,
            userId,
            isTyping: data.isTyping,
        });
    }

    // Help method to emit new messages to relevant rooms
    emitNewMessage(conversationId: string, message: any) {
        this.server.to(`conv_${conversationId}`).emit('newMessage', message);

        // FIX LỖ HỔNG 2: Xóa messagePreview khỏi notification broadcast toàn cầu
        // để tránh rò rỉ nội dung tin nhắn cho người dùng không liên quan
        this.server.emit('notification', {
            type: 'NEW_MESSAGE',
            conversationId,
            // messagePreview: message.content, // ĐÃ XÓA - Đây là nguồn rò rỉ dữ liệu
            senderName: `${message.sender?.firstName ?? ''} ${message.sender?.lastName ?? ''}`.trim(),
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
        if (!userId) return;

        // FIX LỖ HỔNG 4: Kiểm tra quyền thành viên trước khi khởi tạo cuộc gọi
        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) {
            client.emit('call-error', { message: 'Not authorized to call in this conversation' });
            return;
        }

        const log = await this.chatService.createCallLog({
            conversationId: data.conversationId,
            callerId: userId,
            callType: data.type,
            status: 'ringing',
            startTime: new Date()
        });
        this.activeCalls.set(data.conversationId, log.id);

        console.log(`[ChatGateway] Call invite from ${userId} for conversation ${data.conversationId}`);

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
        const userId = client.data.userId;
        if (!userId) return;

        // FIX LỖ HỔNG 4: Kiểm tra quyền trước khi xử lý phản hồi cuộc gọi
        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) return;

        if (data.accepted) {
            const logId = this.activeCalls.get(data.conversationId);
            if (logId) {
                await this.chatService.updateCallLog(logId, {
                    status: 'connected',
                    startTime: new Date()
                });
            }
        } else {
            const logId = this.activeCalls.get(data.conversationId);
            if (logId) {
                await this.chatService.updateCallLog(logId, { status: 'declined' });
                this.activeCalls.delete(data.conversationId);
            }
        }

        const members = await this.chatService.getConversationMembers(data.conversationId);
        for (const member of members) {
            if (member.userId !== userId) {
                this.server.to(`user_${member.userId}`).emit('call-answered', {
                    answer: data.answer,
                    accepted: data.accepted,
                    conversationId: data.conversationId
                });
            }
        }
    }

    @SubscribeMessage('ice-candidate')
    async handleIceCandidate(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, candidate: any },
    ) {
        const userId = client.data.userId;
        if (!userId) return;

        // FIX LỖ HỔNG 4: Kiểm tra quyền trên ICE candidate (tránh leak WebRTC data)
        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) return;

        const members = await this.chatService.getConversationMembers(data.conversationId);
        for (const member of members) {
            if (member.userId !== userId) {
                this.server.to(`user_${member.userId}`).emit('ice-candidate', {
                    candidate: data.candidate,
                    conversationId: data.conversationId
                });
            }
        }
    }

    @SubscribeMessage('hang-up')
    async handleHangUp(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string },
    ) {
        const userId = client.data.userId;
        if (!userId) return;

        // FIX LỖ HỔNG 4: Kiểm tra quyền thành viên trước khi kết thúc cuộc gọi
        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) return;

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

        const members = await this.chatService.getConversationMembers(data.conversationId);
        for (const member of members) {
            if (member.userId !== userId) {
                this.server.to(`user_${member.userId}`).emit('call-ended', {
                    conversationId: data.conversationId
                });
            }
        }
    }

    // --- REACTIONS ---

    @SubscribeMessage('message-reaction')
    async handleMessageReaction(
        @ConnectedSocket() client: Socket,
        @MessageBody() data: { conversationId: string, messageId: string, reaction: string },
    ) {
        const userId = client.data.userId;
        if (!userId) return;

        // FIX LỖ HỔNG 11: Validate tất cả các field đầu vào của handler
        if (!data?.conversationId || typeof data.conversationId !== 'string' || !data.conversationId.trim()) return;
        if (!data?.messageId || typeof data.messageId !== 'string' || !data.messageId.trim()) return;
        if (!data?.reaction || typeof data.reaction !== 'string' || data.reaction.length > 10) return;

        // FIX LỖ HỔNG 4: Kiểm tra quyền thành viên trước khi broadcast reaction
        const allowed = await this.isUserMemberOf(userId, data.conversationId);
        if (!allowed) return;

        this.server.to(`conv_${data.conversationId}`).emit('reaction-updated', {
            messageId: data.messageId,
            reaction: data.reaction,
            userId
        });
    }
}
