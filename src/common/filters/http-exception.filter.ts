import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggingService } from '../logging/logging.service';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggingService: LoggingService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, body } = this.getStatusAndBody(exception);
    const message = this.getMessage(exception);

    this.loggingService.error('Request failed:', {
      method: request.method,
      url: request.url,
      statusCode: status,
      message,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json(body);
  }

  private getStatusAndBody(exception: unknown) {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const rawBody = exception.getResponse();
      const body =
        typeof rawBody === 'string'
          ? { statusCode: status, message: rawBody }
          : { statusCode: status, ...(rawBody as Record<string, unknown>) };

      return { status, body };
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    return {
      status,
      body: { statusCode: status, message: 'Internal Server Error' },
    };
  }

  private getMessage(exception: unknown) {
    if (exception instanceof Error) {
      return exception.message;
    }
    if (typeof exception === 'string') {
      return exception;
    }
    try {
      return JSON.stringify(exception);
    } catch {
      return String(exception ?? 'Unknown error');
    }
  }
}
