import type { SeedRng } from '../types';

/** Pick one element from a non-empty readonly pool using the seed RNG. */
export const pickSeedItem = <T>(pool: readonly T[], rng: SeedRng): T => {
  if (pool.length === 0) {
    throw new Error('pickSeedItem: pool must be non-empty');
  }
  const index = Math.floor(rng() * pool.length);
  const item = pool[index];
  if (item === undefined) {
    throw new Error(`pickSeedItem: missing element at index ${index}`);
  }
  return item;
};
