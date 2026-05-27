import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import type { Request } from 'express';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthUser } from './types/auth-user.type';

type LoginRequest = Request & {
  headers: Request['headers'] & {
    'x-forwarded-for'?: string | string[];
    'user-agent'?: string | string[];
  };
};

function getRequestHeader(
  request: LoginRequest,
  name: 'x-forwarded-for' | 'user-agent',
): string | null {
  const value = request.headers[name];

  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  private getRefreshTokenSecret() {
    return process.env.JWT_REFRESH_SECRET ?? process.env.JWT_SECRET;
  }

  private signAccessToken(payload: AuthUser) {
    return this.jwtService.sign(payload, {
      expiresIn: '15m',
      jwtid: randomUUID(),
    });
  }

  private signRefreshToken(payload: AuthUser) {
    return this.jwtService.sign(payload, {
      expiresIn: '7d',
      jwtid: randomUUID(),
      secret: this.getRefreshTokenSecret(),
    });
  }

  private async hashToken(token: string) {
    return bcrypt.hash(token, 10);
  }

  // 🔐 LOGIN
  async login(email: string, password: string, request: LoginRequest) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException();

    const sessionId = randomUUID();

    const payload: AuthUser = {
      sub: user.id,
      sid: sessionId,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = this.signAccessToken(payload);
    const refreshToken = this.signRefreshToken(payload);

    // 🌐 IP + USER AGENT (CORRIGIDO)
    const ip =
      getRequestHeader(request, 'x-forwarded-for') ??
      request.socket?.remoteAddress ??
      null;

    const userAgent = getRequestHeader(request, 'user-agent');

    // 🧠 SESSION (SaaS STYLE)
    await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        refreshToken: await this.hashToken(refreshToken),
        ip,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 🔁 REFRESH TOKEN ROTATION SAFE
  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
    }

    let payload: AuthUser;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.expiresAt <= new Date()) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
      throw new UnauthorizedException('Session expired');
    }

    const tokenMatches = await bcrypt.compare(refreshToken, session.refreshToken);

    if (!tokenMatches) {
      throw new UnauthorizedException('Session not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // 🔥 ROTATION (gera novos tokens)
    const newPayload: AuthUser = {
      sub: user.id,
      sid: session.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const newAccessToken = this.signAccessToken(newPayload);
    const newRefreshToken = this.signRefreshToken(newPayload);

    // 🔄 atualiza session (ROTATION SEGURA)
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        refreshToken: await this.hashToken(newRefreshToken),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logoutCurrentSession(userId: string, refreshToken?: string) {
    if (!refreshToken) {
      return { message: 'logged out from current session' };
    }

    let payload: AuthUser;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });
    } catch {
      return { message: 'logged out from current session' };
    }

    if (payload.sub !== userId) {
      throw new UnauthorizedException('Invalid session');
    }

    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
    });

    if (
      session &&
      session.userId === userId &&
      session.expiresAt > new Date() &&
      (await bcrypt.compare(refreshToken, session.refreshToken))
    ) {
      await this.prisma.session.delete({
        where: { id: session.id },
      });
    }

    return { message: 'logged out from current session' };
  }

  async logoutAllSessions(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'logged out from all sessions' };
  }
}
