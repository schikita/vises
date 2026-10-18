import { mkdirSync } from 'fs';
import { join } from 'path';
import { WINSTON_LOG_CHANNELS } from '../constants';

/**
 * Ensure `LOG_DIR` and level channel folders exist, or fail boot naming LOG_DIR.
 */
export const ensureLogRootDir = (logDir: string): void => {
  const root = logDir.trim();
  if (!root) {
    throw new Error('LOG_DIR is missing or empty');
  }

  try {
    mkdirSync(root, { recursive: true });
    for (const channel of WINSTON_LOG_CHANNELS) {
      mkdirSync(join(root, channel), { recursive: true });
    }
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    throw new Error(
      `LOG_DIR could not be created or is not writable (${root}): ${detail}`,
    );
  }
};
