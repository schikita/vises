import type { Application, Status } from '../types'

export const progress = (app: Application) => {
  const order: Status[] = ['new', 'docs', 'review', 'ready', 'booked', 'done']
  if (app.status === 'fixes') return 40
  const i = order.indexOf(app.status)
  return Math.round(((i + 1) / order.length) * 100)
}
