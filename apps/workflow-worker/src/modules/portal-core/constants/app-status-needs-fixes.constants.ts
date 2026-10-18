/**
 * CRM status when Start / date validation finds applicant data that must be fixed.
 * Label (UI): «Нужны правки».
 */
export const APP_STATUS_NEEDS_FIXES = 'fixes' as const;

/** Timeline line when status is auto-set to needs-fixes. */
export const APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT = 'Статус: Нужны правки';

/** Timeline actor for automated status changes. */
export const APP_STATUS_SYSTEM_ACTOR = 'Система';
