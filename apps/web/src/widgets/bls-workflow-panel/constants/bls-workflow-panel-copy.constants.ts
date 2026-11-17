/** Max events shown before optional expand (DEC-006 / NFR-007). */
export const BLS_WORKFLOW_EVENTS_FEED_COMPACT_LIMIT = 20

/**
 * Delay before showing the silent-poll indicator.
 * Fast polls (typical under the interval) stay quiet; slow in-flight polls surface “Обновляем статус…”.
 */
export const BLS_WORKFLOW_POLL_SLOW_INDICATOR_MS = 3_000

/** Russian copy for BLS workflow staff panel (REQ-024 / NFR-001 / REQ-015). */
export const BLS_WORKFLOW_PANEL_COPY = {
  title: 'Заполнение BLS',
  loading: 'Загружаем заполнение…',
  emptyTitle: 'Заполнение ещё не запускалось',
  emptyText:
    'Нажмите «Запустить», чтобы создать долговечное заполнение для этой заявки.',
  /** Fallback when GET snapshot fails without a message (REQ-015). */
  loadErrorFallback: 'Не удалось загрузить заполнение BLS',
  /** Fallback when a control POST fails without a message (REQ-015). */
  actionErrorFallback: 'Не удалось выполнить команду',
  /**
   * Start/supersede refused because the parent form gate callback is missing.
   * Fail closed: never call start API without a full form check.
   */
  startFormGateMissing:
    'Нельзя запустить заполнение: проверка формы заявки недоступна.',
  /** Fallback when AUTOFILL_RUN_LINKED screenshot open fails (DEC-007). */
  screenshotOpenErrorFallback: 'Не удалось открыть скриншот',
  polling: 'Обновляем статус…',
  /** Boolean lockHeld only — never lockOwner / vault (REQ-016). */
  lockHeld: 'Выполняется на сервере',
  noLock: 'Ожидает планировщик',
  /**
   * Cooperative pause hint (DEC-003): pause is durable but mid-flight attempt may finish first.
   * Shown when status is PAUSED and lockHeld is still true.
   */
  pauseCooperativeHint:
    'Пауза применена. Текущая попытка на сервере завершится, после чего заполнение останется на паузе.',
  currentStep: 'Текущий шаг',
  currentTask: 'Текущая задача',
  status: 'Статус',
  attempt: 'Попытка',
  nextRunAt: 'Следующий запуск',
  terminalReason: 'Причина завершения',
  lastError: 'Последняя ошибка',
  /** CON-006 / DEC-005 — exact intent: manual booking finish; not full automation. */
  bookingHandoffLead: 'Автоматизация остановлена на безопасной границе записи.',
  bookingHandoffBody: 'Сотрудник должен завершить бронирование вручную',
  bookingHandoffDetail:
    '(тип визы, оплата и Premium Lounge не выполняются автоматически).',
  stepsHeading: 'Шаги',
  currentStepBadge: 'Текущий',
  skipReason: 'Причина пропуска',
  tasksHeading: 'Задачи',
  currentTaskBadge: 'Текущая',
  applicant: 'Заявитель',
  attemptOf: 'из',
  eventsHeading: 'События',
  eventsEmpty: 'Пока нет событий',
  eventsExpand: 'Показать все события',
  eventsCollapse: 'Свернуть',
  eventsStep: 'Шаг',
  eventsTask: 'Задача',
  eventsPayloadStatus: 'Статус',
  eventsPayloadAction: 'Действие',
  eventsPayloadReason: 'Причина',
  eventsPayloadTaskId: 'ID задачи',
  eventsPayloadError: 'Ошибка',
  eventsRunId: 'ID запуска RegisterUser',
  eventsRunLinkAction: 'Открыть скриншот',
  eventsRunLinkHint: 'Скриншот запуска RegisterUser недоступен.',
  start: 'Запустить',
  startSupersede: 'Запустить заново',
  startFormBlockedHint:
    'В форме есть ошибки. Нажмите «Запустить», чтобы проверить все поля — запрос уйдёт только если данные корректны.',
  retry: 'Повторить',
  resume: 'Продолжить',
  pause: 'Пауза',
  cancel: 'Отменить',
  busy: 'Отправляем команду…',
  dash: '—',
} as const

