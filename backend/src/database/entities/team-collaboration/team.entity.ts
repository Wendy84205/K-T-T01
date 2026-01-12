// src/database/entities/team.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'department_id', length: 100, nullable: true })
  departmentId: string;

  @Column({ name: 'default_security_level', type: 'tinyint', default: 2 })
  defaultSecurityLevel: number;

  @Column({ name: 'requires_mfa', default: true })
  requiresMfa: boolean;

  @Column({ name: 'encryption_required', default: true })
  encryptionRequired: boolean;

  @Column({ name: 'max_members', type: 'int', default: 50 })
  maxMembers: number;

  @Column({ name: 'storage_quota_mb', type: 'int', default: 1024 })
  storageQuotaMb: number;

  @Column({ name: 'file_size_limit_mb', type: 'int', default: 100 })
  fileSizeLimitMb: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Foreign keys
  @Column({ name: 'manager_id', type: 'char', length: 36 })
  managerId: string;

  @Column({ name: 'parent_team_id', type: 'char', length: 36, nullable: true })
  parentTeamId: string;

  // Relations - sử dụng forward reference
  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'parent_team_id' })
  parentTeam: Team;
}