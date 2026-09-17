import { mkdirSync } from 'fs';

export const ensureUploadRoot = (uploadDir: string): void => {
  mkdirSync(uploadDir, { recursive: true });
};
