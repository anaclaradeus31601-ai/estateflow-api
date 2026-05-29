import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Auth } from 'src/auth/guard/auth.guard';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { UserRole } from '@prisma/client';

@ApiTags('notification')
@Controller('notification')
export class NotificationController {
    constructor(private readonly notificationService: NotificationService) { }

    @Post('send')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN)
    @ApiOperation({ summary: 'Enviar notificação' })
    @ApiResponse({ status: 201, description: 'Notificação enviada' })
    @ApiResponse({ status: 400, description: 'Dados inválidos' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão' })
    async sendNotification(@Body() createNotificationDto: CreateNotificationDto) {
        return await this.notificationService.sendNotification(createNotificationDto);
    }

    @Get('all')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN)
    @ApiOperation({ summary: 'Obter todas as notificações' })
    @ApiResponse({ status: 200, description: 'Notificações obtidas' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão' })
    async getAllNotifications() {
        return await this.notificationService.getAllNotifications();
    }

    @Get('me')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN, UserRole.CLIENT, UserRole.REALTOR)
    @ApiOperation({ summary: 'Obter notificações do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Notificações obtidas' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async getMyNotifications(@CurrentUser() user: AuthUser) {
        return await this.notificationService.getMyNotifications(user.sub);
    }

    @Get('me/unread')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN, UserRole.CLIENT, UserRole.REALTOR)
    @ApiOperation({ summary: 'Obter notificações do usuário autenticado' })
    @ApiResponse({ status: 200, description: 'Notificações obtidas' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async getMyUnreadNotifications(@CurrentUser() user: AuthUser) {
        return await this.notificationService.getUnreadNotificationsByUserId(user.sub);
    }

    @Patch('me/read/:id')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN, UserRole.CLIENT, UserRole.REALTOR)
    @ApiOperation({ summary: 'Marcar uma notificação do usuário autenticado como lida' })
    @ApiParam({ name: 'id', description: 'ID da notificação' })
    @ApiResponse({ status: 200, description: 'Notificação marcada como lida' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
    async markMyNotificationAsRead(
        @CurrentUser() user: AuthUser,
        @Param('id') id: string,
    ) {
        return await this.notificationService.markAsRead(id, user.sub);
    }

    @Patch('me/read-all')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN, UserRole.CLIENT, UserRole.REALTOR)
    @ApiOperation({ summary: 'Marcar todas as notificações do usuário autenticado como lidas' })
    @ApiResponse({ status: 200, description: 'Notificações marcadas como lidas' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    async markMyNotificationsAsRead(@CurrentUser() user: AuthUser) {
        return await this.notificationService.markAllAsRead(user.sub);
    }

    @Delete(':id')
    @ApiBearerAuth()
    @Auth(UserRole.ADMIN)
    @ApiOperation({ summary: 'Deletar notificação por ID' })
    @ApiParam({ name: 'id', description: 'ID da notificação' })
    @ApiResponse({ status: 200, description: 'Notificação deletada' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão' })
    @ApiResponse({ status: 404, description: 'Notificação não encontrada' })
    async deleteNotification(@Param('id') id: string) {
        return await this.notificationService.deleteNotification(id);
    }
}
