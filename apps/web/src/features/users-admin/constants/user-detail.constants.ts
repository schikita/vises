import type { Role } from '@/entities/user'

export const USER_DETAIL_TITLE = 'Карточка пользователя'

export const USER_DETAIL_LABELS = {
  login: 'Логин',
  email: 'Email',
  status: 'Статус',
  createdAt: 'Создан',
  updatedAt: 'Обновлён',
  id: 'ID',
} as const

export const USER_DETAIL_STATUS = {
  active: 'Активен',
  inactive: 'Отключён',
} as const

export const USER_DETAIL_ROLE_DESCRIPTION: Record<Role, string> = {
  superadmin:
    'Суперадмин: полный доступ к системе, пользователям, заявкам и настройкам.',
  admin:
    'Админ: управление пользователями, заявками, оплатой и аналитикой.',
  agent:
    'Агент: ведёт клиентов и заявки в рамках своего портфеля.',
}

export const USER_DETAIL_AGENT_HAS_APPS =
  'У агента есть заявки по клиентам. Можно открыть последнюю заявку.'

export const USER_DETAIL_AGENT_NO_APPS =
  'У этого агента пока нет заявок по клиентам.'

export const USER_DETAIL_STAFF_NO_APPS_HINT =
  'У сотрудников с ролью админ/суперадмин заявки клиентов не привязаны к карточке пользователя.'

export const USER_DETAIL_OPEN_LATEST_APP = 'Открыть последнюю заявку'

export const USER_DETAIL_DEACTIVATE = 'Отключить'

export const USER_DETAIL_ACTIVATE = 'Включить'

export const USER_DETAIL_STATUS_ACTION_ERROR =
  'Не удалось изменить статус пользователя.'

export const USER_DETAIL_CLOSE = 'Закрыть'

export const USER_DETAIL_LOAD_ERROR = 'Не удалось загрузить карточку пользователя.'
