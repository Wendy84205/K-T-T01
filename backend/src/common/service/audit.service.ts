import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../database/entities/security/audit-log.entity';

@Injectable()
export class AuditService {
    constructor(
        @InjectRepository(AuditLog)
        private readonly auditLogRepository: Repository<AuditLog>,
    ) { }

    /**
     * Create a new audit log entry
     */
    async createAuditLog(data: {
        userId?: string;
        eventType: string;
        entityType: string;
        entityId?: string;
        action?: string;
        description?: string;
        oldValues?: any;
        newValues?: any;
        ipAddress?: string;
        userAgent?: string;
        severity?: string;
        metadata?: any;
    }): Promise<AuditLog> {
        const auditLog = this.auditLogRepository.create({
            ...data,
            severity: data.severity || 'INFO',
        });

        return await this.auditLogRepository.save(auditLog);
    }

    /**
     * Get logs for a specific user
     */
    async getUserLogs(userId: string, limit: number = 50) {
        return await this.auditLogRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }

    /**
     * Search and filter audit logs
     */
    async searchLogs(filters: any, page: number = 1, limit: number = 20) {
        const query = this.auditLogRepository.createQueryBuilder('log');

        if (filters.userId) query.andWhere('log.userId = :userId', { userId: filters.userId });
        if (filters.eventType) query.andWhere('log.eventType = :eventType', { eventType: filters.eventType });
        if (filters.entityType) query.andWhere('log.entityType = :entityType', { entityType: filters.entityType });
        if (filters.severity) query.andWhere('log.severity = :severity', { severity: filters.severity });

        if (filters.startDate && filters.endDate) {
            query.andWhere('log.createdAt BETWEEN :start AND :end', {
                start: filters.startDate,
                end: filters.endDate
            });
        }

        const [results, total] = await query
            .orderBy('log.createdAt', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        return {
            results,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    /**
     * Get recent critical security events
     */
    async getRecentCriticalEvents(limit: number = 10) {
        return await this.auditLogRepository.find({
            where: [
                { severity: 'HIGH' },
                { severity: 'CRITICAL' }
            ],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
}