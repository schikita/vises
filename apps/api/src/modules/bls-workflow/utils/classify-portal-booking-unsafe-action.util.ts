import { BLS_WORKFLOW_ERROR_CLASS } from '../constants';
import type { BlsWorkflowErrorClass } from '../types';

/**
 * Classify a forbidden booking automation action as NOT_SAFE_TO_REPEAT
 * (CON-006). Callers must not click — return this class instead.
 * Selector cue strings are inlined so API does not import portal-fill.
 */
export const classifyPortalBookingUnsafeAction = (
  action:
    | 'visa_type_submit'
    | 'on_submit_visa_type'
    | 'premium_lounge_accept'
    | 'payment_confirm',
): {
  errorClass: BlsWorkflowErrorClass;
  errorCode: string;
  errorMessage: string;
} => {
  const messages: Record<typeof action, string> = {
    visa_type_submit: 'CON-006: must not click #btnSubmit',
    on_submit_visa_type: 'CON-006: must not invoke OnSubmitVisaType',
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
