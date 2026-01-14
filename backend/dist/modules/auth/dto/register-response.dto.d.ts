export declare class RegisterResponseDto {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    employeeId: string;
    department?: string;
    jobTitle?: string;
    mfaRequired: boolean;
    isEmailVerified: boolean;
    requiresEmailVerification: boolean;
    requiresManagerApproval: boolean;
    createdAt: Date;
    nextSteps: string[];
}
