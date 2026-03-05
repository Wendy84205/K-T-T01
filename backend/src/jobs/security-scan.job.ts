import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { User } from '../database/entities/core/user.entity';
import { SecurityService } from '../modules/security/security.service';
import { AuditService } from '../common/service/audit.service';
import { EmailService } from '../common/service/email.service';
import { SecurityIncident } from '../database/entities/security/security-incident.entity';

@Injectable()
export class SecurityScanJob {
    private readonly logger = new Logger(SecurityScanJob.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(SecurityIncident)
        private readonly securityIncidentRepository: Repository<SecurityIncident>,
        private readonly securityService: SecurityService,
        private readonly auditService: AuditService,
        private readonly emailService: EmailService,
    ) { }

    /**
     * Run full security scan every night at 2 AM
     */
    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async handleSecurityScan() {
        this.logger.log('Starting daily security scan...');
        const scanTime = new Date();

        try {
            // 1. Scan for Inactive Accounts (No login for > 90 days)
            const inactiveThreshold = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
            const inactiveUsers = await this.userRepository.find({
                where: {
                    lastLoginAt: LessThan(inactiveThreshold),
                    status: 'active',
                },
            });

            if (inactiveUsers.length > 0) {
                this.logger.log(`Found ${inactiveUsers.length} inactive accounts. Disabling...`);
                for (const user of inactiveUsers) {
                    user.status = 'inactive';
                    await this.userRepository.save(user);

                    await this.auditService.createAuditLog({
                        userId: user.id,
                        eventType: 'ACCOUNT_DISABLED',
                        entityType: 'USER',
                        entityId: user.id,
                        description: 'Account disabled due to 90+ days of inactivity.',
                        severity: 'MEDIUM',
                    });
                }
            }

            // 2. Scan for Suspicious Login Patterns (Last 24h)
            const failedLoginAnalysis = await this.securityService.analyzeFailedLogins(24);
            const { suspiciousIPs } = failedLoginAnalysis;

            if (suspiciousIPs && suspiciousIPs.length > 0) {
                this.logger.warn(`Found ${suspiciousIPs.length} suspicious IPs with repeated failed logins.`);
                for (const s of suspiciousIPs) {
                    // Check if incident already exists for this IP in the last 24h
                    const existingIncident = await this.securityIncidentRepository.findOne({
                        where: {
                            ipAddress: s.ip,
                            status: 'ACTIVE',
                            incidentType: 'BRUTE_FORCE',
                            createdAt: Between(new Date(Date.now() - 24 * 60 * 60 * 1000), new Date()),
                        },
                    });

                    if (!existingIncident) {
                        const incident = this.securityIncidentRepository.create({
                            title: `Brute Force Attempt: ${s.ip}`,
                            incidentType: 'BRUTE_FORCE',
                            description: `Multiple failed login attempts detected from IP ${s.ip}. Attempts: ${s.attemptCount}`,
                            severity: s.attemptCount > 50 ? 'HIGH' : 'MEDIUM',
                            status: 'ACTIVE',
                            ipAddress: s.ip,
                            affectedResources: { analysis: s },
                        });
                        await this.securityIncidentRepository.save(incident);

                        // Notify admins of high severity alerts
                        if (incident.severity === 'HIGH') {
                            await this.emailService.sendSecurityAlert(
                                'admin@cybersecure.local',
                                `CRITICAL: Brute Force Attempt - ${s.ip}`,
                                `High volume of failed logins detected from IP ${s.ip}. Total attempts in 24h: ${s.attemptCount}. Please review firewall settings.`
                            );
                        }
                    }
                }
            }

            // 3. Generate summary report for today
            const today = new Date();
            const report = await this.securityService.getSecurityMetrics(
                new Date(today.setHours(0, 0, 0, 0)),
                new Date(today.setHours(23, 59, 59, 999))
            );

            await this.auditService.createAuditLog({
                eventType: 'SECURITY_SCAN_COMPLETED',
                entityType: 'SYSTEM',
                description: 'Scheduled daily security scan completed successfully.',
                metadata: {
                    inactiveFound: inactiveUsers.length,
                    suspiciousIPsFound: suspiciousIPs?.length || 0,
                    dailyMetrics: report,
                },
                severity: 'INFO',
            });

            this.logger.log('Daily security scan finished.');

        } catch (error) {
            this.logger.error(`Error in scheduled security scan: ${error.message}`);

            await this.auditService.createAuditLog({
                eventType: 'SECURITY_SCAN_ERROR',
                entityType: 'SYSTEM',
                description: `Critical error in scheduled security scan: ${error.message}`,
                severity: 'CRITICAL',
            });
        }
    }

    /**
     * Manual trigger for testing (optional)
     */
    async triggerScan() {
        return await this.handleSecurityScan();
    }
}