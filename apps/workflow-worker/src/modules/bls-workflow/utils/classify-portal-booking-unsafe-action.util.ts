import { BLS_WORKFLOW_ERROR_CLASS } from '../constants';
import type { BlsWorkflowErrorClass } from '../types';

/**
 * Classify a forbidden booking automation action as NOT_SAFE_TO_REPEAT.
 *
 * Finalized VT-TASK-010 / REQ-019 (keep api mirror in sync):
 * - DEC-001 / CON-005: VisaType Submit (`#btnSubmit` / `OnSubmitVisaType`) is
 *   allowlisted — not in this unsafe set. Prior durable-bls TASK-012 / CON-006
 *   forbade Submit; that Submit ban is superseded here only. Do not rewrite
 *   the closed TASK-012 DONE doc.
 * - Premium Lounge Accept + payment confirm remain forbidden (CON-004 /
 *   this feature’s CON-006) → NOT_SAFE_TO_REPEAT.
 * - Slots unavailable / consent pending remain SAFE_TO_REPEAT at the booking
 *   client (not classified here).
 */
export const classifyPortalBookingUnsafeAction = (
  action: 'premium_lounge_accept' | 'payment_confirm',
): {
  errorClass: BlsWorkflowErrorClass;
  errorCode: string;
  errorMessage: string;
} => {
  const messages: Record<typeof action, string> = {
    premium_lounge_accept:
      'CON-006: must not Accept Premium Lounge / payConfirmModal',
    payment_confirm: 'CON-006: must not confirm payment',
  };

  return {
    errorClass: BLS_WORKFLOW_ERROR_CLASS.NOT_SAFE_TO_REPEAT,
    errorCode: `bls_booking_unsafe_${action}`,
    errorMessage: messages[action],
  };
};
