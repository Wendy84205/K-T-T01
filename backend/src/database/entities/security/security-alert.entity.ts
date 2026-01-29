import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('security_alerts')
export class SecurityAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'alert_type', length: 50 })
  alertType: string;

  @Column({ length: 20, default: 'MEDIUM' })
  severity: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @Column({ name: 'affected_users', type: 'json', nullable: true })
  affectedUsers: string[];

  @Column({ name: 'affected_resources', type: 'json', nullable: true })
  affectedResources: Record<string, any>;

  @Column({ length: 20, default: 'ACTIVE' })
  status: string;

  @Column({ name: 'acknowledged_by', type: 'char', length: 36, nullable: true })
  acknowledgedBy: string;

  @Column({ name: 'acknowledged_at', nullable: true })
  acknowledgedAt: Date;

  @Column({ name: 'resolved_by', type: 'char', length: 36, nullable: true })
  resolvedBy: string;

  @Column({ name: 'resolved_at', nullable: true })
  resolvedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'acknowledged_by' })
  acknowledger: User;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'resolved_by' })
  resolver: User;
}