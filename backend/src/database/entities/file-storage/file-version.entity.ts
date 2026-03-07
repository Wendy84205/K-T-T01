import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';
import { User } from '../core/user.entity';

@Entity('file_versions')
export class FileVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_id', type: 'char', length: 36 })
  fileId: string;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'storage_path', length: 500 })
  storagePath: string;

  @Column({ name: 'encrypted_storage_path', length: 500, nullable: true })
  encryptedStoragePath: string;

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ length: 64, nullable: true })
  checksum: string;

  @Column({ name: 'file_hash', length: 64 })
  fileHash: string;

  @Column({ name: 'encryption_key_id', type: 'varchar', length: 255, nullable: true })
  encryptionKeyId: string;

  @Column({ name: 'changed_by', type: 'char', length: 36 })
  changedBy: string;

  @Column({ name: 'changes_description', type: 'text', nullable: true })
  changesDescription: string;

  @Column({ type: 'json', default: () => "'{}'" })
  metadata: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => File, file => file.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'file_id' })
  file: File;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'changed_by' })
  creator: User;
}