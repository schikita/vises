import type { Status } from '../types'

export const STATUSES: { id: Status; label: string; hint: string }[] = [
  { id: 'new', label: 'Новая', hint: 'Заявка только создана' },
  { id: 'docs', label: 'Документы', hint: 'Ждём файлы от клиента' },
  { id: 'review', label: 'На рассмотрении', hint: 'Агент смотрит комплект / автозаполнение прошло успешно' },
  { id: 'ready', label: 'Готова', hint: 'Можно записывать на визит' },
  { id: 'booked', label: 'Визит назначен', hint: 'Дата и время известны' },
  { id: 'done', label: 'Завершена', hint: 'Клиент сходил в центр' },
  { id: 'fixes', label: 'Нужны правки', hint: 'Клиенту надо что-то исправить' },
  {
    id: 'autofill_ok',
    label: 'Автозаполнение успешно',
    hint: 'Ручной статус: автозаполнение прошло успешно',
  },
  {
    id: 'autofill_failed',
    label: 'Ошибка автозаполнения',
    hint: 'Ручной статус: при автозаполнении была ошибка',
  },
  {
    id: 'declined',
    label: 'Отклонено порталом',
    hint: 'Ручной статус: портал отклонил заявку',
  },
]
