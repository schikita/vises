/** Return a new Date offset by whole UTC days from `base`. */
export const addSeedUtcDays = (base: Date, days: number): Date => {
  const next = new Date(base.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
};
