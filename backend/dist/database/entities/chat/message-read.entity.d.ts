import { Message } from './message.entity';
import { User } from '../core/user.entity';
export declare class MessageReadReceipt {
    id: string;
    messageId: string;
    userId: string;
    readAt: Date;
    readWithDeviceId: string;
    createdAt: Date;
    message: Message;
    user: User;
}
