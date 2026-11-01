/**
 * Russian role labels for users list sort parity with FE `ROLE_LABEL`
 * (REQ-007 / NFR-001). StaffRole only (FR-1 / FR-12).
 */
export const USER_ROLE_SORT_LABEL = {
  superadmin: 'Суперадмин',
  admin: 'Админ',
  agent: 'Агент',
} as const;
