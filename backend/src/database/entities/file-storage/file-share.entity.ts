import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';

@Entity('file_shares')
export class FileShare {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_id', type: 'char', length: 36 })
  fileId: string;

  @Column({ name: 'shared_with_type', length: 10 })
  sharedWithType: string;

  @Column({ name: 'shared_with_id', type: 'char', length: 36 })
  sharedWithId: string;

  @Column({ name: 'permission_level', length: 20, default: 'view' })
  permissionLevel: string;

  @Column({ name: 'encryption_key_id', type: 'char', length: 36, nullable: true })
  encryptionKeyId: string;

  @Column({ name: 'share_token', length: 100, unique: true, nullable: true })
  shareToken: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'expires_at', nullable: true })
  expiresAt: Date;

  @Column({ name: 'download_limit', type: 'int', nullable: true })
  downloadLimit: number;

  @Column({ name: 'watermark_enabled', default: false })
  watermarkEnabled: boolean;

  @Column({ name: 'shared_by', type: 'char', length: 36, nullable: true })
  sharedBy: string;

  @Column({ name: 'shared_at', default: () => 'CURRENT_TIMESTAMP' })
  sharedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => File, file => file.id)
  @JoinColumn({ name: 'file_id' })
  file: File;
}