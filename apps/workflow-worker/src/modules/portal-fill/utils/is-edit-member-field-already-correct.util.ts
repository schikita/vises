import type { EditMemberFieldCurrentValue } from '../types';

const normalizeYmd = (raw: string): string => {
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(raw.trim());
  return match ? match[1] : raw.trim();
};

/**
 * True when live control already matches intended plan value (safe skip).
 */
export const isEditMemberFieldAlreadyCorrect = (
  current: EditMemberFieldCurrentValue,
  intended: string,
): boolean => {
  const want = intended.trim();
  if (!want || current.kind === 'missing') {
    return false;
  }
  if (current.kind === 'date') {
    return normalizeYmd(current.value) === normalizeYmd(want);
  }
  if (current.kind === 'checkbox') {
    const wantChecked =
      want === 'true' || want === '1' || want.toLowerCase() === 'yes';
    return current.value === (wantChecked ? 'true' : 'false');
  }
  if (current.kind === 'radio') {
    return current.value === want;
  }
  if (current.kind === 'dropdown') {
    return current.value === want;
  }
  return current.value === want;
};
