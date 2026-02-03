import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';
import { Folder } from './folder.entity';
import { Team } from './../team-collaboration/team.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'original_name', length: 255, nullable: true })
  originalName: string;

  @Column({ length: 50, nullable: true })
  extension: string;

  @Column({ name: 'mime_type', length: 100, nullable: true })
  mimeType: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'storage_path', length: 500 })
  storagePath: string;

  @Column({ name: 'encrypted_storage_path', length: 500, nullable: true })
  encryptedStoragePath: string;

  @Column({ name: 'storage_provider', length: 50, default: 'local' })
  storageProvider: string;

  @Column({ length: 64 })
  checksum: string;

  @Column({ name: 'file_hash', length: 64 })
  fileHash: string;

  @Column({ name: 'hash_algorithm', length: 20, default: 'SHA-256' })
  hashAlgorithm: string;

  @Column({ name: 'encryption_key_id', type: 'varchar', length: 255, nullable: true })
  encryptionKeyId: string; // Base64 encoded key

  @Column({ name: 'is_encrypted', default: true })
  isEncrypted: boolean;

  @Column({ name: 'last_hash_verification', nullable: true })
  lastHashVerification: Date;

  @Column({ name: 'virus_scan_status', length: 20, default: 'pending' })
  virusScanStatus: string;

  @Column({ name: 'virus_scan_result', type: 'json', nullable: true })
  virusScanResult: Record<string, any>;

  @Column({ name: 'scanned_at', nullable: true })
  scannedAt: Date;

  @Column({ name: 'owner_id', type: 'char', length: 36 })
  ownerId: string;

  @Column({ name: 'folder_id', type: 'char', length: 36, nullable: true })
  folderId: string;

  @Column({ name: 'team_id', type: 'char', length: 36, nullable: true })
  teamId: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'is_approved', default: false })
  isApproved: boolean;

  @Column({ name: 'approval_status', length: 20, default: 'pending' })
  approvalStatus: string;

  @Column({ name: 'approval_by', type: 'char', length: 36, nullable: true })
  approvalBy: string;

  @Column({ name: 'approval_at', nullable: true })
  approvalAt: Date;

  @Column({ name: 'version_number', type: 'int', default: 1 })
  versionNumber: number;

  @Column({ name: 'is_latest_version', default: true })
  isLatestVersion: boolean;

  @Column({ name: 'share_token', length: 100, unique: true, nullable: true })
  shareToken: string;

  @Column({ type: 'json', default: () => "'{}'" })
  metadata: Record<string, any>;

  @Column({ name: 'deleted_at', nullable: true })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Folder, folder => folder.id, { nullable: true })
  @JoinColumn({ name: 'folder_id' })
  folder: Folder;

  @ManyToOne(() => Team, team => team.id, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}