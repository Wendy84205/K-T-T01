import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from '../team-collaboration/team.entity'; 
import { TeamMember } from '../team-collaboration/team-member.entity';
import { OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { ManyToMany, JoinTable } from 'typeorm';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'first_name', length: 100, nullable: true })
  firstName: string;

  @Column({ name: 'last_name', length: 100, nullable: true })
  lastName: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'employee_id', length: 50, unique: true, nullable: true })
  employeeId: string;

  @Column({ name: 'job_title', length: 100, nullable: true })
  jobTitle: string;

  @Column({ length: 100, nullable: true })
  department: string;

  @Column({ name: 'hire_date', type: 'date', nullable: true })
  hireDate: Date;

  @Column({ name: 'mfa_required', default: true })
  mfaRequired: boolean;

  @Column({ name: 'last_password_change', default: () => 'CURRENT_TIMESTAMP' })
  lastPasswordChange: Date;

  @Column({ name: 'account_locked_until', nullable: true })
  accountLockedUntil: Date;

  @Column({ name: 'lock_reason', length: 100, nullable: true })
  lockReason: string;

  @Column({ name: 'security_clearance_level', type: 'tinyint', default: 1 })
  securityClearanceLevel: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'last_failed_login', nullable: true })
  lastFailedLogin: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Foreign keys
  @Column({ name: 'manager_id', type: 'char', length: 36, nullable: true })
  managerId: string;

  @Column({ name: 'primary_team_id', type: 'char', length: 36, nullable: true })
  primaryTeamId: string;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager: User;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'primary_team_id' })
  primaryTeam: Team;

  @OneToMany(() => TeamMember, teamMember => teamMember.user)
  teamMemberships: TeamMember[];
  @ManyToMany(() => Role, role => role.users)
  @JoinTable({
  name: 'user_roles',
  joinColumn: { name: 'user_id', referencedColumnName: 'id' },
  inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
})
roles: Role[];
}