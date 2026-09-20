/** Raw `GROUP BY role` row from users aggregate query. */
export type StatsUsersRoleCountRow = {
  role: string | null;
  count: string | number;
};
