import type { MailTmMessageSummary } from '../types';

/** Prefer newest unread; fall back to newest overall when none unread. */
export const pickMailTmNewestMessage = (
  members: MailTmMessageSummary[],
  unreadOnly: boolean,
): MailTmMessageSummary | undefined => {
  const pool = unreadOnly
    ? members.filter((m) => m.seen !== true)
    : members;
  const effective = pool.length > 0 ? pool : members;
  if (effective.length === 0) {
    return undefined;
  }
  return [...effective].sort((a, b) => {
    const at = a.createdAt ? Date.parse(a.createdAt) : 0;
    const bt = b.createdAt ? Date.parse(b.createdAt) : 0;
    return bt - at;
  })[0];
};
