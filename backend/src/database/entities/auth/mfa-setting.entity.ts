import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('mfa_settings')
export class MfaSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36, unique: true })
  userId: string;

  @Column({ name: 'totp_enabled', default: false })
  totpEnabled: boolean;

  @Column({ name: 'totp_secret', length: 100, nullable: true })
  totpSecret: string;

  @Column({ name: 'totp_backup_codes', type: 'json', nullable: true })
  totpBackupCodes: string[];

  @Column({ name: 'totp_verified_at', nullable: true })
  totpVerifiedAt: Date;

  @Column({ name: 'sms_mfa_enabled', default: false })
  smsMfaEnabled: boolean;

  @Column({ name: 'phone_number', length: 20, nullable: true })
  phoneNumber: string;

  @Column({ name: 'sms_verified_at', nullable: true })
  smsVerifiedAt: Date;

  @Column({ name: 'email_mfa_enabled', default: false })
  emailMfaEnabled: boolean;

  @Column({ name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  @Column({ name: 'recovery_email', length: 255, nullable: true })
  recoveryEmail: string;

  @Column({ name: 'last_mfa_used', length: 20, nullable: true })
  lastMfaUsed: string;

  @Column({ name: 'mfa_failed_attempts', type: 'int', default: 0 })
  mfaFailedAttempts: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}