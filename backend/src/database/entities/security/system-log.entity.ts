import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('system_logs')
export class SystemLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  level: string;

  @Column({ length: 100 })
  component: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ name: 'stack_trace', type: 'text', nullable: true })
  stackTrace: string;

  @Column({ name: 'request_id', length: 100, nullable: true })
  requestId: string;

  @Column({ name: 'user_id', type: 'char', length: 36, nullable: true })
  userId: string;

  @Column({ name: 'ip_address', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}