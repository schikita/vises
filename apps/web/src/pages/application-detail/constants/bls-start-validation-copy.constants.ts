/** Russian chrome-only copy for Start pre-validation Dialog (DEC-009). */
export const APPLICATION_DETAIL_START_VALIDATION_COPY = {
  dialogTitle: 'Нельзя запустить заполнение',
  dialogListFallback: 'Исправьте ошибки в форме заявки и попробуйте снова.',
  tabErrorCue: 'ошибка',
  /** Save-then-start failed (DEC-001); shown via saveError and/or Dialog. */
  saveBeforeStartFailed: 'Не удалось сохранить заявку перед запуском.',
  /** Full-form invalid after date gate passed — do not auto-save on Start. */
  saveBeforeStartFormInvalid:
    'Исправьте ошибки в форме и сохраните заявку перед запуском.',
  /** Start blocked when application has no applicants. */
  noApplicants: 'Добавьте хотя бы одного заявителя перед запуском.',
} as const
