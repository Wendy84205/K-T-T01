import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../core/user.entity';
import { File } from '../file-storage/file.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'conversation_id', type: 'char', length: 36 })
  conversationId: string;

  @Column({ name: 'sender_id', type: 'char', length: 36 })
  senderId: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ name: 'encrypted_content', type: 'text', nullable: true })
  encryptedContent: string;

  @Column({ name: 'message_type', length: 20, default: 'text' })
  messageType: string;

  @Column({ name: 'is_encrypted', default: true })
  isEncrypted: boolean;

  @Column({ name: 'encryption_key_id', type: 'varchar', length: 255, nullable: true })
  encryptionKeyId: string;

  @Column({ name: 'encryption_algorithm', length: 50, default: 'AES-256-GCM' })
  encryptionAlgorithm: string;

  @Column({ name: 'initialization_vector', length: 64, nullable: true })
  initializationVector: string;

  @Column({ name: 'auth_tag', length: 64, nullable: true })
  authTag: string;

  @Column({ name: 'file_id', type: 'char', length: 36, nullable: true })
  fileId: string;

  @Column({ name: 'parent_message_id', type: 'char', length: 36, nullable: true })
  parentMessageId: string;

  @Column({ name: 'is_edited', default: false })
  isEdited: boolean;

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'delete_reason', length: 100, nullable: true })
  deleteReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Conversation, conversation => conversation.id)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => File, file => file.id, { nullable: true })
  @JoinColumn({ name: 'file_id' })
  file: File;
}