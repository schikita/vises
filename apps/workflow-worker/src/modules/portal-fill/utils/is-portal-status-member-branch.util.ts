import { PORTAL_STATUS_MEMBER_BRANCH } from '../constants/portal-status-member-branch.constants';
import type { PortalStatusMemberBranch } from '../types/portal-status-checkpoint.types';

const BRANCH_VALUES = new Set<string>(
  Object.values(PORTAL_STATUS_MEMBER_BRANCH),
);

export const isPortalStatusMemberBranch = (
  value: string,
): value is PortalStatusMemberBranch => BRANCH_VALUES.has(value);
