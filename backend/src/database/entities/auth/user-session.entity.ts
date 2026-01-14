import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'session_token', length: 512, unique: true })
  sessionToken: string;

  @Column({ name: 'refresh_token', length: 512, unique: true, nullable: true })
  refreshToken: string;

  @Column({ name: 'device_id', length: 255, nullable: true })
  deviceId: string;

  @Column({ name: 'device_name', length: 100, nullable: true })
  deviceName: string;

  @Column({ name: 'device_type', length: 50, nullable: true })
  deviceType: string;

  @Column({ name: 'device_fingerprint', type: 'text', nullable: true })
  deviceFingerprint: string;

  @Column({ length: 100, nullable: true })
  os: string;

  @Column({ length: 100, nullable: true })
  browser: string;

  @Column({ name: 'browser_fingerprint', type: 'text', nullable: true })
  browserFingerprint: string;

  @Column({ name: 'ip_address', length: 45 })
  ipAddress: string;

  @Column({ name: 'country_code', length: 2, nullable: true })
  countryCode: string;

  @Column({ length: 100, nullable: true })
  city: string;

  @Column({ name: 'is_vpn', default: false })
  isVpn: boolean;

  @Column({ name: 'is_trusted', default: false })
  isTrusted: boolean;

  @Column({ name: 'requires_mfa', default: true })
  requiresMfa: boolean;

  @Column({ name: 'risk_score', type: 'int', default: 0 })
  riskScore: number;

  @Column({ name: 'risk_factors', type: 'json', nullable: true })
  riskFactors: Record<string, any>;

  @Column({ name: 'issued_at', default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @Column({ name: 'last_accessed_at', default: () => 'CURRENT_TIMESTAMP' })
  lastAccessedAt: Date;

  @Column({ name: 'expires_at' })
  expiresAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date;

  @Column({ name: 'revoked_reason', length: 100, nullable: true })
  revokedReason: string;

  @Column({ name: 'revoked_by', type: 'char', length: 36, nullable: true })
  revokedBy: string;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}