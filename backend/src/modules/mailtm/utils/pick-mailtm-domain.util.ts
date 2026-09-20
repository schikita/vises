import type { MailTmDomainMember } from '../types';

/**
 * Pick the first active Mail.tm domain (DEC-008). Prefer non-private when possible.
 */
export const pickMailTmDomain = (
  members: MailTmDomainMember[] | undefined,
): string => {
  const list = members ?? [];
  const active = list.filter((d) => d.isActive !== false);
  const pool = active.length > 0 ? active : list;
  const preferred =
    pool.find((d) => d.isPrivate !== true && (d.domain?.trim() ?? '').length > 0) ??
    pool.find((d) => (d.domain?.trim() ?? '').length > 0);
  const domain = preferred?.domain?.trim() ?? '';
  if (!domain) {
    throw new Error('no active Mail.tm domain available');
  }
  return domain;
};
