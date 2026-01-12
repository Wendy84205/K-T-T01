import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: Record<string, any>;

  @Column({ length: 20, default: 'normal' })
  priority: string;

  @Column({ length: 50, nullable: true })
  category: string;

  @Column({ name: 'requires_acknowledgment', default: false })
  requiresAcknowledgment: boolean;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @Column({ name: 'is_archived', default: false })
  isArchived: boolean;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'action_url', length: 500, nullable: true })
  actionUrl: string;

  @Column({ name: 'action_label', length: 50, nullable: true })
  actionLabel: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'read_at', nullable: true })
  readAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}