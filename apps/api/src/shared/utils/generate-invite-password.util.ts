import { INVITE_PASSWORD_SEGMENT_LENGTH } from '../constants';
import { pickInvitePasswordSegment } from './pick-invite-password-segment.util';

/** Format `{4}-{4}-{4}` invite/login password. */
export const generateInvitePassword = (): string => {
  const n = INVITE_PASSWORD_SEGMENT_LENGTH;
  return `${pickInvitePasswordSegment(n)}-${pickInvitePasswordSegment(n)}-${pickInvitePasswordSegment(n)}`;
};
