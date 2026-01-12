import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../core/user.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'team_id', type: 'char', length: 36, nullable: true })
  teamId: string;

  @Column({ name: 'manager_id', type: 'char', length: 36, nullable: true })
  managerId: string;

  @Column({ name: 'security_level', type: 'tinyint', default: 2 })
  securityLevel: number;

  @Column({ name: 'is_confidential', default: false })
  isConfidential: boolean;

  @Column({ length: 20, default: 'planned' })
  status: string;

  @Column({ length: 20, default: 'medium' })
  priority: string;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: Date;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Team, team => team.id, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;
}