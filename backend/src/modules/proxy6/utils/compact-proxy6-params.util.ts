import type { Proxy6QueryParams } from '../types';

/** Drop undefined entries from a params bag (keeps booleans for flag params). */
export const compactProxy6Params = (
  params: Proxy6QueryParams,
): Proxy6QueryParams => {
  const out: Proxy6QueryParams = {};
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      out[key] = value;
    }
  }
  return out;
};
