import type { ApplicationStatusTransitionActor } from '@vises/contracts';
import type { StaffTransitionActor } from '../types';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/** Narrow staff JWT role to a matrix actor (§4.C / FR-13). */
export const toStaffMatrixActor = (
  role: StaffTransitionActor['role'],
): ApplicationStatusTransitionActor => {
  if (role === 'admin' || role === 'superadmin' || role === 'agent') {
    return role;
  }
  return throwForbiddenRole();
};
