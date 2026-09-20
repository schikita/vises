import { isProdNodeEnv } from '../../config/utils';

/** DEC-001: truthy 1/true/yes; falsy 0/false/no; unset → on iff not prod. */
export const isDemoAuthEnabled = (
  demoAuthEnabled: string | undefined,
  nodeEnv: string,
): boolean => {
  const raw = demoAuthEnabled?.trim();
  if (raw) {
    const v = raw.toLowerCase();
    if (['1', 'true', 'yes'].includes(v)) return true;
    if (['0', 'false', 'no'].includes(v)) return false;
  }
  return !isProdNodeEnv(nodeEnv);
};
