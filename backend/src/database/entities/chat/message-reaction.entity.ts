import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Message } from './message.entity';
import { User } from '../core/user.entity';

@Entity('message_reactions')
export class MessageReaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'message_id', type: 'char', length: 36 })
    messageId: string;

    @Column({ name: 'user_id', type: 'char', length: 36 })
    userId: string;

    @Column({ length: 10 })
    emoji: string;

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
