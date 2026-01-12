export declare class Permission {
    id: string;
    resource: string;
    action: string;
    description: string;
    minRoleLevel: number;
    minSecurityLevel: number;
    requiresMfa: boolean;
    createdAt: Date;
}
