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
    });
  }

  // 🔐 LOGIN
  async login(email: string, password: string, request: LoginRequest) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException();

    const payload: AuthUser = {
      sub: user.id,
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
        userId: user.id,
        refreshToken,
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
        secret: process.env.JWT_SECRET,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // 🔍 valida sessão (NÃO user.refreshToken mais)
    const session = await this.prisma.session.findFirst({
      where: { refreshToken },
    });

    if (!session) {
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
        refreshToken: newRefreshToken,
      },
    });

    return {
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  // 🚪 LOGOUT (SaaS STYLE)
  async logout(userId: string) {
    await this.prisma.session.deleteMany({
      where: { userId },
    });

    return { message: 'logged out' };
  }
}
