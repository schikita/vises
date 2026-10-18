import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ALLOWED_UPLOAD_EXT,
  ALLOWED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
} from '../constants';

/**
 * Reject empty / oversized / disallowed uploads with 400 `{detail}`.
 * MIME or extension may match (browsers sometimes send octet-stream).
 * Explicit annotation required so TS accepts an assertion signature on a const arrow.
 */
export const assertValidUpload: (
  file: Express.Multer.File | undefined,
) => asserts file is Express.Multer.File = (file) => {
  if (!file) {
    throw new HttpException('File not found', HttpStatus.BAD_REQUEST);
  }

  const size = Math.max(file.size || 0, file.buffer?.length || 0);
  if (!file.buffer || size === 0) {
    throw new HttpException('File is empty', HttpStatus.BAD_REQUEST);
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw new HttpException(
      'File is too large (max. 20 MB)',
      HttpStatus.BAD_REQUEST,
    );
  }

  const mime = (file.mimetype || '').toLowerCase().trim();
  const ext = extname(file.originalname || '').toLowerCase();
  const mimeOk = mime !== '' && ALLOWED_UPLOAD_MIME.has(mime);
  const extOk = ext !== '' && ALLOWED_UPLOAD_EXT.has(ext);

  if (!mimeOk && !extOk) {
    throw new HttpException(
      'Invalid file type. Images, PDF, and video are allowed',
      HttpStatus.BAD_REQUEST,
    );
  }
};
