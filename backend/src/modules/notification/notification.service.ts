import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification/notification.entity';

@Injectable()
export class NotificationService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) { }

    async create(data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        data?: any;
        priority?: string;
        category?: string;
        actionUrl?: string;
        actionLabel?: string;
    }): Promise<Notification> {
        const notification = this.notificationRepository.create({
            ...data,
            isRead: false,
            createdAt: new Date(),
        });
        return await this.notificationRepository.save(notification);
    }

    async findAll(userId: string, page = 1, limit = 20): Promise<any> {
        const [items, total] = await this.notificationRepository.findAndCount({
            where: { userId, isArchived: false },
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        const unreadCount = await this.notificationRepository.count({
            where: { userId, isRead: false, isArchived: false },
        });

        return {
            items,
            total,
            unreadCount,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async markAsRead(id: string, userId: string): Promise<Notification> {
        const notification = await this.notificationRepository.findOne({
            where: { id, userId },
        });
        if (!notification) throw new NotFoundException('Notification not found');

        notification.isRead = true;
        notification.readAt = new Date();
        return await this.notificationRepository.save(notification);
    }

    async markAllAsRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, isRead: false },
            { isRead: true, readAt: new Date() },
        );
    }

    async delete(id: string, userId: string): Promise<void> {
        const result = await this.notificationRepository.delete({ id, userId });
        if (result.affected === 0) throw new NotFoundException('Notification not found');
    }

    async deleteAll(userId: string): Promise<void> {
        await this.notificationRepository.delete({ userId });
    }

    async archiveRead(userId: string): Promise<void> {
        await this.notificationRepository.update(
            { userId, isRead: true },
            { isArchived: true },
        );
    }
}
