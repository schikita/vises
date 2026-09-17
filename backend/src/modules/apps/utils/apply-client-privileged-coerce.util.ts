import type { Application } from '../../database/entities/application.entity';
import {
  CLIENT_ALLOWED_STATUS,
  DEFAULT_APP_STATUS,
  DEFAULT_PAYMENT_AMOUNT,
} from '../constants';
import type { UpsertAppDto } from '../dto/upsert-app.dto';
import type { PrivilegedAppFields } from '../types';

/**
 * DEC-003 / REQ-011: clients cannot persist privileged payment/visit/manager
 * or statuses outside `{new, docs}`; staff unchanged.
 */
export const applyClientPrivilegedCoerce = (
  body: UpsertAppDto,
  row: Application | null,
): PrivilegedAppFields => {
  if (row) {
    const status =
      body.status !== undefined && CLIENT_ALLOWED_STATUS.has(body.status)
        ? body.status
        : row.status;
    return {
      status,
      paymentAmount: row.paymentAmount,
      paymentPaid: row.paymentPaid,
      paymentNote: row.paymentNote,
      visitDate: row.visitDate,
      visitTime: row.visitTime,
      visitPlace: row.visitPlace,
      manager: row.manager,
    };
  }

  const status =
    body.status !== undefined && CLIENT_ALLOWED_STATUS.has(body.status)
      ? body.status
      : DEFAULT_APP_STATUS;
  return {
    status,
    paymentAmount: DEFAULT_PAYMENT_AMOUNT,
    paymentPaid: false,
    paymentNote: '',
    visitDate: '',
    visitTime: '',
    visitPlace: '',
    manager: '',
  };
};
