import { Injectable, NotFoundException, ForbiddenException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not, Like, LessThan } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Conversation } from '../../database/entities/chat/conversation.entity';
import { Message } from '../../database/entities/chat/message.entity';
import { ConversationMember } from '../../database/entities/chat/conversation-member.entity';
import { MessageReaction } from '../../database/entities/chat/message-reaction.entity';
import { PinnedMessage } from '../../database/entities/chat/pinned-message.entity';
import { CallLog } from '../../database/entities/chat/call-log.entity';
import { User } from '../../database/entities/core/user.entity';

import { EncryptionService } from '../../common/service/encryption.service';

@Injectable()
export class ChatService implements OnModuleInit {
    constructor(
        @InjectRepository(Conversation)
        private conversationRepository: Repository<Conversation>,

        @InjectRepository(Message)
        private messageRepository: Repository<Message>,

        @InjectRepository(ConversationMember)
        private conversationMemberRepository: Repository<ConversationMember>,

        @InjectRepository(MessageReaction)
        private messageReactionRepository: Repository<MessageReaction>,

        @InjectRepository(PinnedMessage)
        private pinnedMessageRepository: Repository<PinnedMessage>,

        @InjectRepository(CallLog)
        private callLogRepository: Repository<CallLog>,

        @InjectRepository(User)
        private userRepository: Repository<User>,

        private encryptionService: EncryptionService,
        // FIX LỖ HỔNG 5: Inject ConfigService để đọc CHAT_MASTER_KEY từ .env
        private configService: ConfigService,
    ) { }

    onModuleInit() {
        // Run cleanup every 10 seconds
        setInterval(() => this.cleanupExpiredMessages(), 10000);
    }

    private async cleanupExpiredMessages() {
        try {
            const now = new Date();
            const expired = await this.messageRepository.find({
                where: {
                    expiresAt: LessThan(now),
                    isDeleted: false
                }
            });

            if (expired.length > 0) {
                console.log(`[Chat] Cleaning up ${expired.length} expired messages`);
                for (const msg of expired) {
                    msg.isDeleted = true;
                    msg.deleteReason = 'Self-destructed';
                }
                await this.messageRepository.save(expired);
            }
        } catch (error) {
            console.error('[Chat] Cleanup error:', error);
        }
    }

    // FIX LỖ HỔNG 5: Đọc key từ biến môi trường thay vì hardcode
    // Key cũ là SHA-256 của '123456' — bất kỳ ai cũng có thể khai thác
    private get chatMasterKey(): Buffer {
        const hexKey = this.configService.get<string>('CHAT_MASTER_KEY');
        if (!hexKey) {
            throw new Error('[ChatService] CRITICAL: CHAT_MASTER_KEY is not set in environment variables. Cannot encrypt/decrypt messages.');
        }
        return Buffer.from(hexKey, 'hex');
    }

    // Typing indicators (in-memory, use Redis in production)
    private typingUsers = new Map<string, Set<string>>();

    // Get all conversations for a user
    async getUserConversations(userId: string) {
        console.log(`[Chat] Fetching conversations for user: ${userId}`);
        const memberships = await this.conversationMemberRepository.find({
            where: { userId, leftAt: IsNull() },
            relations: ['conversation'],
        });

        const conversationIds = memberships.map(m => m.conversationId);
        console.log(`[Chat] Found ${conversationIds.length} memberships for user: ${userId}`);

        if (conversationIds.length === 0) {
            return [];
        }

        const conversations = await this.conversationRepository
            .createQueryBuilder('conv')
            .where('conv.id IN (:...ids)', { ids: conversationIds })
            .leftJoinAndSelect('conv.creator', 'creator')
            .orderBy('conv.lastMessageAt', 'DESC')
            .addOrderBy('conv.createdAt', 'DESC')
            .getMany();

        console.log(`[Chat] Query found ${conversations.length} conversation entities`);

        const conversationsWithDetails = await Promise.all(
            conversations.map(async (conv) => {
                const lastMessage = await this.messageRepository.findOne({
                    where: { conversationId: conv.id, isDeleted: false },
                    order: { createdAt: 'DESC' },
                    relations: ['sender'],
                });

                const members = await this.conversationMemberRepository.find({
                    where: { conversationId: conv.id, leftAt: IsNull() },
                    relations: ['user'],
                });

                const unreadCount = await this.messageRepository
                    .createQueryBuilder('msg')
                    .innerJoin(ConversationMember, 'cm', 'cm.conversation_id = msg.conversation_id AND cm.user_id = :userId', { userId })
                    .where('msg.conversation_id = :convId', { convId: conv.id })
                    .andWhere('msg.sender_id != :userId', { userId })
                    .andWhere('msg.is_deleted = false')
                    .andWhere('msg.created_at > cm.last_read_at')
                    .getCount();

                return this.mapConversationDetails(conv, userId, members, lastMessage, unreadCount);
            })
        );

        return conversationsWithDetails;
    }

    async getConversationMembers(conversationId: string) {
        return await this.conversationMemberRepository.find({
            where: { conversationId, leftAt: IsNull() },
            relations: ['user'],
        });
    }

    private async mapConversationDetails(conv: any, userId: string, members: any[], lastMessage: any, unreadCount: number) {
        let otherUser = null;
        if (conv.conversationType === 'direct') {
            const otherMember = members.find(m => m.userId !== userId);
            if (otherMember) {
                otherUser = otherMember.user;
            }
        }

        return {
            ...conv,
            lastMessage: lastMessage ? {
                id: lastMessage.id,
                content: this.decryptIfNeeded(lastMessage),
                messageType: lastMessage.messageType,
                createdAt: lastMessage.createdAt,
                sender: lastMessage.sender ? {
                    id: lastMessage.sender.id,
                    firstName: lastMessage.sender.firstName,
                    lastName: lastMessage.sender.lastName,
                } : null,
            } : null,
            members: members.map(m => ({
                id: m.user?.id,
                firstName: m.user?.firstName,
                lastName: m.user?.lastName,
                email: m.user?.email,
                avatarUrl: m.user?.avatarUrl,
                publicKey: m.user?.publicKey,
                role: m.role,
                lastReadAt: m.lastReadAt,
            })),
            otherUser: otherUser ? {
                id: otherUser.id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                email: otherUser.email,
                avatarUrl: otherUser.avatarUrl,
                publicKey: otherUser.publicKey,
            } : null,
            unreadCount,
        };
    }

    private decryptIfNeeded(message: any): string {
        if (message.isEncrypted && message.encryptedContent && message.initializationVector && message.authTag) {
            try {
                // Try with current securely injected CHAT_MASTER_KEY
                return this.encryptionService.decryptText(
                    message.encryptedContent,
                    this.chatMasterKey,
                    message.initializationVector,
                    message.authTag
                );
            } catch (e) {
                // FALLBACK: Legacy hardcoded key (SHA-256 of '123456') used before LỖ HỔNG 5 was fixed
                // This allows old database messages to remain readable after the key rotation
                try {
                    const legacyKey = Buffer.from('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'hex');
                    return this.encryptionService.decryptText(
                        message.encryptedContent,
                        legacyKey,
                        message.initializationVector,
                        message.authTag
                    );
                } catch (legacyError) {
                    console.error(`[Chat] Decryption failed for message ${message.id} with both new & legacy keys:`, legacyError.message);
                    return '[Encrypted Message]';
                }
            }
        }
        return message.content;
    }

    private async getSingleConversationDetails(conversationId: string, userId: string) {
        const conv = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator']
        });
        if (!conv) return null;

        const lastMessage = await this.messageRepository.findOne({
            where: { conversationId: conv.id, isDeleted: false },
            order: { createdAt: 'DESC' },
            relations: ['sender'],
        });

        const members = await this.conversationMemberRepository.find({
            where: { conversationId: conv.id, leftAt: IsNull() },
            relations: ['user'],
        });

        const unreadCount = await this.messageRepository
            .createQueryBuilder('msg')
            .innerJoin(ConversationMember, 'cm', 'cm.conversation_id = msg.conversation_id AND cm.user_id = :userId', { userId })
            .where('msg.conversation_id = :conversationId', { conversationId })
            .andWhere('msg.sender_id != :userId', { userId })
            .andWhere('msg.is_deleted = false')
            .andWhere('msg.created_at > cm.last_read_at')
            .getCount();

        return this.mapConversationDetails(conv, userId, members, lastMessage, unreadCount);
    }

    // Get or create direct conversation
    async getOrCreateDirectConversation(userId1: string, userId2: string) {
        const member1Convs = await this.conversationMemberRepository.find({
            where: { userId: userId1, leftAt: IsNull() },
        });

        const member2Convs = await this.conversationMemberRepository.find({
            where: { userId: userId2, leftAt: IsNull() },
        });

        const conversationIds1 = member1Convs.map(m => m.conversationId);
        const conversationIds2 = member2Convs.map(m => m.conversationId);

        const sharedConvIds = conversationIds1.filter(id => conversationIds2.includes(id));

        if (sharedConvIds.length > 0) {
            const existingConv = await this.conversationRepository.findOne({
                where: { id: In(sharedConvIds), conversationType: 'direct' },
            });

            if (existingConv) {
                return this.getSingleConversationDetails(existingConv.id, userId1);
            }
        }

        const conversation = this.conversationRepository.create({
            conversationType: 'direct',
            isPrivate: true,
            encryptionRequired: true,
            createdBy: userId1,
        });

        const savedConv = await this.conversationRepository.save(conversation);

        await this.conversationMemberRepository.save([
            {
                conversationId: savedConv.id,
                userId: userId1,
                role: 'member',
            },
            {
                conversationId: savedConv.id,
                userId: userId2,
                role: 'member',
            },
        ]);

        return this.getSingleConversationDetails(savedConv.id, userId1);
    }

    // Create group conversation
    async createGroupConversation(userId: string, name: string, memberIds: string[]) {
        const allMemberIds = [...new Set([userId, ...memberIds])];
        const conversation = this.conversationRepository.create({
            name,
            conversationType: 'group',
            encryptionRequired: true,
            createdBy: userId,
            memberCount: allMemberIds.length,
        });

        const savedConv = await this.conversationRepository.save(conversation);
        const members = allMemberIds.map(memberId => ({
            conversationId: savedConv.id,
            userId: memberId,
            role: memberId === userId ? 'admin' : 'member',
        }));

        await this.conversationMemberRepository.save(members);

        return this.getSingleConversationDetails(savedConv.id, userId);
    }

    // Get messages in a conversation
    async getConversationMessages(conversationId: string, userId: string, page = 1, limit = 50) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });

        if (!membership) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        const skip = (page - 1) * limit;

        const [messages, total] = await this.messageRepository.findAndCount({
            where: { conversationId, isDeleted: false },
            relations: ['sender', 'parentMessage', 'parentMessage.sender'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip,
        });

        // Mark as read when fetching messages
        await this.markConversationAsRead(conversationId, userId);

        // Fetch other members for read status (✓✓)
        const otherMembers = await this.conversationMemberRepository.find({
            where: { conversationId, userId: Not(userId), leftAt: IsNull() }
        });

        return {
            data: messages.reverse().map(msg => {
                // For direct chats, read status is based on the other person's lastReadAt
                let isRead = false;
                if (otherMembers.length > 0) {
                    isRead = otherMembers.some(m => m.lastReadAt && m.lastReadAt >= msg.createdAt);
                }

                return {
                    id: msg.id,
                    content: this.decryptIfNeeded(msg),
                    messageType: msg.messageType,
                    isEncrypted: msg.isEncrypted,
                    encryptionAlgorithm: msg.encryptionAlgorithm,
                    createdAt: msg.createdAt,
                    expiresAt: msg.expiresAt,
                    isEdited: msg.isEdited,
                    fileId: msg.fileId,
                    isRead,
                    sender: {
                        id: msg.sender.id,
                        firstName: msg.sender.firstName,
                        lastName: msg.sender.lastName,
                        avatarUrl: msg.sender.avatarUrl,
                    },
                    parentMessage: msg.parentMessage ? {
                        id: msg.parentMessage.id,
                        content: this.decryptIfNeeded(msg.parentMessage),
                        sender: {
                            id: msg.parentMessage.sender?.id,
                            firstName: msg.parentMessage.sender?.firstName,
                        }
                    } : null
                };
            }),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    // Mark conversation as read
    async markConversationAsRead(conversationId: string, userId: string) {
        await this.conversationMemberRepository.update(
            { conversationId, userId },
            { lastReadAt: new Date() }
        );
        return { success: true };
    }

    // Send a message
    async sendMessage(conversationId: string, userId: string, content: string, messageType = 'text', fileId?: string, parentMessageId?: string, selfDestructTime?: number) {
        if (messageType !== 'system') {
            const membership = await this.conversationMemberRepository.findOne({
                where: { conversationId, userId, leftAt: IsNull() },
            });

            if (!membership) {
                throw new ForbiddenException('You are not a member of this conversation');
            }
        }

        // Encrypt message content
        const { encrypted, iv, tag } = this.encryptionService.encryptText(content, this.chatMasterKey);

        let expiresAt: Date | null = null;
        if (selfDestructTime && selfDestructTime > 0) {
            expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + selfDestructTime);
        }

        const message = this.messageRepository.create({
            conversationId,
            senderId: userId,
            content: `[System Message]`,
            encryptedContent: encrypted,
            initializationVector: iv,
            authTag: tag,
            messageType,
            fileId,
            parentMessageId,
            isEncrypted: true,
            expiresAt,
        });

        const savedMessage = await this.messageRepository.save(message);

        await this.conversationRepository.update(
            { id: conversationId },
            { lastMessageAt: new Date() }
        );

        const completeMessage = await this.messageRepository.findOne({
            where: { id: savedMessage.id },
            relations: ['sender'],
        });

        // FIX LỖ HỔNG 2: Không trả về 'content' plaintext từ client.
        // Thay vào đó decrypt từ bản đã lưu để đảm bảo tính nhất quán và an toàn.
        // emitNewMessage sẽ nhận được dữ liệu này và phát sóng qua WebSocket.
        return {
            id: completeMessage.id,
            content: this.decryptIfNeeded(completeMessage),
            messageType: completeMessage.messageType,
            isEncrypted: completeMessage.isEncrypted,
            createdAt: completeMessage.createdAt,
            expiresAt: completeMessage.expiresAt,
            fileId: completeMessage.fileId,
            isRead: false,
            sender: completeMessage.sender ? {
                id: completeMessage.sender.id,
                firstName: completeMessage.sender.firstName,
                lastName: completeMessage.sender.lastName,
                email: completeMessage.sender.email,
                avatarUrl: completeMessage.sender.avatarUrl,
            } : null,
        };
    }

    private async createSystemMessage(conversationId: string, userId: string, content: string) {
        try {
            return await this.sendMessage(conversationId, userId, content, 'system');
        } catch (e) {
            console.error('[Chat] Failed to create system message:', e.message);
        }
    }

    // Get all users
    async getAllUsers(currentUserId: string) {
        const users = await this.userRepository.find({
            where: {
                status: 'active',
            },
            select: ['id', 'firstName', 'lastName', 'email', 'avatarUrl', 'department', 'managerId', 'jobTitle'],
        });

        return users.filter(u => u.id !== currentUserId);
    }

    // Delete message
    async deleteMessage(messageId: string, userId: string) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only delete your own messages');
        }

        message.isDeleted = true;
        message.deleteReason = 'Deleted by user';
        await this.messageRepository.save(message);

        return { success: true };
    }

    // Edit message
    async editMessage(messageId: string, userId: string, newContent: string) {
        const message = await this.messageRepository.findOne({
            where: { id: messageId },
        });

        if (!message) {
            throw new NotFoundException('Message not found');
        }

        if (message.senderId !== userId) {
            throw new ForbiddenException('You can only edit your own messages');
        }

        // Encrypt new content
        const { encrypted, iv, tag } = this.encryptionService.encryptText(newContent, this.chatMasterKey);

        message.content = `[Secure Message (Edited)]`;
        message.encryptedContent = encrypted;
        message.initializationVector = iv;
        message.authTag = tag;
        message.isEdited = true;
        message.updatedAt = new Date();

        await this.messageRepository.save(message);

        return { success: true };
    }

    // Forward message
    async forwardMessage(messageId: string, targetConversationId: string, userId: string) {
        const originalMessage = await this.messageRepository.findOne({
            where: { id: messageId },
        });

        if (!originalMessage) {
            throw new NotFoundException('Original message not found');
        }

        const decryptedContent = this.decryptIfNeeded(originalMessage);
        return this.sendMessage(targetConversationId, userId, decryptedContent);
    }

    // Add member to group
    async addMemberToGroup(conversationId: string, userId: string, newMemberId: string) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });

        if (!membership || membership.role !== 'admin') {
            throw new ForbiddenException('Only admins can add members');
        }

        const existing = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId: newMemberId, leftAt: IsNull() },
        });

        if (existing) {
            throw new ForbiddenException('User is already a member');
        }

        await this.conversationMemberRepository.save({
            conversationId,
            userId: newMemberId,
            role: 'member',
        });

        const [requester, newMember] = await Promise.all([
            this.userRepository.findOne({ where: { id: userId } }),
            this.userRepository.findOne({ where: { id: newMemberId } })
        ]);

        await this.createSystemMessage(conversationId, userId, `${requester.firstName} added ${newMember.firstName} ${newMember.lastName} to the group`);

        return { success: true };
    }

    // Leave group
    async leaveGroup(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });

        if (!membership) {
            throw new NotFoundException('Membership not found');
        }

        membership.leftAt = new Date();
        await this.conversationMemberRepository.save(membership);

        const user = await this.userRepository.findOne({ where: { id: userId } });
        await this.createSystemMessage(conversationId, userId, `${user.firstName} left the group`);

        return { success: true };
    }

    // Remove a member from group (admin only)
    async removeMemberFromGroup(conversationId: string, requesterId: string, targetUserId: string) {
        const requesterMembership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId: requesterId, leftAt: IsNull() },
        });
        if (!requesterMembership || requesterMembership.role !== 'admin') {
            throw new ForbiddenException('Only admins can remove members');
        }
        if (requesterId === targetUserId) {
            throw new BadRequestException('You cannot remove yourself. Use leave group instead.');
        }
        const targetMembership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId: targetUserId, leftAt: IsNull() },
        });
        if (!targetMembership) {
            throw new NotFoundException('Member not found in this group');
        }
        targetMembership.leftAt = new Date();
        await this.conversationMemberRepository.save(targetMembership);

        const [requester, target] = await Promise.all([
            this.userRepository.findOne({ where: { id: requesterId } }),
            this.userRepository.findOne({ where: { id: targetUserId } })
        ]);
        await this.createSystemMessage(conversationId, requesterId, `${requester.firstName} removed ${target.firstName} from the group`);

        return { success: true };
    }

    // Rename a group (admin only)
    async renameGroup(conversationId: string, requesterId: string, newName: string) {
        if (!newName || !newName.trim()) {
            throw new BadRequestException('Group name cannot be empty');
        }
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId: requesterId, leftAt: IsNull() },
        });
        if (!membership || membership.role !== 'admin') {
            throw new ForbiddenException('Only admins can rename the group');
        }
        await this.conversationRepository.update({ id: conversationId }, { name: newName.trim() });

        const user = await this.userRepository.findOne({ where: { id: requesterId } });
        await this.createSystemMessage(conversationId, requesterId, `${user.firstName} renamed the group to "${newName.trim()}"`);

        return { success: true, name: newName.trim() };
    }

    // Promote/demote group member role (admin only)
    async changeGroupMemberRole(conversationId: string, requesterId: string, targetUserId: string, newRole: 'admin' | 'member') {
        const requesterMembership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId: requesterId, leftAt: IsNull() },
        });
        if (!requesterMembership || requesterMembership.role !== 'admin') {
            throw new ForbiddenException('Only admins can change member roles');
        }
        const targetMembership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId: targetUserId, leftAt: IsNull() },
        });
        if (!targetMembership) {
            throw new NotFoundException('Member not found in this group');
        }
        targetMembership.role = newRole;
        await this.conversationMemberRepository.save(targetMembership);

        const [requester, target] = await Promise.all([
            this.userRepository.findOne({ where: { id: requesterId } }),
            this.userRepository.findOne({ where: { id: targetUserId } })
        ]);
        const action = newRole === 'admin' ? 'promoted to admin' : 'demoted to member';
        await this.createSystemMessage(conversationId, requesterId, `${requester.firstName} ${action} ${target.firstName}`);

        return { success: true, userId: targetUserId, role: newRole };
    }

    // Get full conversation info (for sidebar panel)
    async getConversationInfo(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });
        if (!membership) {
            throw new ForbiddenException('You are not a member of this conversation');
        }
        const conversation = await this.conversationRepository.findOne({
            where: { id: conversationId },
            relations: ['creator'],
        });
        if (!conversation) {
            throw new NotFoundException('Conversation not found');
        }
        const members = await this.conversationMemberRepository.find({
            where: { conversationId, leftAt: IsNull() },
            relations: ['user'],
        });
        const [mediaCount, fileCount] = await Promise.all([
            this.messageRepository.count({ where: { conversationId, messageType: In(['image', 'video']), isDeleted: false } }),
            this.messageRepository.count({ where: { conversationId, messageType: 'file', isDeleted: false } }),
        ]);
        return {
            id: conversation.id,
            name: conversation.name,
            conversationType: conversation.conversationType,
            isPrivate: conversation.isPrivate,
            encryptionRequired: conversation.encryptionRequired,
            createdAt: conversation.createdAt,
            currentUserRole: membership.role,
            members: members.map(m => ({
                id: m.user.id,
                firstName: m.user.firstName,
                lastName: m.user.lastName,
                email: m.user.email,
                avatarUrl: m.user.avatarUrl,
                role: m.role,
                joinedAt: m.createdAt,
            })),
            stats: { mediaCount, fileCount },
        };
    }

    // Delete Entire Conversation (for current user - leaves the chat)
    async deleteConversation(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });

        if (!membership) {
            throw new NotFoundException('Conversation not found or already deleted');
        }

        membership.leftAt = new Date();
        await this.conversationMemberRepository.save(membership);

        const activeMembers = await this.conversationMemberRepository.count({
            where: { conversationId, leftAt: IsNull() }
        });

        if (activeMembers === 0) {
            await this.conversationRepository.update({ id: conversationId }, { isDeleted: true });
        }

        return { success: true };
    }

    // Typing indicators
    setTyping(conversationId: string, userId: string, isTyping: boolean) {
        if (!this.typingUsers.has(conversationId)) {
            this.typingUsers.set(conversationId, new Set());
        }

        const typingSet = this.typingUsers.get(conversationId);

        if (isTyping) {
            typingSet.add(userId);
            setTimeout(() => {
                typingSet.delete(userId);
            }, 5000);
        } else {
            typingSet.delete(userId);
        }

        return { success: true };
    }

    async getTypingUsers(conversationId: string, currentUserId: string) {
        const typingUserIds = Array.from(this.typingUsers.get(conversationId) || [])
            .filter(id => id !== currentUserId);

        if (typingUserIds.length === 0) {
            return [];
        }

        const users = await this.userRepository.find({
            where: { id: In(typingUserIds) },
            select: ['id', 'firstName', 'lastName'],
        });

        return users;
    }

    async addReaction(messageId: string, userId: string, emoji: string) {
        const existing = await this.messageReactionRepository.findOne({ where: { messageId, userId, emoji } });
        if (existing) {
            await this.messageReactionRepository.remove(existing);
            return { success: true, action: 'removed' };
        }
        await this.messageReactionRepository.save({ messageId, userId, emoji });
        return { success: true, action: 'added' };
    }

    async getMessageReactions(messageId: string) {
        const reactions = await this.messageReactionRepository.find({ where: { messageId }, relations: ['user'] });
        return reactions.reduce((acc, r) => {
            if (!acc[r.emoji]) acc[r.emoji] = [];
            acc[r.emoji].push({ userId: r.user.id, firstName: r.user.firstName, lastName: r.user.lastName });
            return acc;
        }, {});
    }

    async pinMessage(conversationId: string, messageId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (!membership) throw new ForbiddenException('Not a member');
        await this.pinnedMessageRepository.save({ conversationId, messageId, pinnedBy: userId });
        return { success: true };
    }

    async unpinMessage(conversationId: string, messageId: string, userId: string) {
        const pinned = await this.pinnedMessageRepository.findOne({ where: { conversationId, messageId } });
        if (!pinned) throw new NotFoundException('Not found');
        await this.pinnedMessageRepository.remove(pinned);
        return { success: true };
    }

    async getPinnedMessages(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (!membership) throw new ForbiddenException('Not a member');
        const pinnedMessages = await this.pinnedMessageRepository.find({
            where: { conversationId },
            relations: ['message', 'message.sender', 'user'],
            order: { pinnedAt: 'DESC' },
        });
        return pinnedMessages.map(pm => ({
            id: pm.id,
            pinnedAt: pm.pinnedAt,
            pinnedBy: { id: pm.user.id, firstName: pm.user.firstName, lastName: pm.user.lastName },
            message: {
                id: pm.message.id,
                content: pm.message.content,
                createdAt: pm.message.createdAt,
                sender: { id: pm.message.sender.id, firstName: pm.message.sender.firstName, lastName: pm.message.sender.lastName },
            },
        }));
    }

    async searchMessages(conversationId: string, userId: string, query: string) {
        const membership = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (!membership) throw new ForbiddenException('Not a member');
        const messages = await this.messageRepository.find({
            where: { conversationId, content: Like(`%${query}%`), isDeleted: false },
            relations: ['sender'],
            order: { createdAt: 'DESC' },
            take: 50,
        });
        return messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            createdAt: msg.createdAt,
            sender: { id: msg.sender.id, firstName: msg.sender.firstName, lastName: msg.sender.lastName },
        }));
    }

    async getSharedMedia(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (!membership) throw new ForbiddenException('Not a member');
        const messages = await this.messageRepository.find({
            where: {
                conversationId,
                messageType: In(['image', 'video']),
                isDeleted: false
            },
            relations: ['sender'],
            order: { createdAt: 'DESC' }
        });
        return messages.map(m => ({
            id: m.id,
            content: m.content,
            messageType: m.messageType,
            fileId: m.fileId,
            sender: { id: m.sender.id, firstName: m.sender.firstName, lastName: m.sender.lastName },
            createdAt: m.createdAt,
        }));
    }

    async getSharedFiles(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (!membership) throw new ForbiddenException('Not a member');
        const messages = await this.messageRepository.find({
            where: { conversationId, messageType: 'file', isDeleted: false },
            relations: ['sender'],
            order: { createdAt: 'DESC' }
        });
        return messages.map(m => ({
            id: m.id,
            content: m.content,
            fileId: m.fileId,
            sender: { id: m.sender.id, firstName: m.sender.firstName, lastName: m.sender.lastName },
            createdAt: m.createdAt,
        }));
    }

    async getSharedLinks(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (!membership) throw new ForbiddenException('Not a member');
        const messages = await this.messageRepository.find({
            where: { conversationId, content: Like('%http%'), isDeleted: false },
            relations: ['sender'],
            order: { createdAt: 'DESC' }
        });
        return messages.map(m => ({
            id: m.id,
            content: m.content,
            sender: { id: m.sender.id, firstName: m.sender.firstName, lastName: m.sender.lastName },
            createdAt: m.createdAt,
        }));
    }

    async getCallHistory(userId: string) {
        return await this.callLogRepository.find({
            where: { callerId: userId },
            relations: ['caller'],
            order: { startTime: 'DESC' },
            take: 50
        });
    }

    async discoverPublicGroups(userId: string, search?: string, category?: string, page = 1, limit = 20) {
        const query = this.conversationRepository.createQueryBuilder('conv')
            .where('conv.conversationType = :type', { type: 'public' })
            .andWhere('conv.isPrivate = false');

        if (search) {
            query.andWhere('(conv.name LIKE :search OR conv.description LIKE :search)', { search: `%${search}%` });
        }

        const [groups, total] = await query
            .orderBy('conv.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            groups: await Promise.all(groups.map(async g => {
                const memberCount = await this.conversationMemberRepository.count({ where: { conversationId: g.id, leftAt: IsNull() } });
                const isMember = await this.conversationMemberRepository.count({ where: { conversationId: g.id, userId, leftAt: IsNull() } }) > 0;
                return { ...g, memberCount, isMember };
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    }

    async discoverSuggestedUsers(currentUserId: string, limit = 10) {
        // Simple suggestion: users in same department or recently active
        const currentUser = await this.userRepository.findOne({ where: { id: currentUserId } });
        const users = await this.userRepository.find({
            where: {
                id: Not(currentUserId),
                status: 'active',
                department: currentUser?.department || undefined
            },
            take: limit
        });
        return users;
    }

    async joinPublicGroup(conversationId: string, userId: string) {
        const group = await this.conversationRepository.findOne({ where: { id: conversationId, conversationType: 'public' } });
        if (!group) throw new NotFoundException('Public group not found');

        const existing = await this.conversationMemberRepository.findOne({ where: { conversationId, userId, leftAt: IsNull() } });
        if (existing) return { success: true, message: 'Already a member' };

        await this.conversationMemberRepository.save({
            conversationId,
            userId,
            role: 'member'
        });

        const user = await this.userRepository.findOne({ where: { id: userId } });
        const systemMessage = await this.createSystemMessage(conversationId, userId, `${user.firstName} joined the group via discovery`);

        return { success: true, systemMessage };
    }

    // Call Logging Methods
    async createCallLog(data: Partial<CallLog>) {
        const log = this.callLogRepository.create(data);
        return await this.callLogRepository.save(log);
    }

    async updateCallLog(id: string, data: Partial<CallLog>) {
        await this.callLogRepository.update(id, data);
        return await this.callLogRepository.findOne({ where: { id } });
    }
}