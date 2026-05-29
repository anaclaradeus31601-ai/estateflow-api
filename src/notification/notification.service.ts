import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
    EntityAlreadyExistsException,
    EntityNotFoundException,
} from 'src/common/exceptions';
import { NotificationGateway } from './events/notification.gateway';

@Injectable()
export class NotificationService {
    constructor(
        private prisma: PrismaService,
        private notificationGateway: NotificationGateway,
    ) { }

    private toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
        if (value === undefined) {
            return undefined;
        }

        return value as Prisma.InputJsonValue;
    }

    async safeSendNotification(createNotificationDto: CreateNotificationDto) {
        try {
            return await this.sendNotification(createNotificationDto);
        } catch {
            return null;
        }
    }

    async notifyUsers(
        userIds: Array<string | null | undefined>,
        notification: Omit<CreateNotificationDto, 'userId'>,
    ) {
        const uniqueUserIds = [...new Set(userIds.filter((userId): userId is string => Boolean(userId)))];

        await Promise.all(
            uniqueUserIds.map((userId) =>
                this.safeSendNotification({
                    userId,
                    ...notification,
                }),
            ),
        );
    }

    async notifyAdmins(notification: Omit<CreateNotificationDto, 'userId'>) {
        const admins = await this.prisma.user.findMany({
            where: { role: UserRole.ADMIN },
            select: { id: true },
        });

        await this.notifyUsers(
            admins.map((admin) => admin.id),
            notification,
        );
    }

    async sendNotification(createNotificationDto: CreateNotificationDto) {
        if (
            !createNotificationDto.userId ||
            !createNotificationDto.message ||
            !createNotificationDto.title ||
            !createNotificationDto.type
        ) {
            throw new BadRequestException('All required fields must be provided');
        }

        const notification = await this.prisma.notification.findFirst({
            where: {
                userId: createNotificationDto.userId,
                message: createNotificationDto.message,
                title: createNotificationDto.title,
                type: createNotificationDto.type,
            },
        });

        if (notification) {
            throw new EntityAlreadyExistsException('Notification already exists');
        }

        const createdNotification = await this.prisma.notification.create({
            data: {
                userId: createNotificationDto.userId,
                message: createNotificationDto.message,
                title: createNotificationDto.title,
                type: createNotificationDto.type,
                data: this.toJsonValue(createNotificationDto.data),
                readAt: createNotificationDto.readAt
                    ? new Date(createNotificationDto.readAt)
                    : null,
            },
        });

        await this.notificationGateway.sendNotification(
            createdNotification.userId,
            createdNotification,
        );

        return createdNotification;

    }

    async getAllNotifications() {
        return await this.prisma.notification.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getMyNotifications(userId: string) {
        return await this.prisma.notification.findMany({
            where: {
                userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async getUnreadNotificationsByUserId(userId: string) {
      
        return await this.prisma.notification.findMany({
            where: {
                userId,
                readAt: null,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }

    async markAsRead(notificationId: string, userId?: string) {
        const notification = await this.prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
        });

        if (!notification) {
            throw new EntityNotFoundException('Notification', notificationId);
        }

        if (userId && notification.userId !== userId) {
            throw new ForbiddenException('Você não pode atualizar esta notificação');
        }

        if (notification.readAt) {
            return notification;
        }

        const updatedNotification = await this.prisma.notification.update({
            where: {
                id: notificationId,
            },
            data: {
                readAt: new Date(),
            },
        });

        await this.notificationGateway.markNotificationAsRead(
            updatedNotification.userId,
            updatedNotification.id,
        );

        return updatedNotification;
    }

    async markAllAsRead(userId: string) {
        const notifications = await this.prisma.notification.findMany({
            where: {
                userId,
                readAt: null,
            },
        });

        if (notifications.length === 0) {
            throw new EntityNotFoundException('Unread notifications for user', userId);
        }

        const result = await this.prisma.notification.updateMany({
            where: {
                userId,
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });

        await this.notificationGateway.markAllNotificationsAsRead(userId);

        return result;
    }

    async deleteNotification(notificationId: string): Promise<void> {
        const notification = await this.prisma.notification.findUnique({
            where: {
                id: notificationId,
            },
        });

        if (!notification) {
            throw new EntityNotFoundException('Notification', notificationId);
        }

        await this.prisma.notification.delete({
            where: {
                id: notificationId,
            },
        });
    }
}
