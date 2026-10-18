import { join } from 'path';
import { buildEvidenceRelativePath } from './build-evidence-relative-path.util';

/** Absolute PNG path for a new run (convenience). */
export const buildEvidenceAbsolutePath = (
  applicationId: string,
  runId: string,
  uploadDir: string,
): { relativePath: string; absolutePath: string } => {
  const relativePath = buildEvidenceRelativePath(applicationId, runId);
  const absolutePath = join(uploadDir, ...relativePath.split('/'));
  return { relativePath, absolutePath };
};
