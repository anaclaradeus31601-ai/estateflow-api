import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { AuthUser } from './types/auth-user.type';
import type { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from './auth.constants';

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
  constructor() {
    const options = {
      jwtFromRequest: extractJwtFromCookie,
      secretOrKey: process.env.JWT_SECRET ?? '',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    super(options);
  }

  validate(payload: AuthUser): AuthUser {
    return payload;
  }
}
