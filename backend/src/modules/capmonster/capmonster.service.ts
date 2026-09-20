import { Injectable } from '@nestjs/common';
import {
  CAPMONSTER_CREATE_TASK_PATH,
  CAPMONSTER_GET_TASK_RESULT_PATH,
  CAPMONSTER_METADATA_TASK_BLS_3X3,
  CAPMONSTER_STATUS_PROCESSING,
  CAPMONSTER_STATUS_READY,
  CAPMONSTER_TASK_CLASS_RECOGNITION,
  CAPMONSTER_TASK_TYPE_COMPLEX_IMAGE,
} from './constants';
import type { ICaptchaSolver } from './interfaces';
import type {
  CapMonsterCreateTaskResponse,
  CapMonsterGetTaskResultResponse,
  SolveBls3x3ViaCapMonsterInput,
  SolveBls3x3ViaCapMonsterResult,
} from './types';
import { assertNineRawBase64 } from './utils/assert-nine-raw-base64.util';
import { capMonsterSleep } from './utils/capmonster-sleep.util';
import { classifyCapMonsterFailure } from './utils/classify-capmonster-failure.util';
import { createCapMonsterClientError } from './utils/create-capmonster-client-error.util';
import { formatCapMonsterError } from './utils/format-capmonster-error.util';
import { postCapMonsterJson } from './utils/post-capmonster-json.util';
import { validateBlsAnswer } from './utils/validate-bls-answer.util';

/**
 * CapMonster Cloud client (ComplexImage BLS 3×3 createTask + poll).
 * One attempt; no solve retries beyond polling. Never logs clientKey or
 * image base64 payloads (NFR-004). Portal DOM stays in portal-scrape.
 * Failures are typed CapMonsterClientError with transient/permanent class (DEC-001).
 */
@Injectable()
export class CapMonsterService implements ICaptchaSolver {
  async solveBls3x3(
    input: SolveBls3x3ViaCapMonsterInput,
  ): Promise<SolveBls3x3ViaCapMonsterResult> {
    const clientKey = input.clientKey.trim();
    if (!clientKey) {
      throw createCapMonsterClientError({
        message: 'CapMonster clientKey is empty',
        failureClass: classifyCapMonsterFailure({ source: 'validation' }),
        phase: 'validation',
      });
    }
    const taskArgument = input.taskArgument.trim();
    if (!taskArgument) {
      throw createCapMonsterClientError({
        message: 'CapMonster TaskArgument is empty',
        failureClass: classifyCapMonsterFailure({ source: 'validation' }),
        phase: 'validation',
      });
    }
    try {
      assertNineRawBase64(input.imagesBase64);
    } catch (err) {
      throw createCapMonsterClientError({
        message:
          err instanceof Error
            ? err.message
            : 'CapMonster image validation failed',
        failureClass: classifyCapMonsterFailure({ source: 'validation' }),
        phase: 'validation',
      });
    }

    const deadline = Date.now() + input.timeoutMs;
    const remaining = (): number => Math.max(0, deadline - Date.now());

    const createBody = {
      clientKey,
      task: {
        type: CAPMONSTER_TASK_TYPE_COMPLEX_IMAGE,
        class: CAPMONSTER_TASK_CLASS_RECOGNITION,
        imagesBase64: input.imagesBase64,
        metadata: {
          Task: CAPMONSTER_METADATA_TASK_BLS_3X3,
          TaskArgument: taskArgument,
        },
      },
    };

    const created = await postCapMonsterJson<CapMonsterCreateTaskResponse>(
      CAPMONSTER_CREATE_TASK_PATH,
      createBody,
      remaining(),
    );

    if (created.errorId !== 0 || created.taskId === undefined) {
      const errorCode = created.errorCode ?? undefined;
      throw createCapMonsterClientError({
        message: formatCapMonsterError(
          'createTask',
          created.errorId,
          created.errorCode,
          created.errorDescription,
        ),
        failureClass: classifyCapMonsterFailure({
          source: 'business',
          errorId: created.errorId !== 0 ? created.errorId : 1,
          errorCode: created.errorCode,
        }),
        phase: 'createTask',
        ...(errorCode ? { errorCode } : {}),
      });
    }

    const taskId = created.taskId;

    while (remaining() > 0) {
      const result = await postCapMonsterJson<CapMonsterGetTaskResultResponse>(
        CAPMONSTER_GET_TASK_RESULT_PATH,
        { clientKey, taskId },
        remaining(),
      );

      if (result.errorId !== 0) {
        const errorCode = result.errorCode ?? undefined;
        throw createCapMonsterClientError({
          message: formatCapMonsterError(
            'getTaskResult',
            result.errorId,
            result.errorCode,
            result.errorDescription,
          ),
          failureClass: classifyCapMonsterFailure({
            source: 'business',
            errorId: result.errorId,
            errorCode: result.errorCode,
          }),
          phase: 'getTaskResult',
          ...(errorCode ? { errorCode } : {}),
        });
      }

      if (result.status === CAPMONSTER_STATUS_READY) {
        try {
          const answer = validateBlsAnswer(result.solution?.answer);
          return { answer, taskId };
        } catch (err) {
          throw createCapMonsterClientError({
            message:
              err instanceof Error
                ? err.message
                : 'CapMonster solution validation failed',
            failureClass: classifyCapMonsterFailure({ source: 'validation' }),
            phase: 'getTaskResult',
          });
        }
      }

      if (
        result.status !== undefined &&
        result.status !== CAPMONSTER_STATUS_PROCESSING
      ) {
        throw createCapMonsterClientError({
          message: `CapMonster getTaskResult unexpected status="${result.status}"`,
          failureClass: classifyCapMonsterFailure({ source: 'unknown' }),
          phase: 'getTaskResult',
        });
      }

      const waitMs = Math.min(input.pollIntervalMs, remaining());
      if (waitMs <= 0) break;
      await capMonsterSleep(waitMs);
    }

    throw createCapMonsterClientError({
      message: `CapMonster getTaskResult timed out after ${input.timeoutMs}ms (taskId=${taskId})`,
      failureClass: classifyCapMonsterFailure({ source: 'poll_timeout' }),
      phase: 'getTaskResult',
    });
  }
}
