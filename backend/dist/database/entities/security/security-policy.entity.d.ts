export declare class SecurityPolicy {
    id: string;
    policyType: string;
    name: string;
    description: string;
    config: Record<string, any>;
    isActive: boolean;
    appliesTo: string;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
