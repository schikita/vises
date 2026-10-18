import type { LoggerService } from '@nestjs/common';

/** Nest LoggerService bridge port (Winston is one adapter; DEC-001). */
export type IAppLogger = LoggerService;
