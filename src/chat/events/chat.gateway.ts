import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { ACCESS_TOKEN_COOKIE } from 'src/auth/auth.constants';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { PrismaService } from 'src/prisma/prisma.service';

type SocketWithUser = Socket & {
  data: {
    user?: AuthUser;
  };
};

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

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class ChatGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  @WebSocketServer()
  server!: Server;

  private extractAccessToken(client: Socket) {
    const authToken = client.handshake.auth?.token;

    if (typeof authToken === 'string' && authToken.length > 0) {
      return authToken;
    }

    const cookies = parseCookieHeader(client.handshake.headers.cookie);
    return cookies[ACCESS_TOKEN_COOKIE] ?? null;
  }

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
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return payload;
  }

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

  @SubscribeMessage('chat:join-conversation')
  async handleJoinConversation(
    client: SocketWithUser,
    @MessageBody() payload: { conversationId?: string },
  ) {
    const conversationId = payload?.conversationId;
    const userId = client.data.user?.sub;

    if (!conversationId || !userId) {
      return;
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [{ clientId: userId }, { realtorId: userId }],
      },
      select: { id: true },
    });

    if (!conversation) {
      return;
    }

    await client.join(`conversation:${conversationId}`);
  }

  @SubscribeMessage('chat:leave-conversation')
  async handleLeaveConversation(
    client: Socket,
    @MessageBody() payload: { conversationId?: string },
  ) {
    const conversationId = payload?.conversationId;

    if (!conversationId) {
      return;
    }

    await client.leave(`conversation:${conversationId}`);
  }

  async emitConversationCreated(userIds: string[], conversation: unknown) {
    const uniqueUserIds = [...new Set(userIds)];

    await Promise.all(
      uniqueUserIds.map((userId) =>
        this.server.to(`user:${userId}`).emit('chat:conversation-created', conversation),
      ),
    );
  }

  async emitConversationUpdated(userIds: string[], conversation: unknown) {
    const uniqueUserIds = [...new Set(userIds)];

    await Promise.all(
      uniqueUserIds.map((userId) =>
        this.server.to(`user:${userId}`).emit('chat:conversation-updated', conversation),
      ),
    );
  }

  async emitMessageCreated(conversationId: string, userIds: string[], message: unknown) {
    await this.server.to(`conversation:${conversationId}`).emit('chat:message-created', message);

    const uniqueUserIds = [...new Set(userIds)];

    await Promise.all(
      uniqueUserIds.map((userId) =>
        this.server.to(`user:${userId}`).emit('chat:message-created', message),
      ),
    );
  }

  async emitMessageRead(conversationId: string, userIds: string[], payload: unknown) {
    await this.server.to(`conversation:${conversationId}`).emit('chat:message-read', payload);

    const uniqueUserIds = [...new Set(userIds)];

    await Promise.all(
      uniqueUserIds.map((userId) =>
        this.server.to(`user:${userId}`).emit('chat:message-read', payload),
      ),
    );
  }
}
