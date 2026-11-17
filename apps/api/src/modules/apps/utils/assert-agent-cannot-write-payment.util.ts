import type { User } from '../../database/entities/user.entity';
import type { UpsertAppDto } from '../dto/upsert-app.dto';
import { throwForbiddenRole } from './throw-forbidden-role.util';

/**
 * OQ-ASAU-003 / DEC-ASAU-006 — agents must not write payment fields on upsert.
 * Presence of any payment field in the body is an explicit write attempt → 403.
 */
export const assertAgentCannotWritePayment = (
  user: User,
  body: UpsertAppDto,
): void => {
  if ((user.role as string) !== 'agent') {
    return;
  }
  if (
    body.paymentAmount !== undefined ||
    body.paymentPaid !== undefined ||
    body.paymentNote !== undefined
  ) {
    throwForbiddenRole();
  }
};
