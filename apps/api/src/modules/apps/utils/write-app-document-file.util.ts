import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

export const writeAppDocumentFile = (
  uploadDir: string,
  appId: string,
  stored: string,
  buffer: Buffer,
): string => {
  const folder = join(uploadDir, appId);
  mkdirSync(folder, { recursive: true });
  const path = join(folder, stored);
  writeFileSync(path, buffer);
  return path;
};
