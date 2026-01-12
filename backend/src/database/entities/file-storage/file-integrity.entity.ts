import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { File } from './file.entity';

@Entity('file_integrity_logs')
export class FileIntegrityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'file_id', type: 'char', length: 36 })
  fileId: string;

  @Column({ name: 'original_hash', length: 64 })
  originalHash: string;

  @Column({ name: 'current_hash', length: 64 })
  currentHash: string;

  @Column({ name: 'last_verified_at', default: () => 'CURRENT_TIMESTAMP' })
  lastVerifiedAt: Date;

  @Column({ name: 'verification_result', length: 20, default: 'VALID' })
  verificationResult: string;

  @Column({ name: 'tampering_detected_at', nullable: true })
  tamperingDetectedAt: Date;

  @Column({ name: 'tampering_type', length: 50, nullable: true })
  tamperingType: string;

  @Column({ name: 'tampering_details', type: 'json', nullable: true })
  tamperingDetails: Record<string, any>;

  @Column({ name: 'reported_to', type: 'char', length: 36, nullable: true })
  reportedTo: string;

  @Column({ name: 'reported_at', nullable: true })
  reportedAt: Date;

  @Column({ name: 'action_taken', length: 100, nullable: true })
  actionTaken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => File, file => file.id)
  @JoinColumn({ name: 'file_id' })
  file: File;
}