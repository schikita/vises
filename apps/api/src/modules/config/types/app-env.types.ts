import { z } from 'zod';
import { appEnvSchema } from '../schemas/app-env.schema';

export type AppEnv = z.infer<typeof appEnvSchema>;
