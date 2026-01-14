import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('security_events')
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_type', length: 50 })
  eventType: string;

  @Column({ length: 20, default: 'MEDIUM' })
  severity: string;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_fingerprint', type: 'text', nullable: true })
  deviceFingerprint: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'json', default: () => "'{}'" })
  metadata: Record<string, any>;

  @Column({ name: 'detected_by', length: 100, nullable: true })
  detectedBy: string;

  @Column({ name: 'detection_rules', type: 'json', nullable: true })
  detectionRules: Record<string, any>;

  @Column({ name: 'is_investigated', default: false })
  isInvestigated: boolean;

  @Column({ name: 'investigation_notes', type: 'text', nullable: true })
  investigationNotes: string;

  @Column({ name: 'investigation_by', type: 'char', length: 36, nullable: true })
  investigationBy: string;

  @Column({ name: 'investigation_at', nullable: true })
  investigationAt: Date;

  @Column({ length: 50, nullable: true })
  resolution: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @Column({ name: 'resolved_by', type: 'char', length: 36, nullable: true })
  resolvedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}