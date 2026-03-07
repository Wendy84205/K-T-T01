import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Message } from '../database/entities/chat/message.entity';

@Injectable()
export class MessageCleanupJob {
    private readonly logger = new Logger(MessageCleanupJob.name);

    constructor(
        @InjectRepository(Message)
        private readonly messageRepository: Repository<Message>,
    ) { }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleExpiredMessages() {
        this.logger.debug('Executing Protocol: SECURE_WIPE - Checking for expired self-destruct messages...');

        try {
            const now = new Date();
            const expiredMessages = await this.messageRepository.find({
                where: {
                    expiresAt: LessThan(now),
                    isDeleted: false
                }
            });

            if (expiredMessages.length > 0) {
                this.logger.log(`Found ${expiredMessages.length} expired messages. Initializing automated deletion.`);

                // Soft delete or hard delete depending on security policy
                // We'll use soft delete with a specific reason for audit purposes
                for (const msg of expiredMessages) {
                    msg.isDeleted = true;
                    msg.deleteReason = 'SELF_DESTRUCT_EXPIRED';
                    msg.content = '[MESSAGE DISINTEGRATED]';
                    msg.encryptedContent = null;
                    msg.initializationVector = null;
                    msg.authTag = null;
                }

                await this.messageRepository.save(expiredMessages);
                this.logger.log('Protocol: SECURE_WIPE completed successfully.');
            }
        } catch (error) {
            this.logger.error('Protocol: SECURE_WIPE FAILED. Emergency containment required.', error.stack);
        }
    }
}
