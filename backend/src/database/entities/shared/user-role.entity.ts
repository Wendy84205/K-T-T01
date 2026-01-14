import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';
import { Role } from '../core/role.entity';

@Entity('user_roles')
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'role_id', type: 'char', length: 36 })
  roleId: string;

  @Column({ name: 'assigned_by', type: 'char', length: 36, nullable: true })
  assignedBy: string;

  @Column({ name: 'assigned_at', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'requires_review', default: false })
  requiresReview: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Role, role => role.id)
  @JoinColumn({ name: 'role_id' })
  role: Role;
}