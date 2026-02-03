import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from '../../database/entities/chat/conversation.entity';
import { Message } from '../../database/entities/chat/message.entity';
import { ConversationMember } from '../../database/entities/chat/conversation-member.entity';
import { MessageReaction } from '../../database/entities/chat/message-reaction.entity';
import { PinnedMessage } from '../../database/entities/chat/pinned-message.entity';
import { User } from '../../database/entities/core/user.entity';

import { EncryptionService } from '../../common/service/encryption.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Conversation,
            Message,
            ConversationMember,
            MessageReaction,
            PinnedMessage,
            User,
        ]),
    ],
    controllers: [ChatController],
    providers: [ChatService, EncryptionService],
    exports: [ChatService],
})
export class ChatModule { }
