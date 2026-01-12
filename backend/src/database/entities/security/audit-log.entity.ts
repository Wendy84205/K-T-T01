import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'device_id', length: 255, nullable: true })
  deviceId: string;

  @Column({ name: 'location_data', type: 'json', nullable: true })
  locationData: Record<string, any>;

  @Column({ name: 'event_type', length: 50 })
  eventType: string;

  @Column({ name: 'entity_type', length: 50 })
  entityType: string;

  @Column({ name: 'entity_id', length: 100, nullable: true })
  entityId: string;

  @Column({ name: 'old_values', type: 'json', nullable: true })
  oldValues: Record<string, any>;

  @Column({ name: 'new_values', type: 'json', nullable: true })
  newValues: Record<string, any>;

  @Column({ type: 'json', nullable: true })
  changes: Record<string, any>;

  @Column({ length: 20, default: 'INFO' })
  severity: string;

  @Column({ name: 'risk_score', type: 'int', nullable: true })
  riskScore: number;

  @Column({ name: 'security_context', type: 'json', nullable: true })
  securityContext: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}