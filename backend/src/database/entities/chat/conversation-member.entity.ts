import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../core/user.entity';

@Entity('conversation_members')
export class ConversationMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'char', length: 36 })
  conversationId: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ length: 20, default: 'member' })
  role: string;

  @Column({ name: 'encryption_key_id', type: 'varchar', length: 255, nullable: true })
  encryptionKeyId: string;

  @Column({ name: 'is_muted', default: false })
  isMuted: boolean;

  @Column({ name: 'is_pinned', default: false })
  isPinned: boolean;

  @Column({ name: 'joined_at', default: () => 'CURRENT_TIMESTAMP' })
  joinedAt: Date;

  @Column({ name: 'left_at', nullable: true })
  leftAt: Date;

  @Column({ name: 'last_read_at', nullable: true, default: () => 'CURRENT_TIMESTAMP' })
  lastReadAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Conversation, conversation => conversation.id)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}