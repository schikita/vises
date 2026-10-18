/** True when NODE_ENV is prod (`prod` or `production`). */
export const isProdNodeEnv = (nodeEnv: string | undefined): boolean => {
  const raw = nodeEnv?.trim().toLowerCase();
  return raw === 'prod' || raw === 'production';
};
