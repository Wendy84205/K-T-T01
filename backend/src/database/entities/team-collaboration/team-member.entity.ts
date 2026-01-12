import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { User } from '../core/user.entity';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'team_id', type: 'char', length: 36 })
  teamId: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'role_in_team', length: 50, default: 'member' })
  roleInTeam: string;

  @Column({ name: 'security_clearance', type: 'tinyint', default: 2 })
  securityClearance: number;

  @Column({ name: 'joined_date', type: 'date', default: () => 'CURRENT_DATE' })
  joinedDate: Date;

  @Column({ name: 'left_date', type: 'date', nullable: true })
  leftDate: Date;

  @Column({ name: 'added_by', type: 'char', length: 36, nullable: true })
  addedBy: string;

  @Column({ name: 'requires_security_training', default: false })
  requiresSecurityTraining: boolean;

  @Column({ name: 'training_completed_at', nullable: true })
  trainingCompletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Team, team => team.id)
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}