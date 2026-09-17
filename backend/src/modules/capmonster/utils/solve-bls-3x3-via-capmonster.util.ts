/**
 * CapMonster Cloud createTask + poll getTaskResult until ready or timeout
 * (DEC-006 / DEC-007). One attempt; no solve retries beyond polling.
 * Never logs clientKey or image base64 payloads (NFR-004).
 */
import {
  CAPMONSTER_CREATE_TASK_PATH,
  CAPMONSTER_GET_TASK_RESULT_PATH,
  CAPMONSTER_METADATA_TASK_BLS_3X3,
  CAPMONSTER_STATUS_PROCESSING,
  CAPMONSTER_STATUS_READY,
  CAPMONSTER_TASK_CLASS_RECOGNITION,
  CAPMONSTER_TASK_TYPE_COMPLEX_IMAGE,
} from '../constants';
import type {
  CapMonsterCreateTaskResponse,
  CapMonsterGetTaskResultResponse,
  SolveBls3x3ViaCapMonsterInput,
  SolveBls3x3ViaCapMonsterResult,
} from '../types';
import { assertNineRawBase64 } from './assert-nine-raw-base64.util';
import { capMonsterSleep } from './capmonster-sleep.util';
import { formatCapMonsterError } from './format-capmonster-error.util';
import { postCapMonsterJson } from './post-capmonster-json.util';
import { validateBlsAnswer } from './validate-bls-answer.util';

export const solveBls3x3ViaCapMonster = async (
  input: SolveBls3x3ViaCapMonsterInput,
): Promise<SolveBls3x3ViaCapMonsterResult> => {
  const clientKey = input.clientKey.trim();
  if (!clientKey) {
    throw new Error('CapMonster clientKey is empty');
  }
  const taskArgument = input.taskArgument.trim();
  if (!taskArgument) {
    throw new Error('CapMonster TaskArgument is empty');
  }
  assertNineRawBase64(input.imagesBase64);

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
    throw new Error(
      formatCapMonsterError(
        'createTask',
        created.errorId,
        created.errorCode,
        created.errorDescription,
      ),
    );
  }

  const taskId = created.taskId;

  while (remaining() > 0) {
    const result = await postCapMonsterJson<CapMonsterGetTaskResultResponse>(
      CAPMONSTER_GET_TASK_RESULT_PATH,
      { clientKey, taskId },
      remaining(),
    );

    if (result.errorId !== 0) {
      throw new Error(
        formatCapMonsterError(
          'getTaskResult',
          result.errorId,
          result.errorCode,
          result.errorDescription,
        ),
      );
    }

    if (result.status === CAPMONSTER_STATUS_READY) {
      const answer = validateBlsAnswer(result.solution?.answer);
      return { answer, taskId };
    }

    if (
      result.status !== undefined &&
      result.status !== CAPMONSTER_STATUS_PROCESSING
    ) {
      throw new Error(
        `CapMonster getTaskResult unexpected status="${result.status}"`,
      );
    }

    const waitMs = Math.min(input.pollIntervalMs, remaining());
    if (waitMs <= 0) break;
    await capMonsterSleep(waitMs);
  }

  throw new Error(
    `CapMonster getTaskResult timed out after ${input.timeoutMs}ms (taskId=${taskId})`,
  );
};
