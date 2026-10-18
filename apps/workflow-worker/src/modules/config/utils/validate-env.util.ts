import { ZodError } from 'zod';
import { appEnvSchema } from '../schemas';

/**
 * Nest ConfigModule `validate` hook: Zod-parse required app env keys, then
 * return the full env bag.
 */
export const validateEnv = (
  env: Record<string, unknown>,
): Record<string, unknown> => {
  try {
    appEnvSchema.parse(env);
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join('; ');
      throw new Error(`Invalid environment: ${details}`);
    }
    throw err;
  }
  return env;
};
