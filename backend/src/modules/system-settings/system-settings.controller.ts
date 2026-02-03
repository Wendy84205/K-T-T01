import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('settings')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemSettingsController {
    constructor(private readonly settingsService: SystemSettingsService) { }

    @Get()
    @Roles('Admin')
    async getSettings() {
        return this.settingsService.getSettings();
    }

    @Post()
    @Roles('Admin')
    async updateSettings(@Body() config: any) {
        return this.settingsService.updateSettings(config);
    }
}
