import { styleText } from 'node:util';
import type { WinstonConsoleStyle } from '../types';

/**
 * Apply Node `styleText` formats to a console fragment.
 * `validateStream: false` so colors still apply under Docker/`docker compose logs`
 * (stdout is often not a TTY).
 */
export const applyWinstonConsoleStyle = (
  styles: readonly WinstonConsoleStyle[],
  text: string,
): string => {
  if (styles.length === 0 || text.length === 0) {
    return text;
  }
  return styleText([...styles] as WinstonConsoleStyle[], text, {
    validateStream: false,
  });
};
