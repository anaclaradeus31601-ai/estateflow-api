import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Request, Response } from 'express';
import { buildRequestLogContext } from '../logging/request-log-context';
import { buildErrorResponse } from '../utils/build-error-response';
import { mapPrismaError } from './map-prisma-error';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = mapPrismaError(exception);

    this.logger.error(
      `${request.method} ${request.originalUrl} ${status}`,
      JSON.stringify({
        category: 'error',
        errorType: 'prisma_exception',
        ...buildRequestLogContext(request),
        prismaCode: exception.code,
        message,
      }),
    );

    response.status(status).json(buildErrorResponse(request, status, message));
  }
}
