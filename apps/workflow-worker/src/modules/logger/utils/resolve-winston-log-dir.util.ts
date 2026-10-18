import { resolve } from 'node:path';
import { isLikelyContainerRuntime } from './is-likely-container-runtime.util';

/**
 * Resolve `LOG_DIR` to an absolute filesystem path.
 *
 * Compose uses `LOG_DIR=/logs` with volume `./backend/logs:/logs`. On a host
 * Nest process that same value is wrong: Windows maps it to `<drive>:\logs`,
 * and Unix hosts write outside the repo. Reject the Compose default outside
 * containers so local runs fail loudly instead of writing to the wrong place.
 */
export const resolveWinstonLogDir = (logDir: string): string => {
  const trimmed = logDir.trim();
  if (!trimmed) {
    throw new Error('LOG_DIR is missing or empty');
  }

  if (trimmed === '/logs' && !isLikelyContainerRuntime()) {
    throw new Error(
      'LOG_DIR="/logs" is the Compose mount path, but this process is not in Docker. ' +
        `Host Nest would write to "${resolve(trimmed)}" instead of backend/logs. ` +
        'Set LOG_DIR=./logs in .env.dev.local (Compose keeps LOG_DIR=/logs).',
    );
  }

  return resolve(trimmed);
};
