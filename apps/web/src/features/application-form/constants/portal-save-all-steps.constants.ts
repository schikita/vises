/**
 * Save-all step ids for per-step failure reporting (REQ-016 / AC-12).
 * Operator-visible labels only — never log field values.
 */
export const PORTAL_SAVE_ALL_STEPS = {
  AppsUpsertCreate: 'apps_upsert_create',
  Passport: 'passport',
  PortalForm: 'portal_form',
  AppsUpsertRefresh: 'apps_upsert_refresh',
} as const

export const PORTAL_SAVE_ALL_STEP_LABELS = {
  [PORTAL_SAVE_ALL_STEPS.AppsUpsertCreate]: 'Создание заявки',
  [PORTAL_SAVE_ALL_STEPS.Passport]: 'Паспорт / личность',
  [PORTAL_SAVE_ALL_STEPS.PortalForm]: 'Портал-форма',
  [PORTAL_SAVE_ALL_STEPS.AppsUpsertRefresh]: 'Обновление заявки',
} as const
