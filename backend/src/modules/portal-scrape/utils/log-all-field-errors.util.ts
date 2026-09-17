import { Logger } from '@nestjs/common';
import type { FieldResult } from '../types';
import { maskSensitiveValue } from './mask-sensitive-value.util';

const logger = new Logger('PortalFillPipeline');

export const logAllFieldErrors = (fields: FieldResult[]): void => {
  const failed = fields.filter((f) => f.status === 'failed');
  if (failed.length === 0) {
    return;
  }
  logger.error(
    `form fill finished with ${failed.length} field error(s): ${failed
      .map(
        (f) =>
          `${f.field}=${f.reason ?? 'failed'}` +
          (f.value !== undefined
            ? ` value=${maskSensitiveValue(f.field, f.value)}`
            : ''),
      )
      .join('; ')}`,
  );
};
