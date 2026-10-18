import { existsSync } from 'fs';

export const evidenceFileExists = (absolutePath: string): boolean =>
  existsSync(absolutePath);
