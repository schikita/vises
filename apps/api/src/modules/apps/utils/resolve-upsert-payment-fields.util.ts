import type { Application } from '../../database/entities/application.entity';
import { DEFAULT_PAYMENT_AMOUNT } from '../constants';
import type { UpsertAppDto } from '../dto/upsert-app.dto';
import type { UpsertPaymentFields } from '../types';

/**
 * Payment fields for staff upsert after agent write ACL is asserted.
 * Agents never supply payment fields (asserted earlier) — preserve row or defaults.
 * Admin|superadmin|manager take body values (unchanged).
 */
export const resolveUpsertPaymentFields = (
  role: string,
  body: UpsertAppDto,
  row: Application | null,
): UpsertPaymentFields => {
  if (role === 'agent') {
    if (row) {
      return {
        paymentAmount: row.paymentAmount,
        paymentPaid: row.paymentPaid,
        paymentNote: row.paymentNote,
      };
    }
    return {
      paymentAmount: DEFAULT_PAYMENT_AMOUNT,
      paymentPaid: false,
      paymentNote: '',
    };
  }

  return {
    paymentAmount: body.paymentAmount ?? DEFAULT_PAYMENT_AMOUNT,
    paymentPaid: Boolean(body.paymentPaid),
    paymentNote: body.paymentNote ?? '',
  };
};
