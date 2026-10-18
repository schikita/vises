import { DEFAULT_UPLOAD_DIR } from '../constants/upload-dir.constants';

export const resolveUploadDir = (uploadDir: string | undefined): string =>
  uploadDir?.trim() || DEFAULT_UPLOAD_DIR;
