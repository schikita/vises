import { createReadStream, existsSync, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { DEFAULT_UPLOAD_DIR } from '../constants';

export const resolveUploadDir = (): string =>
  process.env.UPLOAD_DIR || DEFAULT_UPLOAD_DIR;

export const ensureUploadRoot = (uploadDir: string): void => {
  mkdirSync(uploadDir, { recursive: true });
};

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

export const resolveAppDocumentPath = (
  uploadDir: string,
  appId: string,
  stored: string,
): string => join(uploadDir, appId, stored);

export const appDocumentExists = (path: string): boolean => existsSync(path);

export const openAppDocumentStream = (
  path: string,
): NodeJS.ReadableStream => createReadStream(path);
