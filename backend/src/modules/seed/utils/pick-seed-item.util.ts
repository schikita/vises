import type { SeedRng } from '../types';

/** Pick one element from a non-empty readonly pool using the seed RNG. */
export const pickSeedItem = <T>(pool: readonly T[], rng: SeedRng): T =>
  pool[Math.floor(rng() * pool.length)]!;
