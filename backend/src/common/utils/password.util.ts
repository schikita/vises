import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../constants';

/** bcrypt hash compatible with Python `bcrypt.hashpw` / existing DB hashes (REQ-004). */
export function hashPassword(plain: string): string {
  return bcrypt.hashSync(plain, bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS));
}

export function checkPassword(plain: string, hashed: string): boolean {
  try {
    return bcrypt.compareSync(plain, hashed);
  } catch {
    return false;
  }
}
