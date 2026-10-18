import type { SeedRng } from '../types';
import { pickSeedInt } from './pick-seed-int.util';

/** Local mobile digits (no country prefix) for demo applicants. */
export const formatSeedPhone = (rng: SeedRng): string =>
  `29${String(pickSeedInt(100_0000, 999_9999, rng))}`;
