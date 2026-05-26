import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { buildErrorResponse } from '../utils/build-error-response';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message: string | string[] = exception.message;
    let error: string | undefined = HttpStatus[status];

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      const body = exceptionResponse as Record<string, unknown>;
      if (body.message !== undefined) {
        message = body.message as string | string[];
      }
      if (typeof body.error === 'string') {
        error = body.error;
      }
    }

    response
      .status(status)
      .json(buildErrorResponse(request, status, message, error));
  }
}
