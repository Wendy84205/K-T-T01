import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../core/user.entity';

@Entity('message_read_receipts')
export class MessageReadReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'message_id', type: 'char', length: 36 })
  messageId: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'read_at', default: () => 'CURRENT_TIMESTAMP' })
  readAt: Date;

  @Column({ name: 'read_with_device_id', length: 255, nullable: true })
  readWithDeviceId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relations
  @ManyToOne(() => Message, message => message.id)
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @ManyToOne(() => User, user => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;
}