/**
 * Correlation ids for portal Nest Logger messages (nestjs-winston-logger DEC-006).
 * Always include applicationId + applicantId; runId once allocated.
 */
export type PortalLogContext = {
  applicationId: string;
  applicantId: string;
  runId?: string;
};
