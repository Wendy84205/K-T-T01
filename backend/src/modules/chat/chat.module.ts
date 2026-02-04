import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Conversation } from '../../database/entities/chat/conversation.entity';
import { Message } from '../../database/entities/chat/message.entity';
import { ConversationMember } from '../../database/entities/chat/conversation-member.entity';
import { MessageReaction } from '../../database/entities/chat/message-reaction.entity';
import { PinnedMessage } from '../../database/entities/chat/pinned-message.entity';
import { CallLog } from '../../database/entities/chat/call-log.entity';
import { User } from '../../database/entities/core/user.entity';

import { EncryptionService } from '../../common/service/encryption.service';
import { ChatGateway } from './chat.gateway';
import { AuthModule } from '../auth/auth.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Conversation,
            Message,
            ConversationMember,
            MessageReaction,
            PinnedMessage,
            CallLog,
            User,
        ]),
        AuthModule,
    ],
    controllers: [ChatController],
    providers: [ChatService, EncryptionService, ChatGateway],
    exports: [ChatService],
})
export class ChatModule { }
