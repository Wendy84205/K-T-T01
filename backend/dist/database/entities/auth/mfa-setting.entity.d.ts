import { User } from '../core/user.entity';
export declare class MfaSetting {
    id: string;
    userId: string;
    totpEnabled: boolean;
    totpSecret: string;
    totpBackupCodes: string[];
    totpVerifiedAt: Date;
    smsMfaEnabled: boolean;
    phoneNumber: string;
    smsVerifiedAt: Date;
    emailMfaEnabled: boolean;
    emailVerifiedAt: Date;
    recoveryEmail: string;
    lastMfaUsed: string;
    mfaFailedAttempts: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
}
