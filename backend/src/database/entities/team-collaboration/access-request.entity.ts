import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('access_requests')
export class AccessRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'resource_type', length: 50 })
  resourceType: string;

  @Column({ name: 'resource_id', type: 'char', length: 36 })
  resourceId: string;

  @Column({ name: 'requested_permission', length: 50 })
  requestedPermission: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'device_id', length: 255, nullable: true })
  deviceId: string;

  @Column({ name: 'location_data', type: 'json', nullable: true })
  locationData: Record<string, any>;

  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'risk_factors', type: 'json', nullable: true })
  riskFactors: Record<string, any>;

  @Column({ length: 20, default: 'PENDING' })
  status: string;

  @Column({ name: 'approver_id', type: 'char', length: 36, nullable: true })
  approverId: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approval_notes', type: 'text', nullable: true })
  approvalNotes: string;

  @Column({ name: 'business_justification', type: 'text', nullable: true })
  businessJustification: string;

  @Column({ name: 'duration_minutes', type: 'int', nullable: true })
  durationMinutes: number;

  @Column({ name: 'requested_at', default: () => 'CURRENT_TIMESTAMP' })
  requestedAt: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'accessed_at', nullable: true })
  accessedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'approver_id' })
  approver: User;
}