import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Conversation } from './conversation.entity';
import { User } from '../core/user.entity';

@Entity('call_logs')
export class CallLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'conversation_id', type: 'char', length: 36 })
    conversationId: string;

    @Column({ name: 'caller_id', type: 'char', length: 36 })
    callerId: string;

    @Column({ name: 'call_type', length: 20 }) // 'voice' or 'video'
    callType: string;

    @Column({ name: 'status', length: 20 }) // 'completed', 'missed', 'declined', 'ringing'
    status: string;

    @Column({ name: 'start_time', type: 'timestamp', nullable: true })
    startTime: Date;

    @Column({ name: 'end_time', type: 'timestamp', nullable: true })
    endTime: Date;

    @Column({ name: 'duration', type: 'integer', default: 0 }) // duration in seconds
    duration: number;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    // Relations
    @ManyToOne(() => Conversation, conversation => conversation.id)
    @JoinColumn({ name: 'conversation_id' })
    conversation: Conversation;

    @ManyToOne(() => User, user => user.id)
    @JoinColumn({ name: 'caller_id' })
    caller: User;
}
