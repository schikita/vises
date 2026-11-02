/** Russian labels for known workflow eventType values (DEC-006 / REQ-017). */
export const BLS_WORKFLOW_EVENT_TYPE_LABEL_RU: Record<string, string> = {
  WORKFLOW_CREATED: 'Сценарий создан',
  TASK_COMPLETED: 'Задача завершена',
  STEP_COMPLETED: 'Шаг завершён',
  STEP_SKIPPED: 'Шаг пропущен',
  TASK_FAILED: 'Ошибка задачи',
  WORKFLOW_STATUS_CHANGED: 'Статус сценария изменён',
  WORKFLOW_ABANDONED: 'Сценарий прерван',
  AWAITING_STAFF_BOOKING: 'Ожидает записи сотрудником',
  AUTOFILL_RUN_LINKED: 'Связан запуск RegisterUser',
}
