import { existsSync, unlinkSync } from 'fs';

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
