import { mkdirSync } from 'fs';
import { dirname } from 'path';

/** Ensure parent directory for the absolute PNG path exists. */
export const ensureEvidenceDir = (absolutePngPath: string): void => {
  mkdirSync(dirname(absolutePngPath), { recursive: true });
};
