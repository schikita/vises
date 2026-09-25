/**
 * Click cells where answer[i] === true, then Submit Selection (REQ-005 / REQ-006).
 */
import { CAPMONSTER_BLS_CELL_COUNT } from '../../capmonster/constants/capmonster.constants';
import {
  PORTAL_CAPTCHA_CELL_SORT_ROW_TOLERANCE_PX,
  PORTAL_CAPTCHA_SELECTORS,
  type PortalCaptchaSelectorSet,
} from '../constants';
import type {
  ApplyBlsAnswerInPageArg,
  ApplyBlsAnswerResult,
  PortalFrame,
  PortalPage,
} from '../types';
import { applyBlsAnswerInPage } from './apply-bls-answer-in-page.util';
import { assertCaptchaSelectorsReady } from './assert-captcha-selectors-ready.util';

export const applyBlsAnswer = async (
  context: PortalPage | PortalFrame,
  answer: boolean[],
  options?: { selectors?: PortalCaptchaSelectorSet },
): Promise<ApplyBlsAnswerResult> => {
  const selectors = options?.selectors ?? PORTAL_CAPTCHA_SELECTORS;
  assertCaptchaSelectorsReady(selectors);

  if (answer.length !== CAPMONSTER_BLS_CELL_COUNT) {
    throw new Error(
      `applyBlsAnswer expects boolean[${CAPMONSTER_BLS_CELL_COUNT}]; got length=${answer.length}`,
    );
  }
  for (let i = 0; i < answer.length; i += 1) {
    if (typeof answer[i] !== 'boolean') {
      throw new Error(`applyBlsAnswer answer[${i}] must be boolean`);
    }
  }

  const result = await context.evaluate(applyBlsAnswerInPage, {
    cellClickTargets: selectors.cellClickTargets,
    confirmControl: selectors.confirmControl,
    answer,
    cellCount: CAPMONSTER_BLS_CELL_COUNT,
    rowTolerancePx: PORTAL_CAPTCHA_CELL_SORT_ROW_TOLERANCE_PX,
  } satisfies ApplyBlsAnswerInPageArg);

  if (!result.ok || !result.clickedIndices) {
    throw new Error(
      `CAPTCHA apply failed: ${result.error ?? 'unknown error'}`,
    );
  }

  return {
    clickedIndices: result.clickedIndices,
    confirmClicked: result.confirmClicked === true,
  };
};
