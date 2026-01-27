// TODO: Chat Module Configuration
// 1. Import required modules
//    - TypeOrmModule.forFeature([Conversation, ConversationMember, Message, MessageRead])
//    - Import EncryptionService from common/service
// 2. Register ChatGateway
//    - Add ChatGateway to providers
//    - Configure WebSocket CORS settings
// 3. Register ChatController and ChatService
// 4. Export ChatService for use in other modules
// 5. Configure Socket.IO options
//    - Set namespace (e.g., '/chat')
//    - Enable CORS for frontend
//    - Add JWT authentication middleware for WebSocket
//
// Example structure:
// @Module({
//   imports: [
//     TypeOrmModule.forFeature([Conversation, ConversationMember, Message, MessageRead]),
//   ],
//   controllers: [ChatController],
//   providers: [ChatService, ChatGateway, EncryptionService],
//   exports: [ChatService],
// })
// export class ChatModule {}
