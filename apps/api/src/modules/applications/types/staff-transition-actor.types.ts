import type { User } from '../../database/entities/user.entity';

/** Staff JWT actor for matrix transitions (admin / superadmin / owning agent). */
export type StaffTransitionActor = Pick<User, 'id' | 'role'>;
