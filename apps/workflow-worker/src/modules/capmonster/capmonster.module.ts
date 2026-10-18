import { Module } from '@nestjs/common';
import { CAPTCHA_SOLVER } from './constants';
import { CapMonsterService } from './capmonster.service';

/**
 * CapMonster Cloud client (DEC-001 / DEC-005).
 * Exports CapMonsterService as ICaptchaSolver adapter; utils remain via barrel.
 */
@Module({
  providers: [
    CapMonsterService,
    { provide: CAPTCHA_SOLVER, useExisting: CapMonsterService },
  ],
  exports: [CapMonsterService, CAPTCHA_SOLVER],
})
export class CapMonsterModule {}
