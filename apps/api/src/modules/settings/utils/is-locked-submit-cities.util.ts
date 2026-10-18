/** True when cities JSON matches locked Minsk-only catalog (DEC-011). */
export const isLockedSubmitCities = (cities: string[] | null | undefined): boolean => {
  if (!cities || cities.length !== 1) return false;
  return cities[0] === 'Минск';
};
