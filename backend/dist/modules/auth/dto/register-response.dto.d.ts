export declare class RegisterResponseDto {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    mfaRequired: boolean;
    isEmailVerified: boolean;
    requiresEmailVerification: boolean;
    requiresManagerApproval: boolean;
    createdAt: Date;
    nextSteps: string[];
}
