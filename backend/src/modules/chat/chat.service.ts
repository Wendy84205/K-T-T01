import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, Not, Like } from 'typeorm';
import { Conversation } from '../../database/entities/chat/conversation.entity';
import { Message } from '../../database/entities/chat/message.entity';
import { ConversationMember } from '../../database/entities/chat/conversation-member.entity';
import { MessageReaction } from '../../database/entities/chat/message-reaction.entity';
import { PinnedMessage } from '../../database/entities/chat/pinned-message.entity';
import { User } from '../../database/entities/core/user.entity';

import { EncryptionService } from '../../common/service/encryption.service';

@Injectable()
export class ChatService {
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

        @InjectRepository(User)
        private userRepository: Repository<User>,

        private encryptionService: EncryptionService,
    ) { }

    private readonly chatMasterKey = Buffer.from('8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'hex');

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
            .orderBy('conv.lastMessageAt', 'DESC') // Removed 'NULLS LAST' (PostgreSQL specific)
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
                id: m.user.id,
                firstName: m.user.firstName,
                lastName: m.user.lastName,
                email: m.user.email,
                avatarUrl: m.user.avatarUrl,
                role: m.role,
                lastReadAt: m.lastReadAt,
            })),
            otherUser: otherUser ? {
                id: otherUser.id,
                firstName: otherUser.firstName,
                lastName: otherUser.lastName,
                email: otherUser.email,
                avatarUrl: otherUser.avatarUrl,
            } : null,
            unreadCount,
        };
    }

    private decryptIfNeeded(message: any): string {
        if (message.isEncrypted && message.encryptedContent && message.initializationVector && message.authTag) {
            try {
                return this.encryptionService.decryptText(
                    message.encryptedContent,
                    this.chatMasterKey,
                    message.initializationVector,
                    message.authTag
                );
            } catch (e) {
                console.error(`[Chat] Decryption failed for message ${message.id}:`, e.message);
                return '[Encrypted Message]';
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
        const conversation = this.conversationRepository.create({
            name,
            conversationType: 'group',
            isPrivate: true,
            encryptionRequired: true,
            createdBy: userId,
        });

        const savedConv = await this.conversationRepository.save(conversation);

        const allMemberIds = [...new Set([userId, ...memberIds])];
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
            relations: ['sender'],
            order: { createdAt: 'DESC' },
            take: limit,
            skip,
        });

        // Mark as read when fetching messages
        await this.markConversationAsRead(conversationId, userId);

        return {
            data: messages.reverse().map(msg => ({
                id: msg.id,
                content: this.decryptIfNeeded(msg),
                messageType: msg.messageType,
                isEncrypted: msg.isEncrypted,
                encryptionAlgorithm: msg.encryptionAlgorithm,
                createdAt: msg.createdAt,
                isEdited: msg.isEdited,
                fileId: msg.fileId,
                sender: {
                    id: msg.sender.id,
                    firstName: msg.sender.firstName,
                    lastName: msg.sender.lastName,
                    avatarUrl: msg.sender.avatarUrl,
                },
            })),
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
    async sendMessage(conversationId: string, userId: string, content: string, messageType = 'text', fileId?: string, parentMessageId?: string) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });

        if (!membership) {
            throw new ForbiddenException('You are not a member of this conversation');
        }

        // Encrypt message content
        const { encrypted, iv, tag } = this.encryptionService.encryptText(content, this.chatMasterKey);

        const message = this.messageRepository.create({
            conversationId,
            senderId: userId,
            content: `[Secure Message]`, // Fallback content
            encryptedContent: encrypted,
            initializationVector: iv,
            authTag: tag,
            messageType,
            fileId,
            parentMessageId,
            isEncrypted: true,
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

        return {
            id: completeMessage.id,
            content: completeMessage.content,
            messageType: completeMessage.messageType,
            isEncrypted: completeMessage.isEncrypted,
            createdAt: completeMessage.createdAt,
            fileId: completeMessage.fileId,
            sender: {
                id: completeMessage.sender.id,
                firstName: completeMessage.sender.firstName,
                lastName: completeMessage.sender.lastName,
                avatarUrl: completeMessage.sender.avatarUrl,
            },
        };
    }

    // Get all users
    async getAllUsers(currentUserId: string) {
        const users = await this.userRepository.find({
            where: { status: 'active' },
            select: ['id', 'firstName', 'lastName', 'email', 'avatarUrl', 'department'],
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

        // Just send a new message with the same content (plaintext from decrypt)
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

        return { success: true };
    }

    // Delete Entire Conversation (for current user - leaves the chat)
    async deleteConversation(conversationId: string, userId: string) {
        const membership = await this.conversationMemberRepository.findOne({
            where: { conversationId, userId, leftAt: IsNull() },
        });

        if (!membership) {
            throw new NotFoundException('Conversation not found or already deleted');
        }

        // Mark membership as left/deleted
        membership.leftAt = new Date();
        await this.conversationMemberRepository.save(membership);

        // Optional: If no members left, we could mark conversation as isDeleted=true
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
            // Auto-clear after 5 seconds
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

    // Reactions
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

    // Pin messages
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

    // Search
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
}
