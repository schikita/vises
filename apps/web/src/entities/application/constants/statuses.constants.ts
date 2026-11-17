import type { ApplicationStatusMeta } from '../types/application-status-meta.types'
import type { Status } from '../types'

/**
 * BUSINESS status used when Start validation leaves the case not appointment-ready
 * (legacy CRM `fixes` → §4.D `not_ready_for_appointment`).
 */
export const APPLICATION_STATUS_NEEDS_FIXES: Status = 'not_ready_for_appointment'

/** Pipeline order for progress % (excludes terminal `declined`). */
export const APPLICATION_STATUS_PROGRESS_ORDER: readonly Status[] = [
  'draft',
  'filling',
  'not_ready_for_appointment',
  'ready_for_appointment',
  'booked',
]

/** Six BUSINESS filter/detail statuses (§4.A). Labels are primary RU display strings. */
export const STATUSES: ApplicationStatusMeta[] = [
  {
    id: 'filling',
    label: 'Заполнение',
    hint: 'Идёт заполнение / обработка workflow',
  },
  {
    id: 'draft',
    label: 'Черновик',
    hint: 'Заявка создана, анкета ещё не готова',
  },
  {
    id: 'not_ready_for_appointment',
    label: 'Не готова к записи',
    hint: 'Данные в портале есть, к записи ещё не готова',
  },
  {
    id: 'ready_for_appointment',
    label: 'Готова к записи',
    hint: 'Все нужные данные заполнены, визит ещё не забронирован',
  },
  {
    id: 'booked',
    label: 'Забронирована',
    hint: 'Запись на визит оформлена',
  },
  {
    id: 'declined',
    label: 'Отклонено',
    hint: 'Офисное или подтверждённое отклонение записи',
  },
]
