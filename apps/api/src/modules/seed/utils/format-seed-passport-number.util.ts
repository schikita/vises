import type { SeedRng } from '../types';
import { pickSeedInt } from './pick-seed-int.util';

/** Belarus-style ordinary passport number for demo applicants. */
export const formatSeedPassportNumber = (rng: SeedRng): string =>
  `MP${String(pickSeedInt(1_000_000, 9_999_999, rng))}`;
