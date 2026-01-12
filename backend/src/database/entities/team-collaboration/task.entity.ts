import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../core/user.entity';

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'char', length: 36, nullable: true })
  projectId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'assignee_id', type: 'char', length: 36, nullable: true })
  assigneeId: string;

  @Column({ name: 'reporter_id', type: 'char', length: 36, nullable: true })
  reporterId: string;

  @Column({ length: 20, default: 'todo' })
  status: string;

  @Column({ length: 20, default: 'medium' })
  priority: string;

  @Column({ name: 'is_confidential', default: false })
  isConfidential: boolean;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, project => project.id, { nullable: true })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'reporter_id' })
  reporter: User;
}