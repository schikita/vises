import {
  CONSENT_MODAL_ALERT_ONCLICK_SUBSTRING,
  CONSENT_MODAL_ALERT_ROOT_SELECTOR,
  CONSENT_MODAL_ATTENTION_ACCEPT_TEXT,
  CONSENT_MODAL_ATTENTION_TITLE_TEXT,
  CONSENT_MODAL_DP_ONCLICK_SUBSTRING,
  CONSENT_MODAL_DP_ROOT_SELECTOR,
} from '../constants';
import type { ConsentModalActionArg, ConsentModalStepId } from '../types';

export const buildConsentModalActionArg = (
  stepId: ConsentModalStepId,
  action: 'inspect' | 'click',
): ConsentModalActionArg => ({
  action,
  stepId,
  alertRoot: CONSENT_MODAL_ALERT_ROOT_SELECTOR,
  dpRoot: CONSENT_MODAL_DP_ROOT_SELECTOR,
  alertOnclick: CONSENT_MODAL_ALERT_ONCLICK_SUBSTRING,
  dpOnclick: CONSENT_MODAL_DP_ONCLICK_SUBSTRING,
  attentionTitle: CONSENT_MODAL_ATTENTION_TITLE_TEXT,
  attentionAccept: CONSENT_MODAL_ATTENTION_ACCEPT_TEXT,
});
