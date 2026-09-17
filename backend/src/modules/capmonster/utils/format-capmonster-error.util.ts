export const formatCapMonsterError = (
  phase: string,
  errorId: number,
  errorCode?: string | null,
  errorDescription?: string | null,
): string => {
  const parts = [`CapMonster ${phase} failed (errorId=${errorId}`];
  if (errorCode) parts.push(`code=${errorCode}`);
  if (errorDescription) parts.push(`description=${errorDescription}`);
  return `${parts.join('; ')})`;
};
