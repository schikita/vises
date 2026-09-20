import type { SeedRng } from '../types';

/** Zero-padded YYYY-MM-DD from year/month/day bounds via seed RNG. */
export const pickSeedDateString = (
  yearMin: number,
  yearMax: number,
  rng: SeedRng,
): string => {
  const year = yearMin + Math.floor(rng() * (yearMax - yearMin + 1));
  const month = 1 + Math.floor(rng() * 12);
  const day = 1 + Math.floor(rng() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};
