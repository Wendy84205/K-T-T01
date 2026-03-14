// src/database/entities/team-collaboration/project-task.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';
import { Project } from './project.entity';

@Entity('project_tasks')
export class ProjectTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['todo', 'in_progress', 'done'],
    default: 'todo'
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  })
  priority: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ name: 'progress_note', type: 'text', nullable: true })
  progressNote: string;

  @Column({ name: 'last_progress_note_at', type: 'timestamp', nullable: true })
  lastProgressNoteAt: Date;

  @Column({ name: 'project_id', type: 'char', length: 36 })
  projectId: string;

  @Column({ name: 'assignee_id', type: 'char', length: 36, nullable: true })
  assigneeId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Project, project => project.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: Project;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assignee_id' })
  assignee: User;
}
