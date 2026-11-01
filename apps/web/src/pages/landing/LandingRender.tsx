import { FileCheck, Shield, Timer } from 'lucide-react'
import { homePath } from '@/entities/session'
import { Btn, Logo } from '@/shared/ui'
import type { LandingRenderProps } from './types'

export const LandingRender = ({
  session,
  loginForm,
}: LandingRenderProps): React.ReactElement => (
  <div className="min-h-screen">
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
      <Logo />
      {session ? (
        <Btn to={homePath(session.role)} variant="ghost" className="bg-white">
          В кабинет
        </Btn>
      ) : (
        <p className="hidden text-sm text-muted sm:block">
          Вход по логину или по ссылке от админа/менеджера
        </p>
      )}
    </header>

    <section className="mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:pt-10">
      <div>
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-leaf">
          Визовое агентство
        </p>
        <h1 className="max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl">
          Документы дома.
          <br />
          Статус — в кабинете.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted">
          Клиент заполняет анкету и загружает файлы. Агент ведёт заявки. Админ или менеджер выдаёт
          доступы логином и паролем.
        </p>
      </div>

      {loginForm}
    </section>

    <section className="border-t border-line bg-card">
      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:grid-cols-3">
        {[
          [
            FileCheck,
            'Анкета и документы',
            'Клиент заполняет анкету и загружает файлы. Офис ведёт заявку и проверяет комплект.',
          ],
          [
            Shield,
            'Помощь с порталом',
            'Сотрудники могут отправлять данные заявки на визовый портал с автозаполнением — без гарантии одобрения визы.',
          ],
          [
            Timer,
            'Статус в кабинете',
            'В кабинете видны статус в офисе и, где доступно, прогресс и решение сайта (например, одобрено или отклонено).',
          ],
        ].map(([Icon, title, text]) => (
          <div key={String(title)}>
            <Icon className="text-leaf" size={22} />
            <p className="mt-3 font-bold">{title as string}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{text as string}</p>
          </div>
        ))}
      </div>
    </section>
  </div>
)
