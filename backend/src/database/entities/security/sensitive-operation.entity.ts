import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('sensitive_operations_log')
export class SensitiveOperation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operation_type', length: 50 })
  operationType: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string;

  @Column({ name: 'target_entity_type', length: 50, nullable: true })
  targetEntityType: string;

  @Column({ name: 'target_entity_id', type: 'char', length: 36, nullable: true })
  targetEntityId: string;

  @Column({ type: 'text', nullable: true })
  justification: string;

  @Column({ name: 'approval_required', default: true })
  approvalRequired: boolean;

  @Column({ name: 'approved_by', type: 'char', length: 36, nullable: true })
  approvedBy: string;

  @Column({ name: 'approved_at', nullable: true })
  approvedAt: Date;

  @Column({ name: 'operation_result', length: 20, nullable: true })
  operationResult: string;

  @Column({ name: 'error_message', type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}