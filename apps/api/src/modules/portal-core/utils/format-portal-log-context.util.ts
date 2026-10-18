import type { PortalLogContext } from '../types';

/** Nest Logger message prefix with run correlation ids (DEC-006). */
export const formatPortalLogContext = (ctx: PortalLogContext): string => {
  const parts = [
    `applicationId=${ctx.applicationId}`,
    `applicantId=${ctx.applicantId}`,
  ];
  if (ctx.runId) {
    parts.push(`runId=${ctx.runId}`);
  }
  return `[${parts.join(' ')}]`;
};
