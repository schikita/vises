import {
  createReadStream,
  existsSync,
  mkdirSync,
  unlinkSync,
} from 'fs';
import { dirname, join, resolve, sep } from 'path';
import { resolveUploadDir } from '../../apps/utils';
import { PORTAL_AUTOFILL_EVIDENCE_SUBDIR } from '../constants';

/** Relative path stored in DB: `portal-autofill/{applicationId}/{runId}.png`. */
export const buildEvidenceRelativePath = (
  applicationId: string,
  runId: string,
): string =>
  `${PORTAL_AUTOFILL_EVIDENCE_SUBDIR}/${applicationId}/${runId}.png`;

/**
 * Resolve a stored relative evidence path against `UPLOAD_DIR`.
 * Rejects path traversal outside the upload root.
 */
export const resolveEvidenceAbsolutePath = (
  relativePath: string,
  uploadDir: string = resolveUploadDir(),
): string => {
  const root = resolve(uploadDir);
  const absolute = resolve(root, relativePath);
  const rootWithSep = root.endsWith(sep) ? root : `${root}${sep}`;
  if (absolute !== root && !absolute.startsWith(rootWithSep)) {
    throw new Error('Evidence path escapes upload root');
  }
  return absolute;
};

/** Ensure parent directory for the absolute PNG path exists. */
export const ensureEvidenceDir = (absolutePngPath: string): void => {
  mkdirSync(dirname(absolutePngPath), { recursive: true });
};

export const evidenceFileExists = (absolutePath: string): boolean =>
  existsSync(absolutePath);

export const openEvidenceStream = (
  absolutePath: string,
): NodeJS.ReadableStream => createReadStream(absolutePath);

/** Best-effort delete after orphan risk (DEC-008). */
export const unlinkEvidenceBestEffort = (absolutePath: string): void => {
  try {
    if (existsSync(absolutePath)) {
      unlinkSync(absolutePath);
    }
  } catch {
    // ignore — best-effort cleanup only
  }
};

/** Absolute PNG path for a new run (convenience). */
export const buildEvidenceAbsolutePath = (
  applicationId: string,
  runId: string,
  uploadDir: string = resolveUploadDir(),
): { relativePath: string; absolutePath: string } => {
  const relativePath = buildEvidenceRelativePath(applicationId, runId);
  const absolutePath = join(uploadDir, ...relativePath.split('/'));
  return { relativePath, absolutePath };
};
