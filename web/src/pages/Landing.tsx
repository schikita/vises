import { useEffect, useState, type FormEvent } from 'react'
import { ArrowRight, Check, FileCheck, Shield, Timer } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { homePath, type Role } from '../types'
import { Btn, Field, Logo } from '../ui'

export function Landing() {
  const { session, login, loginWithPassword } = useStore()
  const nav = useNavigate()
  const [loginValue, setLoginValue] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const as = params.get('as') as Role | null
    const to = params.get('to')
    if (as === 'client' || as === 'manager' || as === 'admin') {
      void login(as).then((result) => {
        if (result === true) nav(to || homePath(as))
        else setError(result)
      })
    }
  }, [login, nav])

  async function enter(role: Role) {
    const result = await login(role)
    if (result === true) nav(homePath(role))
    else setError(result)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const result = await loginWithPassword(loginValue, password)
    if (typeof result === 'string') {
      setError(result)
      return
    }
    setError('')
    nav(homePath(result.role))
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <Logo />
        {session ? (
          <Btn to={homePath(session.role)} variant="ghost" className="bg-white">
            В кабинет
          </Btn>
        ) : (
          <p className="hidden text-sm text-muted sm:block">Вход по логину или по ссылке от админа</p>
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
            Клиент заполняет анкету и загружает файлы. Агент ведёт заявки. Админ выдаёт доступы
            ссылкой с логином и паролем.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Btn className="h-12 px-6" onClick={() => enter('admin')}>
              Кабинет админа
              <ArrowRight size={16} />
            </Btn>
            <Btn variant="ghost" className="h-12 px-6 bg-white" onClick={() => enter('manager')}>
              Кабинет агента
            </Btn>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-[28px] border border-line bg-card p-6 shadow-[0_20px_50px_rgba(18,24,20,0.06)]"
        >
          <p className="text-sm font-bold">Вход</p>
          <p className="mt-1 text-sm text-muted">Логин и пароль из ссылки, которую выдал админ.</p>
          <div className="mt-5 space-y-3">
            <Field label="Логин">
              <input
                className="field"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                autoComplete="username"
                required
              />
            </Field>
            <Field label="Пароль">
              <input
                className="field"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </Field>
          </div>
          {error && <p className="mt-3 text-sm font-semibold text-clay">{error}</p>}
          <div className="mt-4">
            <Btn type="submit" className="w-full h-11">
              Войти
            </Btn>
          </div>
          <p className="mt-4 text-xs text-muted">
            Демо: admin / VisesAdmin1 · maria@vises.app / VisesOffice1 · anna@example.com / VisesClient1
          </p>
        </form>
      </section>

      <section className="border-t border-line bg-card">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 py-12 sm:grid-cols-3">
          {[
            [Timer, 'Меньше кликов', 'Плоский список заявок, поиск, статусы-чипсы. Не три уровня меню.'],
            [FileCheck, 'Понятный прогресс', 'Не Waiting / Recorded, а «Документы», «Проверка», «Визит назначен».'],
            [Shield, 'Данные в кабинете', 'Клиент сам видит, что загружено и что ещё нужно. Агент не ищет это в чате.'],
          ].map(([Icon, title, text]) => (
            <div key={String(title)}>
              <Icon className="text-leaf" size={22} />
              <p className="mt-3 font-bold">{title as string}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">{text as string}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl items-center gap-2 px-5 py-8 text-sm text-muted">
        <Check size={14} className="text-leaf" />
        Демо. Пользователи и заявки хранятся на сервере (база данных).
      </footer>
    </div>
  )
}
