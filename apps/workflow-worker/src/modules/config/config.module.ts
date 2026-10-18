import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import './bootstrap-env';
import { resolveBackendEnvPath, validateEnv } from './utils';

/**
 * Global Nest ConfigModule. Reads `backend/.env.dev` or `.env.prod` from
 * NODE_ENV when present, else `backend/.env` (via bootstrap-env +
 * envFilePath). Optional gitignored `*.local` sibling is applied in
 * bootstrap-env for host Nest overrides. Application code must use
 * ConfigService, not process.env.
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
