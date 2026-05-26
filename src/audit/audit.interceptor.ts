import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import type { Request } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { AuthUser } from 'src/auth/types/auth-user.type';

type AuditedRequest = Request & {
  user?: AuthUser;
  body?: Record<string, unknown>;
  params?: Record<string, unknown>;
  query?: Record<string, unknown>;
  method: string;
  originalUrl?: string;
  baseUrl?: string;
  route?: { path?: string };
  headers: Record<string, string | string[] | undefined>;
  socket?: { remoteAddress?: string };
};

const AUDITED_METHODS = new Set(['POST', 'PATCH', 'PUT', 'DELETE']);

function getHeaderValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | null {
  const value = headers[name];
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return null;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined) {
    return undefined;
  }

  return sanitizeObject(value) as Prisma.InputJsonValue;
}

function getResourceId(result: unknown): string | undefined {
  if (
    typeof result === 'object' &&
    result !== null &&
    'id' in result &&
    (typeof result.id === 'string' ||
      typeof result.id === 'number' ||
      typeof result.id === 'boolean')
  ) {
    return String(result.id);
  }

  return undefined;
}

function getRequestParam(
  params: Record<string, unknown> | undefined,
  name: string,
): string | undefined {
  const value = params?.[name];

  if (typeof value === 'string') {
    return value;
  }

  return undefined;
}

function getRoutePath(route: unknown): string {
  if (!route || typeof route !== 'object') {
    return '';
  }

  const path = (route as Record<string, unknown>).path;
  return typeof path === 'string' ? path : '';
}

function sanitizeObject(value: unknown): unknown {
  if (!value || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeObject);
  }

  return Object.entries(value as Record<string, unknown>).reduce<
    Record<string, unknown>
  >((acc, [key, currentValue]) => {
    if (
      [
        'password',
        'refresh_token',
        'refreshToken',
        'access_token',
        'accessToken',
      ].includes(key)
    ) {
      acc[key] = '[REDACTED]';
      return acc;
    }

    acc[key] = sanitizeObject(currentValue);
    return acc;
  }, {});
}

function resolveResource(path: string) {
  const segments = path.split('?')[0].split('/').filter(Boolean);

  if (segments[0] === 'admin') {
    return segments[1] ?? 'admin';
  }

  if (segments[0] === 'users' && segments[1] === 'me') {
    return 'users/me';
  }

  if (segments[0] === 'auth' && segments[1] === 'logout') {
    return 'auth/logout';
  }

  return segments[0] ?? 'unknown';
}

function resolveAction(method: string, path: string) {
  if (path.startsWith('/users/me') && method === 'PATCH') {
    return 'update_profile';
  }

  if (path.startsWith('/auth/logout') && method === 'POST') {
    return 'logout';
  }

  switch (method) {
    case 'POST':
      return 'create';
    case 'PATCH':
    case 'PUT':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'mutate';
  }
}

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest<AuditedRequest>();
    const response = context
      .switchToHttp()
      .getResponse<{ statusCode: number }>();
    const user = request.user;
    const method = request.method?.toUpperCase();

    if (
      !user ||
      !AUDITED_METHODS.has(method) ||
      (user.role !== UserRole.ADMIN && user.role !== UserRole.REALTOR)
    ) {
      return next.handle();
    }

    const routePath = getRoutePath(request.route);
    const path = request.originalUrl ?? `${request.baseUrl ?? ''}${routePath}`;

    return next.handle().pipe(
      tap((result: unknown) => {
        const resourceId =
          getRequestParam(request.params, 'id') ?? getResourceId(result);

        void this.auditService.create({
          actorId: user.sub,
          actorName: user.name,
          actorEmail: user.email,
          actorRole: user.role,
          action: resolveAction(method, path),
          resource: resolveResource(path),
          resourceId,
          method,
          path,
          requestBody: toJsonValue(request.body),
          requestParams: toJsonValue(request.params),
          requestQuery: toJsonValue(request.query),
          responseStatus: response.statusCode,
          ip:
            getHeaderValue(request.headers, 'x-forwarded-for') ??
            request.socket?.remoteAddress ??
            null,
          userAgent: getHeaderValue(request.headers, 'user-agent'),
        });
      }),
    );
  }
}
