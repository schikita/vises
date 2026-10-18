/**
 * Orchestrate BLS CAPTCHA: dual-surface resolve → extract → captcha service → apply
 * (REQ-003–006 / portal-login-inline-captcha DEC-001 / DEC-005).
 * Images are captured immediately before createTask.
 * Confirm/submit runs for real with surface-appropriate control
 * (iframe `#submit` / inline `#btnVerify`); does not click pipeline-owned
 * entry Verify when that is distinct from confirm.
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
import { resolvePortalCaptchaChallengeContext } from './resolve-portal-captcha-challenge-context.util';

const logger = new Logger('PortalCaptchaSolve');

/**
 * One extract → captcha-service create+poll → apply/confirm attempt.
 * Does not wait for `#btnVerified` (owned by `runPortalCaptchaVerifiedLoop`).
 */
export const solvePortalBlsCaptcha = async (
  page: PortalPage,
  input: SolvePortalBlsCaptchaInput,
): Promise<SolvePortalBlsCaptchaResult> => {
  const waitTimeoutMs = input.waitTimeoutMs ?? input.timeoutMs;
  const logPrefix = input.logContext
    ? formatPortalLogContext(input.logContext)
    : '[captcha]';

  logger.log(`${logPrefix} phase=captcha_surface start`);
  const challengeCtx = await resolvePortalCaptchaChallengeContext(page, {
    waitTimeoutMs,
  });
  logger.log(
    `${logPrefix} phase=captcha_surface success surface=${challengeCtx.kind}`,
  );

  logger.log(`${logPrefix} phase=captcha_extract start surface=${challengeCtx.kind}`);
  const challenge = await extractBlsChallenge(challengeCtx.context, {
    waitTimeoutMs,
    selectors: challengeCtx.selectors,
  });
  logger.log(
    `${logPrefix} phase=captcha_extract success surface=${challengeCtx.kind} cells=${challenge.imagesBase64.length} taskArgumentLen=${challenge.taskArgument.length}`,
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

  logger.log(
    `${logPrefix} phase=captcha_apply start surface=${challengeCtx.kind} confirm=${challengeCtx.selectors.confirmControl}`,
  );
  const applied = await applyBlsAnswer(challengeCtx.context, answer, {
    selectors: challengeCtx.selectors,
  });
  logger.log(
    `${logPrefix} phase=captcha_apply success surface=${challengeCtx.kind} clicked=${applied.clickedIndices.length} confirmClicked=${applied.confirmClicked}`,
  );

  return {
    answer,
    taskId,
    clickedIndices: applied.clickedIndices,
    confirmClicked: applied.confirmClicked,
  };
};
