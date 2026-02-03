// src/modules/security/security.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { SecurityService } from './security.service';

@Controller('security')
@UseGuards(JwtAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class SecurityController {
  constructor(private readonly securityService: SecurityService) { }

  // ==================== SECURITY DASHBOARD ====================

  @Get('dashboard')
  @Roles('Admin', 'Manager')
  async getSecurityDashboard(@Query('days') days: string = '7') {
    const daysNumber = parseInt(days, 10);
    return this.securityService.getSecurityDashboard(daysNumber);
  }

  @Get('metrics')
  @Roles('Admin')
  async getSecurityMetrics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.securityService.getSecurityMetrics(start, end);
  }

  // ==================== AUDIT LOGS ====================

  @Get('audit-logs')
  @Roles('Admin')
  async getAuditLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('userId') userId?: string,
    @Query('eventType') eventType?: string,
    @Query('entityType') entityType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (userId) filters.userId = userId;
    if (eventType) filters.eventType = eventType;
    if (entityType) filters.entityType = entityType;

    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }

    return this.securityService.getAuditLogs(
      parseInt(page, 10),
      parseInt(limit, 10),
      filters,
    );
  }

  @Get('audit-logs/:id')
  @Roles('Admin')
  async getAuditLogById(@Param('id') id: string) {
    return this.securityService.getAuditLogById(id);
  }

  // ==================== SECURITY EVENTS ====================

  @Get('events')
  @Roles('Admin', 'Manager')
  async getSecurityEvents(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
    @Query('severity') severity?: string,
    @Query('eventType') eventType?: string,
    @Query('resolved') resolved?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (severity) filters.severity = severity;
    if (eventType) filters.eventType = eventType;
    if (resolved) filters.resolved = resolved === 'true';

    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }

    return this.securityService.getSecurityEvents(
      parseInt(page, 10),
      parseInt(limit, 10),
      filters,
    );
  }

  @Get('events/:id')
  @Roles('Admin', 'Manager')
  async getSecurityEventById(@Param('id') id: string) {
    return this.securityService.getSecurityEventById(id);
  }

  @Post('events/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async resolveSecurityEvent(
    @Param('id') id: string,
    @Body() body: { resolution: string; notes?: string },
  ) {
    return this.securityService.resolveSecurityEvent(
      id,
      body.resolution,
      body.notes,
    );
  }

  // ==================== FAILED LOGIN ANALYSIS ====================

  @Get('failed-logins')
  @Roles('Admin')
  async analyzeFailedLogins(
    @Query('hours') hours: string = '24',
    @Query('ipAddress') ipAddress?: string,
    @Query('userId') userId?: string,
  ) {
    return this.securityService.analyzeFailedLogins(
      parseInt(hours, 10),
      ipAddress,
      userId,
    );
  }

  @Get('suspicious-ips')
  @Roles('Admin')
  async getSuspiciousIPs(@Query('hours') hours: string = '24') {
    return this.securityService.getSuspiciousIPs(parseInt(hours, 10));
  }

  @Post('block-ip')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async blockIPAddress(
    @Body() body: { ipAddress: string; reason: string; durationHours: number },
  ) {
    return this.securityService.blockIPAddress(
      body.ipAddress,
      body.reason,
      body.durationHours,
    );
  }

  @Post('unblock-ip')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async unblockIPAddress(@Body() body: { ipAddress: string }) {
    return this.securityService.unblockIPAddress(body.ipAddress);
  }

  // ==================== RATE LIMITING ====================

  @Get('rate-limits')
  @Roles('Admin')
  async getRateLimits(@Query('identifier') identifier?: string) {
    if (identifier) {
      return this.securityService.getRateLimitStatus(identifier);
    }
    return this.securityService.getAllRateLimits();
  }

  @Post('rate-limits/reset')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async resetRateLimit(@Body() body: { identifier: string }) {
    return this.securityService.resetRateLimit(body.identifier);
  }

  // ==================== SECURITY ALERTS ====================

  @Get('alerts')
  @Roles('Admin', 'Manager')
  async getSecurityAlerts(
    @Query('active') active: string = 'true',
    @Query('severity') severity?: string,
  ) {
    return this.securityService.getSecurityAlerts(
      active === 'true',
      severity,
    );
  }

  @Post('alerts/:id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin', 'Manager')
  async acknowledgeAlert(
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.securityService.acknowledgeSecurityAlert(id, body.notes);
  }

  @Post('alerts/:id/resolve')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async resolveAlert(
    @Param('id') id: string,
    @Body() body: { resolution: string; notes?: string },
  ) {
    return this.securityService.resolveSecurityAlert(
      id,
      body.resolution,
      body.notes,
    );
  }

  // ==================== SYSTEM LOGS ====================

  @Get('system-logs')
  @Roles('Admin')
  async getSystemLogs(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '100',
    @Query('level') level?: string,
    @Query('component') component?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const filters: any = {};

    if (level) filters.level = level;
    if (component) filters.component = component;

    if (startDate && endDate) {
      filters.startDate = new Date(startDate);
      filters.endDate = new Date(endDate);
    }

    return this.securityService.getSystemLogs(
      parseInt(page, 10),
      parseInt(limit, 10),
      filters,
    );
  }

  // ==================== SECURITY POLICIES ====================

  @Get('policies')
  @Roles('Admin', 'Manager')
  async getSecurityPolicies(@Query('type') type?: string) {
    return this.securityService.getSecurityPolicies(type);
  }

  @Get('policies/:id')
  @Roles('Admin', 'Manager')
  async getSecurityPolicyById(@Param('id') id: string) {
    return this.securityService.getSecurityPolicyById(id);
  }

  @Post('policies')
  @HttpCode(HttpStatus.CREATED)
  @Roles('Admin')
  async createSecurityPolicy(@Body() body: any) {
    return this.securityService.createSecurityPolicy(body);
  }

  @Post('policies/:id')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async updateSecurityPolicy(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.securityService.updateSecurityPolicy(id, body);
  }

  @Post('policies/:id/toggle')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async toggleSecurityPolicy(
    @Param('id') id: string,
    @Body() body: { isActive: boolean },
  ) {
    return this.securityService.toggleSecurityPolicy(id, body.isActive);
  }

  // ==================== REAL-TIME MONITORING ====================

  @Get('monitoring/active-sessions')
  @Roles('Admin')
  async getActiveSessions(@Query('limit') limit: string = '100') {
    return this.securityService.getActiveSessions(parseInt(limit, 10));
  }

  @Get('monitoring/current-activity')
  @Roles('Admin')
  async getCurrentActivity(@Query('minutes') minutes: string = '30') {
    return this.securityService.getCurrentActivity(parseInt(minutes, 10));
  }

  @Get('monitoring/risk-assessment')
  @Roles('Admin')
  async getRiskAssessment() {
    return this.securityService.getRiskAssessment();
  }

  // ==================== SECURITY REPORTS ====================

  @Get('reports/daily')
  @Roles('Admin')
  async getDailySecurityReport(@Query('date') date?: string) {
    const reportDate = date ? new Date(date) : new Date();
    return this.securityService.generateDailyReport(reportDate);
  }

  @Get('reports/weekly')
  @Roles('Admin')
  async getWeeklySecurityReport(@Query('weekStart') weekStart?: string) {
    const startDate = weekStart ? new Date(weekStart) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return this.securityService.generateWeeklyReport(startDate);
  }

  @Post('reports/generate')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async generateCustomReport(@Body() body: {
    reportType: string;
    startDate: string;
    endDate: string;
    filters?: any;
  }) {
    return this.securityService.generateCustomReport(
      body.reportType,
      new Date(body.startDate),
      new Date(body.endDate),
      body.filters,
    );
  }

  // ==================== INTEGRITY CHECKS ====================

  @Post('integrity/check-files')
  @HttpCode(HttpStatus.OK)
  @Roles('Admin')
  async checkFileIntegrity() {
    return this.securityService.checkFileIntegrity();
  }

  @Get('integrity/violations')
  @Roles('Admin')
  async getIntegrityViolations(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '50',
  ) {
    return this.securityService.getIntegrityViolations(
      parseInt(page, 10),
      parseInt(limit, 10),
    );
  }

  @Get('network/traffic')
  @Roles('Admin', 'Manager')
  async getNetworkTraffic() {
    return this.securityService.getNetworkTraffic();
  }
}