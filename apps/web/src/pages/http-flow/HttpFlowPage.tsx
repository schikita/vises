import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { BlsHttpWorkflowPanel } from '@/widgets/bls-http-flow-panel'
import { fetchAppById } from '@/entities/application'
import type { Application } from '@/entities/application'
import { Card } from '@/shared/ui'

/**
 * Отдельная страница безбраузерного (HTTP) BLS-флоу — параллельная панели
 * «Автозаполнение», работает с тем же UI-виджетом (скопированным) поверх
 * нового движка bls_http_workflows. Панель самодостаточна: старт/рестарт —
 * POST /apps/:id/bls-http-workflow/start, пауза/резюм/отмена/логи — свои
 * эндпоинты движка.
 */
export function HttpFlowPage() {
  const { id } = useParams<{ id: string }>()
  const [app, setApp] = useState<Application | null>(null)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchAppById(id)
      .then((next) => {
        if (!cancelled) setApp(next)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : 'Не удалось загрузить заявку')
        }
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) return null

  return (
    <Card className="p-4">
      <h1 className="mb-1 text-lg font-semibold">Безбраузерный флоу (HTTP)</h1>
      <p className="mb-4 text-sm text-neutral-500">
        Параллельная реализация сценария BLS без patchright: регистрация → вход →
        статус → запись. Статусы, шаги, события и рестарты — как у основного флоу;
        работает с отдельными таблицами и не влияет на старый процесс.
        {app ? ` Заявка: ${app.code ?? app.id}.` : ''}
      </p>
      {loadError ? (
        <p className="mb-3 text-sm text-red-600">{loadError}</p>
      ) : null}
      <BlsHttpWorkflowPanel applicationId={id} applicants={app?.applicants ?? []} />
    </Card>
  )
}
