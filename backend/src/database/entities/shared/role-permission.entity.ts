import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../core/role.entity';
import { Permission } from '../core/permission.entity';

@Entity('role_permissions')
export class RolePermission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'role_id', type: 'char', length: 36 })
  roleId: string;

  @Column({ name: 'permission_id', type: 'char', length: 36 })
  permissionId: string;

  @Column({ type: 'json', nullable: true })
  conditions: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Role, role => role.id)
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @ManyToOne(() => Permission, permission => permission.id)
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;
}