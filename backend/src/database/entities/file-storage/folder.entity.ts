import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../core/user.entity';
import { Team } from '../team-collaboration/team.entity';

@Entity('folders')
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ name: 'parent_folder_id', type: 'char', length: 36, nullable: true })
  parentFolderId: string;

  @Column({ name: 'owner_id', type: 'char', length: 36 })
  ownerId: string;

  @Column({ name: 'team_id', type: 'char', length: 36, nullable: true })
  teamId: string;

  @Column({ name: 'is_public', default: false })
  isPublic: boolean;

  @Column({ name: 'access_level', length: 20, default: 'private' })
  accessLevel: string;

  @Column({ name: 'encryption_required', default: true })
  encryptionRequired: boolean;

  @Column({ name: 'default_encryption_key_id', type: 'char', length: 36, nullable: true })
  defaultEncryptionKeyId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => Team, team => team.id, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;
}