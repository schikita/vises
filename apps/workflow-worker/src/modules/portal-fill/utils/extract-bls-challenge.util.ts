/**
 * Wait for challenge root on the CAPTCHA frame, then extract nine raw base64
 * images + TaskArgument. Captures bytes immediately for captcha-service createTask.
 */
import { CAPMONSTER_BLS_CELL_COUNT } from '../../capmonster/constants/capmonster.constants';
import { stripDataUriPrefix } from '../../capmonster/utils/strip-data-uri-prefix.util';
import {
  PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_B,
  PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_G,
  PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_R,
  PORTAL_CAPTCHA_CELL_SORT_ROW_TOLERANCE_PX,
  PORTAL_CAPTCHA_SELECTORS,
  PORTAL_CAPTCHA_TASK_ARGUMENT_PATTERN,
  type PortalCaptchaSelectorSet,
} from '../constants';
import type {
  BlsChallengeExtract,
  ExtractBlsChallengeInPageArg,
  PortalFrame,
  PortalPage,
} from '../types';
import { assertCaptchaSelectorsReady } from './assert-captcha-selectors-ready.util';
import { extractBlsChallengeInPage } from './extract-bls-challenge-in-page.util';

export const extractBlsChallenge = async (
  context: PortalPage | PortalFrame,
  options?: {
    selectors?: PortalCaptchaSelectorSet;
    waitTimeoutMs?: number;
  },
): Promise<BlsChallengeExtract> => {
  const selectors = options?.selectors ?? PORTAL_CAPTCHA_SELECTORS;
  assertCaptchaSelectorsReady(selectors);

  const waitTimeoutMs = options?.waitTimeoutMs ?? 30_000;
  try {
    await context.waitForSelector(selectors.challengeRoot, {
      state: 'visible',
      timeout: waitTimeoutMs,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `CAPTCHA challenge root not visible within ${waitTimeoutMs}ms: ${msg}`,
    );
  }

  const result = await context.evaluate(extractBlsChallengeInPage, {
    cellImages: selectors.cellImages,
    taskArgument: selectors.taskArgument,
    cellCount: CAPMONSTER_BLS_CELL_COUNT,
    camouflagedLabelMinR: PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_R,
    camouflagedLabelMinG: PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_G,
    camouflagedLabelMinB: PORTAL_CAPTCHA_CAMOUFLAGED_LABEL_MIN_B,
    rowTolerancePx: PORTAL_CAPTCHA_CELL_SORT_ROW_TOLERANCE_PX,
    taskArgumentPatternSource: PORTAL_CAPTCHA_TASK_ARGUMENT_PATTERN.source,
    taskArgumentPatternFlags: PORTAL_CAPTCHA_TASK_ARGUMENT_PATTERN.flags,
  } satisfies ExtractBlsChallengeInPageArg);

  if (!result.ok || !result.imagesBase64 || result.taskArgument === undefined) {
    throw new Error(
      `CAPTCHA extraction failed: ${result.error ?? 'unknown error'}`,
    );
  }

  const imagesBase64 = result.imagesBase64.map((raw) =>
    stripDataUriPrefix(raw).trim(),
  );
  if (imagesBase64.length !== CAPMONSTER_BLS_CELL_COUNT) {
    throw new Error(
      `CAPTCHA extraction produced ${imagesBase64.length} images; expected ${CAPMONSTER_BLS_CELL_COUNT}`,
    );
  }
  for (let i = 0; i < imagesBase64.length; i += 1) {
    if (!imagesBase64[i]) {
      throw new Error(`CAPTCHA extraction cell[${i}] base64 empty after prefix strip`);
    }
  }

  return {
    imagesBase64,
    taskArgument: result.taskArgument.trim(),
  };
};
