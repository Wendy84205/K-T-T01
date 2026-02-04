import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Get()
    async getNotifications(
        @Req() req,
        @Query('page') page: string,
        @Query('limit') limit: string,
    ) {
        return this.notificationService.findAll(
            req.user.userId,
            parseInt(page) || 1,
            parseInt(limit) || 20,
        );
    }

    @Put('read-all')
    async markAllAsRead(@Req() req) {
        await this.notificationService.markAllAsRead(req.user.userId);
        return { success: true };
    }

    @Put(':id/read')
    async markAsRead(@Param('id') id: string, @Req() req) {
        return this.notificationService.markAsRead(id, req.user.userId);
    }

    @Delete('all')
    async deleteAll(@Req() req) {
        await this.notificationService.deleteAll(req.user.userId);
        return { success: true };
    }

    @Delete(':id')
    async delete(@Param('id') id: string, @Req() req) {
        await this.notificationService.delete(id, req.user.userId);
        return { success: true };
    }

    @Post('archive-read')
    async archiveRead(@Req() req) {
        await this.notificationService.archiveRead(req.user.userId);
        return { success: true };
    }
}
