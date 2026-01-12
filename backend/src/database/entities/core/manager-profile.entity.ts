import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('manager_profiles')
export class ManagerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36, unique: true })
  userId: string;

  @Column({ name: 'manager_level', length: 50, nullable: true })
  managerLevel: string;

  @Column({ name: 'max_team_size', type: 'int', default: 20 })
  maxTeamSize: number;

  @Column({ name: 'can_hire', default: false })
  canHire: boolean;

  @Column({ name: 'can_fire', default: false })
  canFire: boolean;

  @Column({ name: 'can_approve_security', default: false })
  canApproveSecurity: boolean;

  @Column({ name: 'budget_authority', type: 'decimal', precision: 15, scale: 2, nullable: true })
  budgetAuthority: number;

  @Column({ name: 'reporting_to', type: 'char', length: 36, nullable: true })
  reportingTo: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'management_start_date', type: 'date', default: () => 'CURRENT_DATE' })
  managementStartDate: Date;

  @Column({ name: 'management_end_date', type: 'date', nullable: true })
  managementEndDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}