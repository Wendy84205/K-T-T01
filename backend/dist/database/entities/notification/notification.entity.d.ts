import { User } from '../core/user.entity';
export declare class Notification {
    id: string;
    userId: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, any>;
    priority: string;
    category: string;
    requiresAcknowledgment: boolean;
    isRead: boolean;
    isArchived: boolean;
    expiresAt: Date;
    actionUrl: string;
    actionLabel: string;
    createdAt: Date;
    readAt: Date;
    user: User;
}
