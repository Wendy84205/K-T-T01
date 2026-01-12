import { Role } from '../core/role.entity';
import { Permission } from '../core/permission.entity';
export declare class RolePermission {
    id: string;
    roleId: string;
    permissionId: string;
    conditions: Record<string, any>;
    createdAt: Date;
    role: Role;
    permission: Permission;
}
