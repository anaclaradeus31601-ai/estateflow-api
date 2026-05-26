import type { CookieOptions } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const FIFTEEN_MINUTES_IN_MS = 15 * 60 * 1000;
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1000;

function isProduction() {
  return process.env.NODE_ENV === 'production';
}

export function buildAccessTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: FIFTEEN_MINUTES_IN_MS,
  };
}

export function buildRefreshTokenCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS_IN_MS,
  };
}

export function buildExpiredCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
  };
}
