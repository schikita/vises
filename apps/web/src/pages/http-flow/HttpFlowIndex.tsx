import { Link } from 'react-router-dom'
import { Card } from '@/shared/ui'

/** Индексная страница навигации «Безбраузерный флоу». */
export function HttpFlowIndex() {
  return (
    <Card className="p-6">
      <h1 className="mb-2 text-lg font-semibold">Безбраузерный флоу (HTTP)</h1>
      <p className="text-sm text-neutral-500">
        Параллельный движок сценария BLS (регистрация → вход → статус → запись) без patchright.
        Откройте заявку и перейдите на её HTTP-флоу:{' '}
        <Link className="text-blue-600 underline" to="/admin/apps">
          список заявок
        </Link>{' '}
        → кнопка «Безбраузерный флоу» на карточке заявки.
      </p>
    </Card>
  )
}
