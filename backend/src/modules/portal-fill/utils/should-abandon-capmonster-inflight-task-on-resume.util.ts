/**
 * On resume after process death, any in-flight captcha-service taskId must be abandoned
 * (DEC-005) — do not finish-poll across process boundaries.
 */
export const shouldAbandonCapMonsterInflightTaskOnResume = (
  inflightTaskId: string | null | undefined,
): boolean =>
  typeof inflightTaskId === 'string' && inflightTaskId.trim().length > 0;
