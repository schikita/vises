/** UTC calendar day `YYYY-MM-DD` (parity with visits API date bounds). */
export const todayIsoDate = (): string => new Date().toISOString().slice(0, 10)
