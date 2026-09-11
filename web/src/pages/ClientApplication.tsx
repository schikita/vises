import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { useStore } from '../store'
import type { DocType } from '../types'
import {
  DOC_TYPES,
  formatDate,
  formatDateTime,
  nowIso,
  requiredDocsOk,
  uid,
} from '../types'
import { Avatar, Card, Empty, StatusBadge } from '../ui'

export function ClientApplication() {
  const { id } = useParams()
  const { apps, session, addDoc } = useStore()
  const [docError, setDocError] = useState('')
  const [uploading, setUploading] = useState<DocType | null>(null)
  const app = apps.find(
    (a) =>
      a.id === id &&
      (a.clientEmail === session?.email || a.clientEmail === session?.login),
  )
  const person = app?.applicants[0]
  const name = person ? `${person.firstName} ${person.lastName}` : ''

  if (!app) {
    return <Empty title="Заявка не найдена" text="Проверьте ссылку или вернитесь к списку." />
  }

  function onFile(type: DocType, file: File) {
    setDocError('')
    setUploading(type)
    void addDoc(
      app!.id,
      {
        id: uid('doc'),
        type,
        name: file.name,
        uploadedAt: nowIso(),
      },
      file,
    )
      .catch((err: unknown) =>
        setDocError(err instanceof Error ? err.message : 'Не удалось загрузить'),
      )
      .finally(() => setUploading(null))
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <Card>
          <div className="flex items-start gap-4">
            <Avatar name={name} size={52} />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold">{name}</h1>
                <StatusBadge status={app.status} />
              </div>
              <p className="mt-1 text-sm text-muted">
                {app.code} · {app.destination} · подача {app.submitCity}
              </p>
            </div>
          </div>
          {app.visitDate && (
            <div className="mt-4 rounded-xl bg-sand/70 px-4 py-3 text-sm">
              <p className="font-bold">Визит назначен</p>
              <p className="text-muted">
                {formatDate(app.visitDate)} в {app.visitTime}
                {app.visitPlace ? ` · ${app.visitPlace}` : ''}
              </p>
            </div>
          )}
        </Card>

        <Card>
          <p className="font-bold">Документы</p>
          <p className="mt-1 text-sm text-muted">
            Селфи — без фильтров, светлый фон. Фото на визу — до 200 КБ.
          </p>
          <div className="mt-4 space-y-3">
            {DOC_TYPES.filter((d) => d.id !== 'other').map((doc) => {
              const have = app.documents.filter((f) => f.type === doc.id)
              const latest = have[have.length - 1]
              const missingFile = have.length > 0 && !latest?.stored
              return (
                <label
                  key={doc.id}
                  className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-bold">
                      {doc.label}
                      {doc.required ? ' *' : ''}
                    </p>
                    <p className="text-xs text-muted">
                      {have.length
                        ? have.map((f) => f.name).join(', ')
                        : uploading === doc.id
                          ? 'загружаем…'
                          : 'ещё не загружено'}
                    </p>
                    {missingFile && (
                      <p className="mt-1 text-xs font-semibold text-muted">Файл недоступен</p>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-sm font-bold text-leaf">
                    <Upload size={14} />
                    Файл
                  </span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) onFile(doc.id, file)
                      e.target.value = ''
                    }}
                  />
                </label>
              )
            })}
          </div>
          {docError && <p className="mt-4 text-sm font-semibold text-clay">{docError}</p>}
          {requiredDocsOk(app) && (
            <p className="mt-4 text-sm font-semibold text-leaf">Обязательные файлы на месте.</p>
          )}
        </Card>
      </div>

      <div className="space-y-5">
        <Card>
          <p className="font-bold">Поездка</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Въезд</dt>
              <dd className="font-semibold">{formatDate(app.travelDate)}</dd>
            </div>
            <div>
              <dt className="text-muted">Выезд</dt>
              <dd className="font-semibold">{formatDate(app.returnDate)}</dd>
            </div>
            <div>
              <dt className="text-muted">Тип</dt>
              <dd className="font-semibold">{app.visaType}</dd>
            </div>
            <div>
              <dt className="text-muted">Оплата</dt>
              <dd className="font-semibold">{app.paymentPaid ? 'Оплачено' : 'Ждём оплату'}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <p className="font-bold">История</p>
          <ol className="mt-3 space-y-3">
            {[...app.timeline].reverse().map((item) => (
              <li key={item.at + item.text} className="text-sm">
                <p className="font-semibold">{item.text}</p>
                <p className="text-xs text-muted">
                  {item.actor} · {formatDateTime(item.at)}
                </p>
              </li>
            ))}
          </ol>
        </Card>
      </div>
    </div>
  )
}
