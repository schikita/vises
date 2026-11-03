/**
 * DEC-A1: derive required `User.name` from optional first/last names;
 * fall back to `login` when both are empty after trim.
 */
export const deriveRegisterDisplayName = (input: {
  firstName?: string;
  lastName?: string;
  login: string;
}): string => {
  const first = (input.firstName ?? '').trim();
  const last = (input.lastName ?? '').trim();
  const joined = [first, last].filter((part): boolean => part.length > 0).join(' ');
  if (joined.length > 0) {
    return joined;
  }
  return input.login;
};
