import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    this.loggingService.log('Incoming request:', {
      method: request.method,
      url: request.url,
      query: request.query,
      body: request.body,
    });

    return next.handle().pipe(
      tap(() => {
        this.loggingService.log('Outgoing response:', {
          method: request.method,
          url: request.url,
          statusCode: response.statusCode,
        });
      }),
    );
  }
}
