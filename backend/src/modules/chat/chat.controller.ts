// TODO: Chat Controller Implementation
// 1. Create REST API endpoints for chat management
//    - POST /conversations - Create new conversation
//    - GET /conversations - Get user's conversations
//    - GET /conversations/:id - Get conversation details
//    - POST /conversations/:id/participants - Add participant
//    - DELETE /conversations/:id/participants/:userId - Remove participant
// 2. Message endpoints
//    - POST /conversations/:id/messages - Send message (fallback for non-WebSocket)
//    - GET /conversations/:id/messages - Get message history (pagination)
//    - PUT /messages/:id/read - Mark message as read
//    - DELETE /messages/:id - Delete message
// 3. Search and filter
//    - GET /messages/search?q=query&conversationId=xxx
// 4. File upload in chat
//    - POST /conversations/:id/files - Upload file to conversation
// 5. Authentication guards
//    - Use @UseGuards(JwtAuthGuard) for all endpoints
//    - Verify user is participant of conversation
// 6. DTOs
//    - CreateConversationDto
//    - SendMessageDto
//    - AddParticipantDto
//    - SearchMessagesDto
