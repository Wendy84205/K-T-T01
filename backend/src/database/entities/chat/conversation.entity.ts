import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Team } from '../team-collaboration/team.entity';
import { User } from '../core/user.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200, nullable: true })
  name: string;

  @Column({ name: 'avatar_url', length: 500, nullable: true })
  avatarUrl: string;

  @Column({ name: 'conversation_type', length: 20, default: 'direct' })
  conversationType: string;

  @Column({ name: 'team_id', type: 'char', length: 36, nullable: true })
  teamId: string;

  @Column({ name: 'is_private', default: true })
  isPrivate: boolean;

  @Column({ name: 'encryption_required', default: true })
  encryptionRequired: boolean;

  @Column({ name: 'default_encryption_key_id', type: 'char', length: 36, nullable: true })
  defaultEncryptionKeyId: string;

  @Column({ name: 'created_by', type: 'char', length: 36, nullable: true })
  createdBy: string;

  @Column({ name: 'last_message_at', nullable: true })
  lastMessageAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ length: 50, nullable: true })
  category: string; // For group categorization (Technology, Finance, Art, etc.)

  @Column({ name: 'is_verified', default: false })
  isVerified: boolean; // Verified/Official groups

  @Column({ type: 'text', nullable: true })
  description: string; // Group description

  @Column({ name: 'member_count', default: 0 })
  memberCount: number; // Cached member count

  // Relations
  @ManyToOne(() => Team, team => team.id, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @ManyToOne(() => User, user => user.id, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  creator: User;
}