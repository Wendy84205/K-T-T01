import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('encryption_keys')
export class EncryptionKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'key_type', length: 50 })
  keyType: string;

  @Column({ name: 'key_name', length: 100 })
  keyName: string;

  @Column({ name: 'encrypted_key', type: 'text' })
  encryptedKey: string;

  @Column({ name: 'key_algorithm', length: 50, default: 'AES-256-GCM' })
  keyAlgorithm: string;

  @Column({ name: 'key_version', type: 'int', default: 1 })
  keyVersion: number;

  @Column({ name: 'key_owner_id', type: 'char', length: 36, nullable: true })
  keyOwnerId: string;

  @Column({ name: 'key_scope', length: 50, nullable: true })
  keyScope: string;

  @Column({ name: 'scope_id', type: 'char', length: 36, nullable: true })
  scopeId: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_date', type: 'date', default: () => 'CURRENT_DATE' })
  createdDate: Date;

  @Column({ name: 'rotation_date', type: 'date', nullable: true })
  rotationDate: Date;

  @Column({ name: 'next_rotation_date', type: 'date', nullable: true })
  nextRotationDate: Date;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'created_by', type: 'char', length: 36, nullable: true })
  createdBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'revoked_at', nullable: true })
  revokedAt: Date;

  @Column({ name: 'revoked_by', type: 'char', length: 36, nullable: true })
  revokedBy: string;
}