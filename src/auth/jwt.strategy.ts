import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthUser } from './types/auth-user.type';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';
import { PrismaService } from 'src/prisma/prisma.service';

type CookieRequest = Request & {
  cookies?: unknown;
};

function extractJwtFromCookie(request?: CookieRequest): string | null {
  if (!request) {
    return null;
  }

  const cookieStore = request.cookies;
  const cookieToken =
    cookieStore && typeof cookieStore === 'object'
      ? (cookieStore as Record<string, unknown>)[ACCESS_TOKEN_COOKIE]
      : undefined;
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  const authorization = request.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  return authorization.slice('Bearer '.length);
}

@Injectable()
// `passport-jwt` typings are compatible at runtime but not fully understood by the
// strict ESLint type-aware rules in this project, so we keep the strategy wiring localized here.
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    const options = {
      jwtFromRequest: extractJwtFromCookie,
      secretOrKey: process.env.JWT_SECRET ?? '',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options);
  }

  async validate(payload: AuthUser): Promise<AuthUser> {
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
      },
    });

    if (!session || session.userId !== payload.sub) {
      throw new UnauthorizedException();
    }

    if (session.expiresAt <= new Date()) {
      throw new UnauthorizedException();
    }

    return payload;
  }
}
