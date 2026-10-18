import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WinstonLoggerService } from './modules/logger';

/**
 * Workflow worker entrypoint.
 * Exposes a minimal HTTP health surface; durable work is claim/runner driven.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['fatal', 'error', 'warn', 'log', 'debug', 'verbose'],
  });
  app.useLogger(app.get(WinstonLoggerService));
  app.setGlobalPrefix('api');

  const port = Number(process.env.PORT ?? process.env.WORKER_PORT ?? 8101);
  await app.listen(port, '0.0.0.0');
}

void bootstrap();
