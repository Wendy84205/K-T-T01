import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('security_metrics')
export class SecurityMetric {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'metric_date', type: 'date' })
  metricDate: Date;

  @Column({ name: 'metric_type', length: 50 })
  metricType: string;

  @Column({ name: 'total_count', type: 'int', default: 0 })
  totalCount: number;

  @Column({ name: 'success_count', type: 'int', default: 0 })
  successCount: number;

  @Column({ name: 'failure_count', type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'json', default: () => "'{}'" })
  breakdown: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}