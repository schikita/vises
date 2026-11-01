import type { StaffRole } from '@vises/contracts';

export type JwtPayload = {
  sub: string;
  role: StaffRole;
};
