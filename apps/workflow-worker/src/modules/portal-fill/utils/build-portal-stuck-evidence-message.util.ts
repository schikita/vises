import type { PortalStuckEvidenceBag } from '../types';

const MAX_EVIDENCE_CHARS = 500;
const MAX_RECOGNITION_CHARS = 200;

/**
 * Format stuck evidence bag into a durable ≤500-char message (FR-8).
 * Never include passwords / OTP / captcha solutions.
 */
export const buildPortalStuckEvidenceMessage = (
  evidence: PortalStuckEvidenceBag,
): string => {
  const parts: string[] = [];

  if (evidence.stuckPoint) {
    parts.push(`stuckPoint=${evidence.stuckPoint}`);
  }
  if (evidence.pageUrl) {
    parts.push(`pageUrl=${evidence.pageUrl}`);
  }
  if (
    evidence.httpStatus !== undefined &&
    evidence.httpStatus !== null
  ) {
    parts.push(`httpStatus=${evidence.httpStatus}`);
  }
  if (evidence.resumeHint) {
    parts.push(`resumeHint=${evidence.resumeHint}`);
  }
  if (evidence.requestId) {
    parts.push(`requestId=${evidence.requestId}`);
  }
  if (evidence.guruMeditation) {
    parts.push(`guruMeditation=${evidence.guruMeditation}`);
  }
  if (evidence.blockedIp) {
    parts.push(`blockedIp=${evidence.blockedIp}`);
  }
  if (evidence.requestToken) {
    parts.push(`requestToken=${evidence.requestToken}`);
  }
  if (evidence.recognitionText?.trim()) {
    const text = evidence.recognitionText
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_RECOGNITION_CHARS);
    parts.push(`text=${text}`);
  }

  return parts.join(' ').slice(0, MAX_EVIDENCE_CHARS);
};
