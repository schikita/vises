import { randomInt } from 'crypto';
import { INVITE_PASSWORD_ALPHABET } from '../constants';

/** Pick `n` random chars from the invite-password alphabet. */
export const pickInvitePasswordSegment = (n: number): string => {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += INVITE_PASSWORD_ALPHABET[randomInt(INVITE_PASSWORD_ALPHABET.length)];
  }
  return out;
};
