import { Logger } from '@nestjs/common';

const logger = new Logger('PortalFillPipeline');

export const logHardFailure = (error: string): void => {
  logger.error(`fill pipeline hard failure: ${error}`);
};
