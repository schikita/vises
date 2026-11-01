import { IsIn } from 'class-validator';
import { STAFF_ROLES } from '@vises/contracts';
import type { StaffRole } from '@vises/contracts';

/** Demo login role — StaffRole only (FR-12 / §6.1). */
export class DemoDto {
  @IsIn([...STAFF_ROLES])
  role!: StaffRole;
}
