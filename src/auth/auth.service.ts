import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AuthUser } from './types/auth-user.type';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  // 🔐 LOGIN
  async login(
    email: string,
    password: string,
    request: any, // 👈 necessário para IP e user-agent
  ) {
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

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: '7d',
    });

    // 🌐 IP + USER AGENT (CORRIGIDO)
    const ip = (request.headers['x-forwarded-for'] as string) || request.socket?.remoteAddress;

    const userAgent = request.headers['user-agent'];

    // 🧠 SESSION (SaaS STYLE)
    await this.prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        ip: ip || null,
        userAgent: userAgent || null,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 🔁 REFRESH TOKEN ROTATION SAFE
  async refresh(refreshToken: string) {
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

    const newAccessToken = this.jwtService.sign(newPayload, {
      expiresIn: '15m',
    });

    const newRefreshToken = this.jwtService.sign(newPayload, {
      expiresIn: '7d',
    });

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