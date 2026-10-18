import type { SeedRng } from '../types';

/** Inclusive integer in [min, max] from the seed RNG. */
export const pickSeedInt = (min: number, max: number, rng: SeedRng): number =>
  min + Math.floor(rng() * (max - min + 1));
