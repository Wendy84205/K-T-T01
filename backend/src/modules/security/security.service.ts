// src/modules/security/security.service.ts - UPDATED WITH ALL METHODS
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, Like, IsNull, Not } from 'typeorm';
import { AuditLog } from '../../database/entities/security/audit-log.entity';
import { SecurityEvent } from '../../database/entities/security/security-event.entity';
import { RateLimit } from '../../database/entities/auth/rate-limit.entity';
import { FailedLoginAttempt } from '../../database/entities/auth/failed-login.entity';
import { SecurityAlert } from '../../database/entities/security/security-alert.entity';
import { SecurityPolicy } from '../../database/entities/security/security-policy.entity';
import { SystemLog } from '../../database/entities/security/system-log.entity';

@Injectable()
export class SecurityService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(SecurityEvent)
    private securityEventRepository: Repository<SecurityEvent>,
    @InjectRepository(RateLimit)
    private rateLimitRepository: Repository<RateLimit>,
    @InjectRepository(FailedLoginAttempt)
    private failedLoginRepository: Repository<FailedLoginAttempt>,
    @InjectRepository(SecurityAlert)
    private securityAlertRepository: Repository<SecurityAlert>,
    @InjectRepository(SecurityPolicy)
    private securityPolicyRepository: Repository<SecurityPolicy>,
    @InjectRepository(SystemLog)
    private systemLogRepository: Repository<SystemLog>,
  ) {}

  // ==================== EXISTING METHODS (KEEP THESE) ====================
  
  async logSecurityEvent(
    eventType: string,
    userId?: string,
    description?: string,
    metadata?: any,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM',
  ) {
    const event = this.securityEventRepository.create({
      eventType,
      userId,
      description,
      metadata,
      severity,
    });
    
    return await this.securityEventRepository.save(event);
  }

  async getSecurityEvents(
    page: number = 1,
    limit: number = 50,
    filters?: { 
      userId?: string; 
      eventType?: string;
      severity?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const query = this.securityEventRepository
      .createQueryBuilder('event')
      .orderBy('event.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.userId) {
      query.andWhere('event.userId = :userId', { userId: filters.userId });
    }
    
    if (filters?.eventType) {
      query.andWhere('event.eventType = :eventType', { eventType: filters.eventType });
    }
    
    if (filters?.severity) {
      query.andWhere('event.severity = :severity', { severity: filters.severity });
    }
    
    if (filters?.startDate && filters?.endDate) {
      query.andWhere('event.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const [data, total] = await query.getManyAndCount();
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async analyzeFailedLogins(
    hours: number = 24,
    ipAddress?: string,
    userId?: string,
  ) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const query = this.failedLoginRepository
      .createQueryBuilder('fl')
      .where('fl.createdAt >= :since', { since });

    if (ipAddress) {
      query.andWhere('fl.ipAddress = :ipAddress', { ipAddress });
    }
    
    if (userId) {
      query.andWhere('fl.userId = :userId', { userId });
    }

    const failedLogins = await query.getMany();

    // Analyze patterns
    const analysis = {
      totalAttempts: failedLogins.length,
      uniqueIPs: [...new Set(failedLogins.map(fl => fl.ipAddress))].length,
      uniqueUsers: [...new Set(failedLogins.filter(fl => fl.userId).map(fl => fl.userId))].length,
      timeDistribution: this.analyzeTimeDistribution(failedLogins),
      commonUserAgents: this.findCommonPatterns(failedLogins, 'userAgent'),
      suspiciousIPs: this.identifySuspiciousIPs(failedLogins),
    };

    return analysis;
  }

  private analyzeTimeDistribution(logs: any[]) {
    const hours = new Array(24).fill(0);
    
    logs.forEach(log => {
      const hour = new Date(log.createdAt).getHours();
      hours[hour]++;
    });
    
    return hours.map((count, hour) => ({ hour, count }));
  }

  private findCommonPatterns(logs: any[], field: string) {
    const frequency = {};
    
    logs.forEach(log => {
      const value = log[field];
      if (value) {
        frequency[value] = (frequency[value] || 0) + 1;
      }
    });
    
    return Object.entries(frequency)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, 10)
      .map(([value, count]) => ({ value, count }));
  }

  private identifySuspiciousIPs(logs: any[]) {
    const ipStats = {};
    
    logs.forEach(log => {
      const ip = log.ipAddress;
      ipStats[ip] = ipStats[ip] || { count: 0, usernames: new Set() };
      ipStats[ip].count++;
      if (log.username) {
        ipStats[ip].usernames.add(log.username);
      }
    });
    
    return Object.entries(ipStats)
      .filter(([_, stats]: any) => 
        stats.count > 10 || stats.usernames.size > 3
      )
      .map(([ip, stats]: any) => ({
        ip,
        attemptCount: stats.count,
        uniqueUsernames: stats.usernames.size,
        usernames: Array.from(stats.usernames),
      }));
  }

  async getRateLimitStatus(identifier: string) {
    const rateLimits = await this.rateLimitRepository.find({
      where: { identifier },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    return {
      identifier,
      recentAttempts: rateLimits.length,
      isBlocked: rateLimits.some(rl => rl.isBlocked),
      details: rateLimits,
    };
  }

  async getSecurityDashboard(days: number = 7) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const [
      totalEvents,
      failedLogins,
      blockedIPs,
      userActivities,
      eventTypes,
    ] = await Promise.all([
      // Total security events
      this.securityEventRepository.count({
        where: { createdAt: Between(startDate, new Date()) },
      }),
      
      // Failed login attempts
      this.failedLoginRepository
        .createQueryBuilder('fl')
        .select('DATE(fl.createdAt)', 'date')
        .addSelect('COUNT(*)', 'count')
        .where('fl.createdAt >= :startDate', { startDate })
        .groupBy('DATE(fl.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany(),
      
      // Blocked IPs
      this.rateLimitRepository
        .createQueryBuilder('rl')
        .select('rl.identifier', 'ip')
        .addSelect('COUNT(*)', 'blockCount')
        .where('rl.isBlocked = :isBlocked', { isBlocked: true })
        .andWhere('rl.createdAt >= :startDate', { startDate })
        .groupBy('rl.identifier')
        .orderBy('blockCount', 'DESC')
        .getRawMany(),
      
      // User activity
      this.securityEventRepository
        .createQueryBuilder('event')
        .select('event.userId', 'userId')
        .addSelect('COUNT(*)', 'eventCount')
        .addSelect('MAX(event.createdAt)', 'lastActivity')
        .where('event.createdAt >= :startDate', { startDate })
        .andWhere('event.userId IS NOT NULL')
        .groupBy('event.userId')
        .orderBy('eventCount', 'DESC')
        .limit(10)
        .getRawMany(),
      
      // Event type distribution
      this.securityEventRepository
        .createQueryBuilder('event')
        .select('event.eventType', 'eventType')
        .addSelect('COUNT(*)', 'count')
        .where('event.createdAt >= :startDate', { startDate })
        .groupBy('event.eventType')
        .orderBy('count', 'DESC')
        .getRawMany(),
    ]);

    return {
      summary: {
        totalEvents,
        days,
        startDate,
        endDate: new Date(),
      },
      failedLoginsTrend: failedLogins,
      topBlockedIPs: blockedIPs,
      mostActiveUsers: userActivities,
      eventTypeDistribution: eventTypes,
    };
  }

  // ==================== NEW METHODS FOR CONTROLLER ====================

  async getSecurityMetrics(startDate: Date, endDate: Date) {
    const metrics = {
      totalEvents: await this.securityEventRepository.count({
        where: { createdAt: Between(startDate, endDate) },
      }),
      totalAuditLogs: await this.auditLogRepository.count({
        where: { createdAt: Between(startDate, endDate) },
      }),
      failedLogins: await this.failedLoginRepository.count({
        where: { 
          createdAt: Between(startDate, endDate),
          isSuccessful: false,
        },
      }),
      blockedIPs: await this.rateLimitRepository.count({
        where: { 
          createdAt: Between(startDate, endDate),
          isBlocked: true,
        },
      }),
      severityBreakdown: await this.securityEventRepository
        .createQueryBuilder('event')
        .select('event.severity', 'severity')
        .addSelect('COUNT(*)', 'count')
        .where('event.createdAt BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .groupBy('event.severity')
        .getRawMany(),
    };

    return metrics;
  }

  async getAuditLogs(
    page: number = 1,
    limit: number = 50,
    filters?: any,
  ) {
    const query = this.auditLogRepository
      .createQueryBuilder('audit')
      .orderBy('audit.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }
    
    if (filters?.eventType) {
      query.andWhere('audit.eventType = :eventType', { eventType: filters.eventType });
    }
    
    if (filters?.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }
    
    if (filters?.startDate && filters?.endDate) {
      query.andWhere('audit.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const [data, total] = await query.getManyAndCount();
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAuditLogById(id: string) {
    const auditLog = await this.auditLogRepository.findOne({ where: { id } });
    
    if (!auditLog) {
      throw new NotFoundException('Audit log not found');
    }
    
    return auditLog;
  }

  async getSecurityEventById(id: string) {
    const event = await this.securityEventRepository.findOne({ where: { id } });
    
    if (!event) {
      throw new NotFoundException('Security event not found');
    }
    
    return event;
  }

  async resolveSecurityEvent(id: string, resolution: string, notes?: string) {
    const event = await this.securityEventRepository.findOne({ where: { id } });
    
    if (!event) {
      throw new NotFoundException('Security event not found');
    }

    event.resolution = resolution;
    event.resolvedAt = new Date();
    event.investigationNotes = notes;
    event.isInvestigated = true;
    
    return await this.securityEventRepository.save(event);
  }

  async getSuspiciousIPs(hours: number = 24) {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const suspiciousIPs = await this.failedLoginRepository
      .createQueryBuilder('fl')
      .select('fl.ipAddress', 'ip')
      .addSelect('COUNT(*)', 'attemptCount')
      .addSelect('COUNT(DISTINCT fl.username)', 'uniqueUsernames')
      .addSelect('MAX(fl.createdAt)', 'lastAttempt')
      .where('fl.createdAt >= :since', { since })
      .groupBy('fl.ipAddress')
      .having('COUNT(*) >= 10 OR COUNT(DISTINCT fl.username) >= 3')
      .orderBy('attemptCount', 'DESC')
      .getRawMany();

    return {
      analysisPeriodHours: hours,
      suspiciousIPs,
    };
  }

  async blockIPAddress(ipAddress: string, reason: string, durationHours: number) {
    const blockedUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);
    
    const rateLimit = this.rateLimitRepository.create({
      identifier: ipAddress,
      bucketType: 'ip_block',
      isBlocked: true,
      blockReason: reason,
      blockedUntil,
    });
    
    await this.rateLimitRepository.save(rateLimit);
    
    // Log the blocking action
    await this.logSecurityEvent(
      'IP_BLOCKED',
      null,
      `IP ${ipAddress} blocked: ${reason}`,
      { ipAddress, reason, durationHours, blockedUntil },
      'HIGH',
    );
    
    return {
      success: true,
      message: `IP ${ipAddress} blocked for ${durationHours} hours`,
      ipAddress,
      blockedUntil,
    };
  }

  async unblockIPAddress(ipAddress: string) {
    const rateLimits = await this.rateLimitRepository.find({
      where: { identifier: ipAddress, isBlocked: true },
    });
    
    if (rateLimits.length === 0) {
      throw new NotFoundException(`No active blocks found for IP ${ipAddress}`);
    }
    
    for (const rl of rateLimits) {
      rl.isBlocked = false;
      rl.blockedUntil = null;
      await this.rateLimitRepository.save(rl);
    }
    
    return {
      success: true,
      message: `IP ${ipAddress} unblocked`,
      ipAddress,
    };
  }

  async getAllRateLimits() {
    const rateLimits = await this.rateLimitRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
    
    const summary = {
      total: rateLimits.length,
      blockedCount: rateLimits.filter(rl => rl.isBlocked).length,
      byType: {},
    };
    
    // Group by bucket type
    rateLimits.forEach(rl => {
      if (!summary.byType[rl.bucketType]) {
        summary.byType[rl.bucketType] = 0;
      }
      summary.byType[rl.bucketType]++;
    });
    
    return {
      summary,
      details: rateLimits,
    };
  }

  async resetRateLimit(identifier: string) {
    await this.rateLimitRepository.delete({ identifier });
    
    return {
      success: true,
      message: `Rate limits reset for ${identifier}`,
    };
  }

  async getSecurityAlerts(active: boolean = true, severity?: string) {
    const query = this.securityAlertRepository
      .createQueryBuilder('alert')
      .orderBy('alert.createdAt', 'DESC');
    
    if (active) {
      query.andWhere('alert.status = :status', { status: 'ACTIVE' });
    }
    
    if (severity) {
      query.andWhere('alert.severity = :severity', { severity });
    }
    
    return await query.getMany();
  }

  async acknowledgeSecurityAlert(id: string, notes?: string) {
    const alert = await this.securityAlertRepository.findOne({ where: { id } });
    
    if (!alert) {
      throw new NotFoundException('Security alert not found');
    }
    
    alert.status = 'ACKNOWLEDGED';
    alert.acknowledgedAt = new Date();
    
    if (notes) {
      alert.description += `\n\nAcknowledgment Notes: ${notes}`;
    }
    
    return await this.securityAlertRepository.save(alert);
  }

  async resolveSecurityAlert(id: string, resolution: string, notes?: string) {
    const alert = await this.securityAlertRepository.findOne({ where: { id } });
    
    if (!alert) {
      throw new NotFoundException('Security alert not found');
    }
    
    alert.status = 'RESOLVED';
    alert.resolvedAt = new Date();
    
    if (notes) {
      alert.description += `\n\nResolution Notes: ${notes}`;
    }
    
    return await this.securityAlertRepository.save(alert);
  }

  async getSystemLogs(
    page: number = 1,
    limit: number = 100,
    filters?: any,
  ) {
    const query = this.systemLogRepository
      .createQueryBuilder('log')
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (filters?.level) {
      query.andWhere('log.level = :level', { level: filters.level });
    }
    
    if (filters?.component) {
      query.andWhere('log.component LIKE :component', { 
        component: `%${filters.component}%` 
      });
    }
    
    if (filters?.startDate && filters?.endDate) {
      query.andWhere('log.createdAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    const [data, total] = await query.getManyAndCount();
    
    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSecurityPolicies(type?: string) {
    const query = this.securityPolicyRepository
      .createQueryBuilder('policy')
      .orderBy('policy.createdAt', 'DESC');
    
    if (type) {
      query.andWhere('policy.policyType = :type', { type });
    }
    
    return await query.getMany();
  }

  async getSecurityPolicyById(id: string) {
    const policy = await this.securityPolicyRepository.findOne({ where: { id } });
    
    if (!policy) {
      throw new NotFoundException('Security policy not found');
    }
    
    return policy;
  }

  async createSecurityPolicy(policyData: any) {
    const policy = this.securityPolicyRepository.create(policyData);
    return await this.securityPolicyRepository.save(policy);
  }

  async updateSecurityPolicy(id: string, updates: any) {
    const policy = await this.securityPolicyRepository.findOne({ where: { id } });
    
    if (!policy) {
      throw new NotFoundException('Security policy not found');
    }
    
    Object.assign(policy, updates);
    policy.updatedAt = new Date();
    
    return await this.securityPolicyRepository.save(policy);
  }

  async toggleSecurityPolicy(id: string, isActive: boolean) {
    const policy = await this.securityPolicyRepository.findOne({ where: { id } });
    
    if (!policy) {
      throw new NotFoundException('Security policy not found');
    }
    
    policy.isActive = isActive;
    policy.updatedAt = new Date();
    
    return await this.securityPolicyRepository.save(policy);
  }

  async getActiveSessions(limit: number = 100) {
    // TODO: Implement with actual user sessions
    return {
      totalActiveSessions: 0,
      sessions: [],
      message: 'Session monitoring not implemented yet',
    };
  }

  async getCurrentActivity(minutes: number = 30) {
    const since = new Date(Date.now() - minutes * 60 * 1000);
    
    const activities = await this.auditLogRepository.find({
      where: { createdAt: Between(since, new Date()) },
      order: { createdAt: 'DESC' },
      take: 50,
    });
    
    return {
      analysisPeriodMinutes: minutes,
      totalActivities: activities.length,
      activities,
    };
  }

  async getRiskAssessment() {
    // TODO: Implement proper risk assessment
    return {
      overallRisk: 'LOW',
      factors: [],
      recommendations: [],
      lastAssessed: new Date(),
    };
  }

  async generateDailyReport(date: Date) {
    // TODO: Implement proper report generation
    return {
      reportType: 'DAILY',
      date,
      summary: 'Daily report not implemented yet',
      data: {},
    };
  }

  async generateWeeklyReport(startDate: Date) {
    // TODO: Implement proper report generation
    return {
      reportType: 'WEEKLY',
      startDate,
      endDate: new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000),
      summary: 'Weekly report not implemented yet',
      data: {},
    };
  }

  async generateCustomReport(reportType: string, startDate: Date, endDate: Date, filters?: any) {
    // TODO: Implement proper report generation
    return {
      reportType,
      startDate,
      endDate,
      filters,
      summary: 'Custom report not implemented yet',
      data: {},
    };
  }

  async checkFileIntegrity() {
    // TODO: Implement file integrity checks
    return {
      status: 'NOT_IMPLEMENTED',
      message: 'File integrity checks not implemented yet',
      checkedFiles: 0,
      violations: 0,
    };
  }

  async getIntegrityViolations(page: number = 1, limit: number = 50) {
    // TODO: Implement with actual integrity violations
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}