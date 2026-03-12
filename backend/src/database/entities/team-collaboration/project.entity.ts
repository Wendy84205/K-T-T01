// src/database/entities/team-collaboration/project.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from '../core/user.entity';
import { Team } from './team.entity';
import { ProjectTask } from './project-task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['active', 'planned', 'on_hold', 'completed'],
    default: 'active'
  })
  status: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  @Column({ name: 'creator_id', type: 'char', length: 36 })
  creatorId: string;

  @Column({ name: 'team_id', type: 'char', length: 36, nullable: true })
  teamId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User)
  @JoinColumn({ name: 'creator_id' })
  creator: User;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @OneToMany(() => ProjectTask, task => task.project)
  tasks: ProjectTask[];
}
