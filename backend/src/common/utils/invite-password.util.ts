import { randomInt } from 'crypto';
import {
  INVITE_PASSWORD_ALPHABET,
  INVITE_PASSWORD_SEGMENT_LENGTH,
} from '../constants';

function pick(n: number): string {
  let out = '';
  for (let i = 0; i < n; i++) {
    out += INVITE_PASSWORD_ALPHABET[randomInt(INVITE_PASSWORD_ALPHABET.length)];
  }
  return out;
}

/** Format `{4}-{4}-{4}` invite/login password. */
export function generateInvitePassword(): string {
  const n = INVITE_PASSWORD_SEGMENT_LENGTH;
  return `${pick(n)}-${pick(n)}-${pick(n)}`;
}
