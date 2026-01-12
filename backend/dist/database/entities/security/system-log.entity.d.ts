import { User } from '../core/user.entity';
export declare class SystemLog {
    id: string;
    level: string;
    component: string;
    message: string;
    stackTrace: string;
    requestId: string;
    userId: string;
    ipAddress: string;
    createdAt: Date;
    user: User;
}
