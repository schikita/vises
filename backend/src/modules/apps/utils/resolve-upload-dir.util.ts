import { DEFAULT_UPLOAD_DIR } from '../constants';

export const resolveUploadDir = (uploadDir: string | undefined): string =>
  uploadDir?.trim() || DEFAULT_UPLOAD_DIR;
