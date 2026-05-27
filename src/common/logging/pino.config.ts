import { randomUUID } from 'crypto';
import type { Request } from 'express';
import type { Params } from 'nestjs-pino';
import {
  PINO_REDACT_PATHS,
  REDACTED_VALUE,
  sanitizeForLogging,
} from './redact-sensitive-data';

const isProduction = process.env.NODE_ENV === 'production';

type RequestWithOptionalId = Request & {
  id?: string | number;
};

function getClientIp(headers: Record<string, unknown>, fallback?: string) {
  const forwardedFor = headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() ?? fallback;
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return String(forwardedFor[0]);
  }

  return fallback;
}

function getRequestIdHeader(headers: Record<string, unknown>) {
  const requestId = headers['x-request-id'];

  if (typeof requestId === 'string' && requestId.trim().length > 0) {
    return requestId.trim();
  }

  if (Array.isArray(requestId) && requestId.length > 0) {
    return String(requestId[0]);
  }

  return undefined;
}

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: process.env.LOG_LEVEL ?? (isProduction ? 'info' : 'debug'),
    redact: {
      paths: PINO_REDACT_PATHS,
      censor: REDACTED_VALUE,
    },
    transport: isProduction
      ? undefined
      : {
          target: 'pino-pretty',
          options: {
            colorize: true,
            singleLine: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
    autoLogging: {
      ignore: (request) => {
        const url = request.url ?? '';
        return url === '/docs' || url.startsWith('/docs/');
      },
    },
    genReqId: (request, response) => {
      const requestId = getRequestIdHeader(request.headers) ?? randomUUID();

      response.setHeader('x-request-id', requestId);
      return requestId;
    },
    customLogLevel: (_request, response, error) => {
      if (error || response.statusCode >= 500) {
        return 'error';
      }

      if (response.statusCode >= 400) {
        return 'warn';
      }

      return 'info';
    },
    customProps: (request) => {
      const expressRequest = request as RequestWithOptionalId;

      return {
        context: 'HTTP',
        category: 'http',
        requestId: expressRequest.id ?? null,
        userId: expressRequest.user?.sub ?? null,
        userRole: expressRequest.user?.role ?? null,
        ip: getClientIp(expressRequest.headers, expressRequest.ip),
      };
    },
    serializers: {
      req: (request) => ({
        id: (request as RequestWithOptionalId).id,
        method: request.method,
        url: request.url,
        query: sanitizeForLogging(request.query),
        params: sanitizeForLogging(request.params),
        userAgent: request.headers['user-agent'],
      }),
      res: (response) => ({
        statusCode: response.statusCode,
      }),
    },
    customSuccessMessage: (request, response, responseTime) =>
      `${request.method} ${request.url} ${response.statusCode} ${responseTime.toFixed(1)}ms`,
    customErrorMessage: (request, response, error) =>
      `${request.method} ${request.url} ${response.statusCode} ${error.message}`,
  },
};
