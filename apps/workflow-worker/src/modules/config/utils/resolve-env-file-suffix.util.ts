/**
 * Map NODE_ENV to env-file suffix: `dev` | `prod`.
 * Accepts short (`dev`/`prod`) and Nest CLI long (`development`/`production`).
 * Returns null when NODE_ENV is missing or unrecognized.
 */
export const resolveEnvFileSuffix = (
  nodeEnv: string | undefined,
): 'dev' | 'prod' | null => {
  const raw = nodeEnv?.trim().toLowerCase();
  if (!raw) return null;
  if (raw === 'dev' || raw === 'development') return 'dev';
  if (raw === 'prod' || raw === 'production') return 'prod';
  return null;
};
