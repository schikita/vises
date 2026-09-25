import { Logger } from '@nestjs/common';
import type { FieldResult } from '../types';
import { maskSensitiveValue } from '../../portal-core/utils/mask-sensitive-value.util';

const logger = new Logger('PortalFillPipeline');

export const logFieldFailure = (row: FieldResult, stage: string): void => {
  logger.error(
    `field fill error [${stage}] ${row.field}: ${row.reason ?? 'unknown'}` +
      (row.value !== undefined
        ? ` (value=${maskSensitiveValue(row.field, row.value)})`
        : ''),
  );
};
