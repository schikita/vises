import { PORTAL_BOOKING_SELECTORS } from '../../portal-fill/constants/portal-booking.constants';
import { BLS_WORKFLOW_ERROR_CLASS } from '../constants';
import type { BlsHttpWorkflowErrorClass } from '../types';

/**
 * Classify a forbidden booking automation action as NOT_SAFE_TO_REPEAT
 * (CON-006). Callers must not click — return this class instead.
 */
export const classifyPortalBookingUnsafeAction = (
  action:
    | 'visa_type_submit'
    | 'on_submit_visa_type'
    | 'premium_lounge_accept'
    | 'payment_confirm',
): {
  errorClass: BlsHttpWorkflowErrorClass;
  errorCode: string;
  errorMessage: string;
} => {
  const messages: Record<typeof action, string> = {
    visa_type_submit: `CON-006: must not click #${PORTAL_BOOKING_SELECTORS.visaTypeSubmitButtonId}`,
    on_submit_visa_type: `CON-006: must not invoke ${PORTAL_BOOKING_SELECTORS.onSubmitVisaTypeFn}`,
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
