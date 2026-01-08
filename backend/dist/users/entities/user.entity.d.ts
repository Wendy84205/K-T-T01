export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    role: string;
    twoFactorSecret: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    constructor(partial: Partial<User>);
}
