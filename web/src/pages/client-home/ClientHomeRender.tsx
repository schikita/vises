import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import type { Application } from '@/entities/application'
import { progress, requiredDocsOk, statusLabel } from '@/entities/application'
import { formatDate } from '@/shared/lib'
import { Avatar, Btn, Card, Empty, StatusBadge } from '@/shared/ui'

type ClientHomeRenderProps = {
  sessionName?: string
  apps: Application[]
}

export const ClientHomeRender = ({ sessionName, apps }: ClientHomeRenderProps) => (
  <div>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm text-muted">Здравствуйте, {sessionName?.split(' ')[0]}</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Мои заявки</h1>
      </div>
      <Btn to="/app/new">
        <Plus size={16} />
        Новая заявка
      </Btn>
    </div>

    {apps.length === 0 ? (
      <Card className="mt-6">
        <Empty title="Пока пусто" text="Заполните анкету — это займёт около трёх минут." />
      </Card>
    ) : (
      <div className="mt-6 grid gap-4">
        {apps.map((app) => {
          const person = app.applicants[0]
          const name = person ? `${person.firstName} ${person.lastName}` : app.code
          return (
            <Link key={app.id} to={`/app/${app.id}`} className="block no-underline">
              <Card className="transition hover:border-leaf/40">
                <div className="flex items-start gap-4">
                  <Avatar name={name} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold text-ink">{name}</p>
                      <StatusBadge status={app.status} label={statusLabel(app.status)} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {app.destination} · {app.submitCity} · поездка {formatDate(app.travelDate)}
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-leaf"
                        style={{ width: `${progress(app)}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs font-semibold text-muted">
                      {statusLabel(app.status)}
                      {!requiredDocsOk(app) ? ' · не хватает файлов' : ''}
                      {app.visitDate ? ` · визит ${formatDate(app.visitDate)} ${app.visitTime}` : ''}
                    </p>
                  </div>
                  <ArrowRight className="mt-2 hidden text-muted sm:block" size={18} />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>
    )}
  </div>
)
