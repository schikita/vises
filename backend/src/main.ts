// Must be first: loads repo-root `.env` before AppModule reads process.env.
// Docker: no-op / no override (compose already injects env).
import './common/bootstrap-env';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DetailExceptionFilter } from './common/filters/detail-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors({
    origin: '*',
    credentials: false,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new DetailExceptionFilter());

  await app.listen(8100, '0.0.0.0');
}

void bootstrap();
