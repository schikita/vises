/**
 * Orchestrate BLS CAPTCHA: iframe → extract → captcha service → apply (REQ-003–006).
 * Images are captured immediately before createTask.
 * Confirm/submit runs for real (DEC-007); does not click `#btnVerify` (pipeline / Verified loop).
 */
import { Logger } from '@nestjs/common';
import type {
  PortalPage,
  SolvePortalBlsCaptchaInput,
  SolvePortalBlsCaptchaResult,
} from '../types';
import { applyBlsAnswer } from './apply-bls-answer.util';
import { extractBlsChallenge } from './extract-bls-challenge.util';
import { formatPortalLogContext } from '../../portal-core/utils/format-portal-log-context.util';
import { resolveCaptchaFrame } from './portal-captcha-frame.util';

const logger = new Logger('PortalCaptchaSolve');

/**
 * One extract → captcha-service create+poll → apply/confirm attempt.
 * Does not click `#btnVerify` and does not wait for `#btnVerified`
 * (owned by `runPortalCaptchaVerifiedLoop`).
 */
export const solvePortalBlsCaptcha = async (
  page: PortalPage,
  input: SolvePortalBlsCaptchaInput,
): Promise<SolvePortalBlsCaptchaResult> => {
  const waitTimeoutMs = input.waitTimeoutMs ?? input.timeoutMs;
  const logPrefix = input.logContext
    ? formatPortalLogContext(input.logContext)
    : '[captcha]';

  logger.log(`${logPrefix} phase=captcha_frame start`);
  const frame = await resolveCaptchaFrame(page, { waitTimeoutMs });
  logger.log(`${logPrefix} phase=captcha_frame success`);

  logger.log(`${logPrefix} phase=captcha_extract start`);
  const challenge = await extractBlsChallenge(frame, { waitTimeoutMs });
  logger.log(
    `${logPrefix} phase=captcha_extract success cells=${challenge.imagesBase64.length} taskArgumentLen=${challenge.taskArgument.length}`,
  );

  logger.log(`${logPrefix} phase=captcha_solve_api start`);
  const { answer, taskId } = await input.captchaProvider.solveBls3x3({
    captchaServiceApiKey: input.captchaServiceApiKey,
    imagesBase64: challenge.imagesBase64,
    taskArgument: challenge.taskArgument,
    timeoutMs: input.timeoutMs,
    pollIntervalMs: input.pollIntervalMs,
  });
  const trueCount = answer.filter(Boolean).length;
  logger.log(
    `${logPrefix} phase=captcha_solve_api success taskId=${taskId} trueCells=${trueCount}`,
  );

  logger.log(`${logPrefix} phase=captcha_apply start`);
  const applied = await applyBlsAnswer(frame, answer);
  logger.log(
    `${logPrefix} phase=captcha_apply success clicked=${applied.clickedIndices.length} confirmClicked=${applied.confirmClicked}`,
  );

  return {
    answer,
    taskId,
    clickedIndices: applied.clickedIndices,
    confirmClicked: applied.confirmClicked,
  };
};

