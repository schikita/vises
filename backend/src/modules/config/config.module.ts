import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import './bootstrap-env';
import { resolveBackendEnvPath, validateEnv } from './utils';

/**
 * Global Nest ConfigModule. Reads `backend/.env` only (via bootstrap-env +
 * envFilePath). Application code must use ConfigService, not process.env.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveBackendEnvPath(),
      validate: validateEnv,
    }),
  ],
})
export class AppConfigModule {}
