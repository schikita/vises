/** Russian labels for workflow status. */
export const BLS_WORKFLOW_STATUS_LABEL_RU: Record<string, string> = {
  PENDING: 'В очереди',
  RUNNING: 'Выполняется',
  WAITING_RETRY: 'Ожидает повтора',
  WAITING_STAFF: 'Ожидает сотрудника',
  PAUSED: 'На паузе',
  AWAITING_STAFF_BOOKING: 'Ожидает записи сотрудником',
  COMPLETED: 'Завершён',
  FAILED: 'Ошибка',
  CANCELLED: 'Отменён',
  ABANDONED: 'Прерван',
}

/** Russian labels for step keys. */
export const BLS_WORKFLOW_STEP_KEY_LABEL_RU: Record<string, string> = {
  REGISTER: 'Регистрация',
  LOGIN: 'Вход',
  PASSWORD_CHANGE: 'Смена пароля',
  STATUS_VALIDATE: 'Проверка статуса',
  BOOK: 'Запись',
}

/** Russian labels for task keys. */
export const BLS_WORKFLOW_TASK_KEY_LABEL_RU: Record<string, string> = {
  REGISTER_SUBMIT: 'Отправка регистрации',
  LOGIN_AUTH: 'Авторизация',
  PASSWORD_CHANGE: 'Смена пароля',
  STATUS_APPLICANT: 'Статус заявителя',
  BOOK_OPEN: 'Открытие записи',
}

/** Russian labels for step/task row status. */
export const BLS_WORKFLOW_ROW_STATUS_LABEL_RU: Record<string, string> = {
  PENDING: 'Ожидает',
  READY: 'Готов',
  RUNNING: 'Выполняется',
  COMPLETED: 'Готово',
  SKIPPED: 'Пропущен',
  FAILED: 'Ошибка',
  WAITING: 'Ожидание',
}
