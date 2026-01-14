import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('permissions')
export class Permission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  resource: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'min_role_level', type: 'int', default: 10 })
  minRoleLevel: number;

  @Column({ name: 'min_security_level', type: 'tinyint', default: 1 })
  minSecurityLevel: number;

  @Column({ name: 'requires_mfa', default: false })
  requiresMfa: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}