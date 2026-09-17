/**
 * CapMonster outcome notes for autofill reports (REQ-009 / DEC-011).
 * Never include API key or image base64 (NFR-004).
 */
export const buildCapMonsterNotes = (
  fill: {
    capMonsterAttempted?: boolean;
    capMonsterOk?: boolean;
    error?: string;
  },
  capMonsterApiKey: string | undefined,
): string[] => {
  if (!capMonsterApiKey) {
    return ['CapMonster: not configured'];
  }
  if (fill.capMonsterOk === true) {
    return ['CapMonster: succeeded'];
  }
  if (fill.capMonsterAttempted === true) {
    const reason = (fill.error ?? 'unknown').trim() || 'unknown';
    return [`CapMonster: failed: ${reason}`];
  }
  return ['CapMonster: not attempted'];
};
