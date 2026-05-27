import type { Request } from 'express';
import type { ErrorResponse } from '../interfaces/error-response.interface';
import { normalizeRequestId } from '../logging/request-log-context';

export function buildErrorResponse(
  request: Request,
  statusCode: number,
  message: string | string[],
  error?: string,
): ErrorResponse {
  return {
    statusCode,
    message,
    error,
    requestId: normalizeRequestId(request.id),
    timestamp: new Date().toISOString(),
    path: request.url,
  };
}
