import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

type DetailBody = { detail: string | Array<{ msg: string }> };

/**
 * Maps Nest/HTTP exceptions to FastAPI-compatible `{ detail }` JSON (DEC-004).
 */
@Catch()
export class DetailExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // Nest FileInterceptor maps multer LIMIT_FILE_SIZE → PayloadTooLargeException (413).
    // DEC-008 / REQ-017: oversized uploads must be 400 with Russian detail.
    if (this.isUploadTooLarge(exception)) {
      response
        .status(HttpStatus.BAD_REQUEST)
        .json({ detail: 'Файл слишком большой (макс. 20 МБ)' });
      return;
    }

    if (exception instanceof MulterError) {
      const detail =
        exception.code === 'LIMIT_FILE_SIZE'
          ? 'Файл слишком большой (макс. 20 МБ)'
          : 'Ошибка загрузки файла';
      response.status(HttpStatus.BAD_REQUEST).json({ detail });
      return;
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const body: DetailBody = { detail: this.toDetail(exception) };
    response.status(status).json(body);
  }

  private isUploadTooLarge(exception: unknown): boolean {
    if (exception instanceof MulterError && exception.code === 'LIMIT_FILE_SIZE') {
      return true;
    }
    if (exception instanceof HttpException) {
      if (exception.getStatus() === HttpStatus.PAYLOAD_TOO_LARGE) {
        return true;
      }
      const payload = exception.getResponse();
      const msg =
        typeof payload === 'string'
          ? payload
          : payload && typeof payload === 'object'
            ? String((payload as { message?: unknown }).message ?? '')
            : exception.message;
      if (msg === 'File too large' || msg.includes('File too large')) {
        return true;
      }
    }
    if (exception instanceof Error && exception.message === 'File too large') {
      return true;
    }
    return false;
  }

  private toDetail(exception: unknown): string | Array<{ msg: string }> {
    if (!(exception instanceof HttpException)) {
      if (exception instanceof Error && exception.message) {
        return exception.message;
      }
      return 'Internal server error';
    }

    const payload = exception.getResponse();

    if (typeof payload === 'string') {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;

      if (typeof obj.detail === 'string' || Array.isArray(obj.detail)) {
        return obj.detail as string | Array<{ msg: string }>;
      }

      const message = obj.message;
      if (typeof message === 'string') {
        return message;
      }
      if (Array.isArray(message)) {
        const msgs = message.map((item) => {
          if (typeof item === 'string') {
            return { msg: item };
          }
          if (item && typeof item === 'object' && 'msg' in item) {
            return { msg: String((item as { msg: unknown }).msg) };
          }
          return { msg: String(item) };
        });
        // Prefer a single string when ValidationPipe returns string[].
        if (msgs.length === 1) {
          return msgs[0].msg;
        }
        if (msgs.every((m) => typeof m.msg === 'string')) {
          return msgs.map((m) => m.msg).join('; ');
        }
        return msgs;
      }
    }

    return exception.message || 'Error';
  }
}
