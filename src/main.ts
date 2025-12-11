import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { RequestLoggingInterceptor } from './common/interceptors/logging.interceptor';
import { LoggingService } from './common/logging/logging.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const loggingService = app.get(LoggingService);

  app.useGlobalInterceptors(new RequestLoggingInterceptor(loggingService));
  app.useGlobalFilters(new HttpExceptionFilter(loggingService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  SwaggerModule.setup(
    'doc',
    app,
    loadYaml(
      readFileSync(join(__dirname, '..', 'doc', 'api.yaml'), 'utf-8'),
    ) as OpenAPIObject,
  );

  process.on('uncaughtException', (error: Error) => {
    loggingService.error('Uncaught exception', {
      message: error.message,
      stack: error.stack,
    });
  });

  process.on('unhandledRejection', (reason: unknown) => {
    const reasonMessage =
      reason instanceof Error
        ? { message: reason.message, stack: reason.stack }
        : { reason };
    loggingService.error('Unhandled promise rejection', reasonMessage);
  });

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
