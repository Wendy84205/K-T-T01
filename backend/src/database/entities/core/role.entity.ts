import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  name: string;

  @Column({ type: 'int' })
  level: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_system_role', default: true })
  isSystemRole: boolean;

  @Column({ name: 'security_level_required', type: 'tinyint', default: 1 })
  securityLevelRequired: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}