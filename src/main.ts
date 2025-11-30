import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { load as loadYaml } from 'js-yaml';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
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

  await app.listen(process.env.PORT || 4000);
}
bootstrap();
