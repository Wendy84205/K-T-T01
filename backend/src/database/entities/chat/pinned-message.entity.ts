import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { Conversation } from './conversation.entity';
import { User } from '../core/user.entity';

@Entity('pinned_messages')
export class PinnedMessage {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'conversation_id', type: 'char', length: 36 })
    conversationId: string;

    @Column({ name: 'message_id', type: 'char', length: 36 })
    messageId: string;

    @Column({ name: 'pinned_by', type: 'char', length: 36 })
    pinnedBy: string;

    @CreateDateColumn({ name: 'pinned_at' })
    pinnedAt: Date;

    // Relations
    @ManyToOne(() => Conversation, conversation => conversation.id)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => Message, message => message.id)
    @JoinColumn({ name: 'message_id' })
    message: Message;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'pinned_by' })
    user: User;
}
