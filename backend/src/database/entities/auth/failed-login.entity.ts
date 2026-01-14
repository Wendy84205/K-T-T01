import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('failed_login_attempts')
export class FailedLoginAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  userId: string;

  @Column({ length: 255 })
  username: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'attempt_time', default: () => 'CURRENT_TIMESTAMP' })
  attemptTime: Date;

  @Column({ name: 'is_successful', default: false })
  isSuccessful: boolean;

  @Column({ name: 'is_suspicious', default: false })
  isSuspicious: boolean;

  @Column({ name: 'suspicious_reason', length: 100, nullable: true })
  suspiciousReason: string;

  @Column({ name: 'blocked_until', nullable: true })
  blockedUntil: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}