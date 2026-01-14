import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('rate_limits')
export class RateLimit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  identifier: string;

  @Column({ name: 'bucket_type', length: 50 })
  bucketType: string;

  @Column({ name: 'request_count', type: 'int', default: 0 })
  requestCount: number;

  @Column({ name: 'limit_value', type: 'int' })
  limitValue: number;

  @Column({ name: 'time_window', type: 'int' })
  timeWindow: number;

  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @Column({ name: 'block_reason', length: 100, nullable: true })
  blockReason: string;

  @Column({ name: 'blocked_until', nullable: true })
  blockedUntil: Date;

  @Column({ name: 'first_request_at', default: () => 'CURRENT_TIMESTAMP' })
  firstRequestAt: Date;

  @Column({ name: 'last_request_at', default: () => 'CURRENT_TIMESTAMP' })
  lastRequestAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}