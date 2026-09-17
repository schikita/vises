import { resolve, sep } from 'path';

/**
 * Resolve a stored relative evidence path against `UPLOAD_DIR`.
 * Rejects path traversal outside the upload root.
 */
export const resolveEvidenceAbsolutePath = (
  relativePath: string,
  uploadDir: string,
): string => {
  const root = resolve(uploadDir);
  const absolute = resolve(root, relativePath);
  const rootWithSep = root.endsWith(sep) ? root : `${root}${sep}`;
  if (absolute !== root && !absolute.startsWith(rootWithSep)) {
    throw new Error('Evidence path escapes upload root');
  }
  return absolute;
};
