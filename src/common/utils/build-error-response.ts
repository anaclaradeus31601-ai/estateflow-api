import type { Request } from 'express';
import type { ErrorResponse } from '../interfaces/error-response.interface';

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
    timestamp: new Date().toISOString(),
    path: request.url,
  };
}
