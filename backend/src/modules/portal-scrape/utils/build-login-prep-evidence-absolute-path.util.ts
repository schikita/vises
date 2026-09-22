import { join } from 'path';
import { PORTAL_LOGIN_PREP_EVIDENCE_SUBDIR } from '../constants';

/** Absolute PNG path for an optional login-prep evidence screenshot. */
export const buildLoginPrepEvidenceAbsolutePath = (
  applicationId: string,
  prepId: string,
  uploadDir: string,
): { relativePath: string; absolutePath: string } => {
  const relativePath = `${PORTAL_LOGIN_PREP_EVIDENCE_SUBDIR}/${applicationId}/${prepId}.png`;
  const absolutePath = join(uploadDir, ...relativePath.split('/'));
  return { relativePath, absolutePath };
};
