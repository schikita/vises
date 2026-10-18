import { existsSync } from 'node:fs';

/**
 * True when Nest is running inside a container (Compose API image).
 * Used to allow container absolute paths like `LOG_DIR=/logs`.
 */
export const isLikelyContainerRuntime = (): boolean =>
  existsSync('/.dockerenv');
