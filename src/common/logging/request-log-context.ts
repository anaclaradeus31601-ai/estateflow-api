import type { Request } from 'express';

function normalizeRequestId(requestId: unknown) {
  if (
    typeof requestId === 'string' ||
    typeof requestId === 'number' ||
    requestId === null ||
    requestId === undefined
  ) {
    return requestId ?? null;
  }

  return JSON.stringify(requestId);
}

function getClientIp(request: Request) {
  const forwardedFor = request.headers['x-forwarded-for'];

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() ?? request.ip;
  }

  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }

  return request.ip;
}

export function buildRequestLogContext(request: Request) {
  return {
    requestId: normalizeRequestId(request.id),
    method: request.method,
    path: request.originalUrl || request.url,
    ip: getClientIp(request),
    userId: request.user?.sub ?? null,
    userRole: request.user?.role ?? null,
  };
}

export { normalizeRequestId };
