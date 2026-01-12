import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';

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

  @Column({ name: 'size_bytes', type: 'bigint' })
  sizeBytes: number;

  @Column({ name: 'file_hash', length: 64, nullable: true })
  fileHash: string;

  @Column({ name: 'encryption_key_id', type: 'char', length: 36, nullable: true })
  encryptionKeyId: string;

  @Column({ name: 'changes_description', type: 'text', nullable: true })
  changesDescription: string;

  @Column({ name: 'changed_by', type: 'char', length: 36, nullable: true })
  changedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => File, file => file.id)
  @JoinColumn({ name: 'file_id' })
  file: File;
}