/**
 * Orchestrate BLS CAPTCHA: iframe → extract → CapMonster → apply (REQ-003–006).
 * Images are captured immediately before createTask.
 */
import { Logger } from '@nestjs/common';
import type {
  PortalPage,
  SolvePortalBlsCaptchaInput,
  SolvePortalBlsCaptchaResult,
} from '../types';
import { solveBls3x3ViaCapMonster } from '../../capmonster';
import { applyBlsAnswer } from './apply-bls-answer.util';
import { extractBlsChallenge } from './extract-bls-challenge.util';
import { resolveCaptchaFrame } from './portal-captcha-frame.util';

const logger = new Logger('PortalCaptchaSolve');

/**
 * Full CapMonster BLS solve after Verify: enter GenerateCaptcha iframe,
 * extract visible 3×3 + TaskArgument, solve, click matches, submit.
 * Does not click #btnVerify — pipeline owns that.
 *
 * TEMP: confirm/submit (`#submit`) is locate-only (dry-run); real click is
 * commented in apply-bls-answer-in-page until testing is done.
 */
export const solvePortalBlsCaptcha = async (
  page: PortalPage,
  input: SolvePortalBlsCaptchaInput,
): Promise<SolvePortalBlsCaptchaResult> => {
  const waitTimeoutMs = input.waitTimeoutMs ?? input.timeoutMs;

  const frame = await resolveCaptchaFrame(page, { waitTimeoutMs });

  // REQ-003: capture image bytes immediately before createTask.
  const challenge = await extractBlsChallenge(frame, { waitTimeoutMs });

  const { answer, taskId } = await solveBls3x3ViaCapMonster({
    clientKey: input.clientKey,
    imagesBase64: challenge.imagesBase64,
    taskArgument: challenge.taskArgument,
    timeoutMs: input.timeoutMs,
    pollIntervalMs: input.pollIntervalMs,
  });

  const applied = await applyBlsAnswer(frame, answer);

  // TEMP dry-run: cells were clicked; confirm control was found but not clicked.
  if (applied.confirmClicked) {
    logger.log(
      `CAPTCHA confirm control (#submit) found and kinda clicked (dry-run; real submit commented out). cells=${applied.clickedIndices.join(',')}`,
    );
  }

  return {
    answer,
    taskId,
    clickedIndices: applied.clickedIndices,
    confirmClicked: applied.confirmClicked,
  };
};
