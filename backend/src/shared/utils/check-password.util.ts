import * as bcrypt from 'bcryptjs';

export const checkPassword = (plain: string, hashed: string): boolean => {
  try {
    return bcrypt.compareSync(plain, hashed);
  } catch {
    return false;
  }
};
