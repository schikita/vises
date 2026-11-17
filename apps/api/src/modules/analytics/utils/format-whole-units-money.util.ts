/**
 * Format whole currency units as a scale-2 decimal string (NFR-001 / DEC-ASAU-003).
 * `Application.paymentAmount` is stored as integer whole units.
 */
export const formatWholeUnitsMoney = (wholeUnits: number): string => {
  const safe = Number.isFinite(wholeUnits) ? wholeUnits : 0;
  return safe.toFixed(2);
};
