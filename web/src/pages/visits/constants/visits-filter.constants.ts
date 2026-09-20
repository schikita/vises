import type { VisitsFilterMode } from '../types'

export const VISITS_FILTER_OPTIONS: Array<{
  mode: VisitsFilterMode
  label: string
}> = [
  { mode: 'upcoming', label: 'Ближайшие' },
  { mode: 'all', label: 'Все визиты' },
]

export const VISITS_FILTER_HELP = {
  upcoming:
    'В таблице только визиты с датой сегодня или позже и статусом не «Завершена». Фильтр действует только на этот список визитов.',
  all: 'В таблице все заявки с датой визита или статусом «Визит назначен» / «Завершена». Фильтр действует только на этот список визитов.',
} as const satisfies Record<VisitsFilterMode, string>

