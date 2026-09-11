import { extname } from 'path';
import { HttpException, HttpStatus } from '@nestjs/common';
import {
  ALLOWED_UPLOAD_EXT,
  ALLOWED_UPLOAD_MIME,
  MAX_UPLOAD_BYTES,
} from '../constants';

/**
 * Reject empty / oversized / disallowed uploads with Russian 400 `{detail}`.
 * MIME or extension may match (browsers sometimes send octet-stream).
 */
export function assertValidUpload(
  file: Express.Multer.File | undefined,
): asserts file is Express.Multer.File {
  if (!file) {
    throw new HttpException('Файл не найден', HttpStatus.BAD_REQUEST);
  }

  const size = Math.max(file.size || 0, file.buffer?.length || 0);
  if (!file.buffer || size === 0) {
    throw new HttpException('Файл пустой', HttpStatus.BAD_REQUEST);
  }
  if (size > MAX_UPLOAD_BYTES) {
    throw new HttpException(
      'Файл слишком большой (макс. 20 МБ)',
      HttpStatus.BAD_REQUEST,
    );
  }

  const mime = (file.mimetype || '').toLowerCase().trim();
  const ext = extname(file.originalname || '').toLowerCase();
  const mimeOk = mime !== '' && ALLOWED_UPLOAD_MIME.has(mime);
  const extOk = ext !== '' && ALLOWED_UPLOAD_EXT.has(ext);

  if (!mimeOk && !extOk) {
    throw new HttpException(
      'Недопустимый тип файла. Разрешены изображения, PDF и видео',
      HttpStatus.BAD_REQUEST,
    );
  }
}
