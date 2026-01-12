import { Conversation } from './conversation.entity';
import { User } from '../core/user.entity';
import { File } from '../file-storage/file.entity';
export declare class Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    encryptedContent: string;
    messageType: string;
    isEncrypted: boolean;
    encryptionKeyId: string;
    encryptionAlgorithm: string;
    initializationVector: string;
    fileId: string;
    parentMessageId: string;
    isEdited: boolean;
    isDeleted: boolean;
    deleteReason: string;
    createdAt: Date;
    updatedAt: Date;
    conversation: Conversation;
    sender: User;
    file: File;
}
