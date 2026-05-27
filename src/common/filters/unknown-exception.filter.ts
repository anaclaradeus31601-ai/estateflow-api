import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import type { Request, Response } from 'express';
import { buildRequestLogContext } from '../logging/request-log-context';
import { buildErrorResponse } from '../utils/build-error-response';
import { HttpExceptionFilter } from './http-exception.filter';
import { PrismaExceptionFilter } from './prisma-exception.filter';

@Catch()
export class UnknownExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(UnknownExceptionFilter.name);
  private readonly httpFilter = new HttpExceptionFilter();
  private readonly prismaFilter = new PrismaExceptionFilter();

  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof HttpException) {
      return this.httpFilter.catch(exception, host);
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      return this.prismaFilter.catch(exception, host);
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof Error
        ? exception.message
        : 'Erro interno do servidor';

    this.logger.error(
      JSON.stringify({
        category: 'error',
        errorType: 'unknown_exception',
        ...buildRequestLogContext(request),
        message,
      }),
      exception instanceof Error ? exception.stack : undefined,
    );

    response
      .status(status)
      .json(
        buildErrorResponse(
          request,
          status,
          process.env.NODE_ENV === 'production'
            ? 'Erro interno do servidor'
            : message,
          'Internal Server Error',
        ),
      );
  }
}
