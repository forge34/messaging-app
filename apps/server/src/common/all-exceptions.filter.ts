import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { PinoLogger } from 'nestjs-pino';
import type { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: PinoLogger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {
    this.logger.setContext(AllExceptionsFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      this.logger.error({ err: exception }, 'Unhandled exception');
      return;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request & { id?: string }>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const isServerError = status >= 500;

    const context = {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl ?? req.url,
      statusCode: status,
    };

    if (isServerError) {
      this.logger.error({ ...context, err: exception }, 'Unhandled exception');
    } else {
      this.logger.warn(
        {
          ...context,
          message: exception instanceof Error ? exception.message : exception,
        },
        'Request failed',
      );
    }

    httpAdapter.reply(
      ctx.getResponse(),
      this.buildResponseBody(exception, status),
      status,
    );
  }

  private buildResponseBody(exception: unknown, status: number) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      return typeof response === 'string'
        ? { statusCode: status, message: response }
        : response;
    }

    return { statusCode: status, message: 'Internal server error' };
  }
}
