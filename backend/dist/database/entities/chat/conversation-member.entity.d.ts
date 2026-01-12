import { Conversation } from './conversation.entity';
import { User } from '../core/user.entity';
export declare class ConversationMember {
    id: string;
    conversationId: string;
    userId: string;
    role: string;
    encryptionKeyId: string;
    isMuted: boolean;
    isPinned: boolean;
    joinedAt: Date;
    leftAt: Date;
    createdAt: Date;
    conversation: Conversation;
    user: User;
}
