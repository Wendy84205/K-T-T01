import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
    constructor(
        private readonly chatService: ChatService,
        private readonly chatGateway: ChatGateway,
    ) { }

    @Get('conversations')
    async getUserConversations(@Request() req) {
        return this.chatService.getUserConversations(req.user.userId);
    }

    @Post('conversations/direct')
    async getOrCreateDirectConversation(@Request() req, @Body('otherUserId') otherUserId: string) {
        return this.chatService.getOrCreateDirectConversation(req.user.userId, otherUserId);
    }

    @Post('conversations/group')
    async createGroupConversation(
        @Request() req,
        @Body('name') name: string,
        @Body('memberIds') memberIds: string[],
    ) {
        return this.chatService.createGroupConversation(req.user.userId, name, memberIds);
    }

    @Get('conversations/:conversationId/messages')
    async getConversationMessages(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.chatService.getConversationMessages(
            conversationId,
            req.user.userId,
            page ? parseInt(page.toString(), 10) : 1,
            limit ? parseInt(limit.toString(), 10) : 50,
        );
    }

    @Post('conversations/:conversationId/messages')
    async sendMessage(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Body('content') content: string,
        @Body('messageType') messageType?: string,
        @Body('fileId') fileId?: string,
        @Body('parentMessageId') parentMessageId?: string,
    ) {
        const message = await this.chatService.sendMessage(
            conversationId,
            req.user.userId,
            content,
            messageType || 'text',
            fileId,
            parentMessageId,
        );

        // Emit to WebSocket
        this.chatGateway.emitNewMessage(conversationId, message);

        return message;
    }

    @Get('users')
    async getAllUsers(@Request() req) {
        return this.chatService.getAllUsers(req.user.userId);
    }

    @Delete('messages/:messageId')
    async deleteMessage(@Request() req, @Param('messageId') messageId: string) {
        return this.chatService.deleteMessage(messageId, req.user.userId);
    }

    @Post('messages/:messageId/edit')
    async editMessage(
        @Request() req,
        @Param('messageId') messageId: string,
        @Body('content') newContent: string,
    ) {
        return this.chatService.editMessage(messageId, req.user.userId, newContent);
    }

    @Post('messages/:messageId/forward')
    async forwardMessage(
        @Request() req,
        @Param('messageId') messageId: string,
        @Body('targetConversationId') targetConversationId: string,
    ) {
        return this.chatService.forwardMessage(messageId, targetConversationId, req.user.userId);
    }

    @Post('conversations/:conversationId/members')
    async addMemberToGroup(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Body('userId') newMemberId: string,
    ) {
        return this.chatService.addMemberToGroup(conversationId, req.user.userId, newMemberId);
    }

    @Post('conversations/:conversationId/leave')
    async leaveGroup(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.leaveGroup(conversationId, req.user.userId);
    }

    @Delete('conversations/:conversationId')
    async deleteConversation(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.deleteConversation(conversationId, req.user.userId);
    }

    @Post('conversations/:conversationId/typing')
    async setTyping(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Body('isTyping') isTyping: boolean,
    ) {
        return this.chatService.setTyping(conversationId, req.user.userId, isTyping);
    }

    @Get('conversations/:conversationId/typing')
    async getTypingUsers(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.getTypingUsers(conversationId, req.user.userId);
    }

    // Reactions
    @Post('messages/:messageId/reactions')
    async addReaction(
        @Request() req,
        @Param('messageId') messageId: string,
        @Body('emoji') emoji: string,
    ) {
        return this.chatService.addReaction(messageId, req.user.userId, emoji);
    }

    @Get('messages/:messageId/reactions')
    async getMessageReactions(@Param('messageId') messageId: string) {
        return this.chatService.getMessageReactions(messageId);
    }

    // Pinned messages
    @Post('conversations/:conversationId/pin')
    async pinMessage(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Body('messageId') messageId: string,
    ) {
        return this.chatService.pinMessage(conversationId, messageId, req.user.userId);
    }

    @Delete('conversations/:conversationId/pin/:messageId')
    async unpinMessage(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Param('messageId') messageId: string,
    ) {
        return this.chatService.unpinMessage(conversationId, messageId, req.user.userId);
    }

    @Get('conversations/:conversationId/pinned')
    async getPinnedMessages(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.getPinnedMessages(conversationId, req.user.userId);
    }

    // Search
    @Get('conversations/:conversationId/search')
    async searchMessages(
        @Request() req,
        @Param('conversationId') conversationId: string,
        @Query('q') query: string,
    ) {
        return this.chatService.searchMessages(conversationId, req.user.userId, query);
    }

    @Post('conversations/:conversationId/read')
    async markAsRead(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.markConversationAsRead(conversationId, req.user.userId);
    }

    @Get('calls/history')
    async getCallHistory(@Request() req) {
        return this.chatService.getCallHistory(req.user.userId);
    }

    // Conversation shared content
    @Get('conversations/:conversationId/media')
    async getSharedMedia(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.getSharedMedia(conversationId, req.user.userId);
    }

    @Get('conversations/:conversationId/files')
    async getSharedFiles(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.getSharedFiles(conversationId, req.user.userId);
    }

    @Get('conversations/:conversationId/links')
    async getSharedLinks(@Request() req, @Param('conversationId') conversationId: string) {
        return this.chatService.getSharedLinks(conversationId, req.user.userId);
    }

    // Discover Feature APIs
    @Get('discover/groups')
    async discoverPublicGroups(
        @Request() req,
        @Query('search') search?: string,
        @Query('category') category?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.chatService.discoverPublicGroups(
            req.user.userId,
            search,
            category,
            page ? parseInt(page.toString(), 10) : 1,
            limit ? parseInt(limit.toString(), 10) : 20,
        );
    }

    @Get('discover/users')
    async discoverSuggestedUsers(
        @Request() req,
        @Query('limit') limit?: number,
    ) {
        return this.chatService.discoverSuggestedUsers(
            req.user.userId,
            limit ? parseInt(limit.toString(), 10) : 10,
        );
    }

    @Post('groups/:conversationId/join')
    async joinPublicGroup(
        @Request() req,
        @Param('conversationId') conversationId: string,
    ) {
        const result = await this.chatService.joinPublicGroup(conversationId, req.user.userId);

        if (result.success && result.systemMessage) {
            this.chatGateway.emitNewMessage(conversationId, result.systemMessage);
        }

        return result;
    }
}
