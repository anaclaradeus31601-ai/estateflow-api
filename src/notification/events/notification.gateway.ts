import {
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import { ACCESS_TOKEN_COOKIE } from 'src/auth/auth.constants';
import type { AuthUser } from 'src/auth/types/auth-user.type';

type SocketWithUser = Socket & {
    data: {
        user?: AuthUser;
    };
};
// Função para parsear o header de cookies
function parseCookieHeader(cookieHeader?: string) {
    if (!cookieHeader) {
        return {};
    }

    return cookieHeader.split(';').reduce<Record<string, string>>((acc, part) => {
        const [rawKey, ...rawValue] = part.trim().split('=');
        if (!rawKey) {
            return acc;
        }

        acc[rawKey] = decodeURIComponent(rawValue.join('='));
        return acc;
    }, {});
}
// WebSocket gateway para notificações (frontend)
@WebSocketGateway({
    cors: {
        origin: 'http://localhost:5173',
        credentials: true,
    },
})
export class NotificationGateway {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
    ){}

    @WebSocketServer()
    server!: Server;
    //pegar o token
    private extractAccessToken(client: Socket) {
        const authToken = client.handshake.auth?.token;
        if (typeof authToken === 'string' && authToken.length > 0) {
            return authToken;
        }

        const cookies = parseCookieHeader(client.handshake.headers.cookie);
        return cookies[ACCESS_TOKEN_COOKIE] ?? null;
    }
    //verificar o token
    private async validateSocketUser(token: string) {
        const payload = this.jwtService.verify<AuthUser>(token, {
            secret: process.env.JWT_SECRET ?? '',
        });

        const session = await this.prisma.session.findUnique({
            where: { id: payload.sid },
            select: {
                id: true,
                userId: true,
                expiresAt: true,
            },
        });

        if (!session || session.userId !== payload.sub) {
            throw new UnauthorizedException('Invalid session');
        }

        if (session.expiresAt <= new Date()) {
            throw new UnauthorizedException('Expired session');
        }

        const user = await this.prisma.user.findUnique({
            where: { id: payload.sub },
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return payload;
    }
    //validar o token
    async handleConnection(client: SocketWithUser) {
        try {
            const token = this.extractAccessToken(client);

            if (!token) {
                client.disconnect();
                return;
            }

            const user = await this.validateSocketUser(token);
            client.data.user = user;
            await client.join(`user:${user.sub}`);
        } catch {
            client.disconnect();
        }
    }





    @SubscribeMessage('test')
    async handleTest(@MessageBody() data: unknown) {
        await this.server.emit('notification', {
            message: 'Hello from the server!',
            data,
        });
    }

    async sendNotification(userId: string, createNotificationDto: unknown) {
        await this.server
            .to(`user:${userId}`)
            .emit('notification:new', createNotificationDto);
    }

    async markNotificationAsRead(userId: string, notificationId: string) {
        await this.server.to(`user:${userId}`).emit('notification:read', notificationId);
    }

    async markAllNotificationsAsRead(userId: string) {
        await this.server.to(`user:${userId}`).emit('notification:read-all');
    }
}
