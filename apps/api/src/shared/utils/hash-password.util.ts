import * as bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../constants';

/** bcrypt hash compatible with Python `bcrypt.hashpw` / existing DB hashes (REQ-004). */
export const hashPassword = (plain: string): string =>
  bcrypt.hashSync(plain, bcrypt.genSaltSync(BCRYPT_SALT_ROUNDS));
