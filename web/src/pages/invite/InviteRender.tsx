import { Link } from 'react-router-dom'
import { Copy, Eye, EyeOff } from 'lucide-react'
import type { User } from '@/entities/user'
import { ROLE_LABEL } from '@/entities/user'
import { Btn, Card, Logo } from '@/shared/ui'

type InviteRenderProps = {
  user: User | null | undefined
  show: boolean
  copied: string
  loginError: string
  inviteLink: string
  onToggleShow: () => void
  onCopy: (text: string, label: string) => void
  onEnterCabinet: () => void
}

export const InviteRender = ({
  user,
  show,
  copied,
  loginError,
  inviteLink,
  onToggleShow,
  onCopy,
  onEnterCabinet,
}: InviteRenderProps) => {
  if (user === undefined) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <Logo />
        <Card className="mt-8">
          <p className="text-sm text-muted">Открываем ссылку…</p>
        </Card>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <Logo />
        <Card className="mt-8">
          <p className="font-extrabold">Ссылка недействительна</p>
          <p className="mt-2 text-sm text-muted">Попросите админа выдать доступ заново.</p>
          <div className="mt-5">
            <Btn to="/">На вход</Btn>
          </div>
        </Card>
      </div>
    )
  }

  if (!user.active) {
    return (
      <div className="mx-auto max-w-md px-5 py-16">
        <Logo />
        <Card className="mt-8">
          <p className="font-extrabold">Доступ отключён</p>
          <p className="mt-2 text-sm text-muted">Обратитесь к администратору.</p>
        </Card>
      </div>
    )
  }

  const passwordRevealed = Boolean(user.password)

  return (
    <div className="mx-auto max-w-md px-5 py-12">
      <Logo />
      <Card className="mt-8">
        <p className="text-xs font-bold uppercase tracking-wide text-leaf">Доступ в Vises</p>
        <h1 className="mt-1 text-2xl font-extrabold">{user.name}</h1>
        <p className="mt-1 text-sm text-muted">Роль: {ROLE_LABEL[user.role]}</p>

        <dl className="mt-5 space-y-3">
          <div className="rounded-xl bg-[#f7f4ee] px-4 py-3">
            <dt className="text-xs font-bold text-muted">Логин</dt>
            <dd className="mt-1 flex items-center justify-between gap-2 font-bold">
              {user.login}
              <button className="text-leaf" onClick={() => onCopy(user.login, 'login')} type="button">
                <Copy size={14} />
              </button>
            </dd>
          </div>
          {passwordRevealed ? (
            <div className="rounded-xl bg-[#f7f4ee] px-4 py-3">
              <dt className="text-xs font-bold text-muted">Пароль</dt>
              <dd className="mt-1 flex items-center justify-between gap-2 font-bold">
                <span className="break-all">{show ? user.password : '••••••••••'}</span>
                <span className="flex gap-2">
                  <button type="button" className="text-muted" onClick={onToggleShow}>
                    {show ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    type="button"
                    className="text-leaf"
                    onClick={() => onCopy(user.password, 'password')}
                  >
                    <Copy size={14} />
                  </button>
                </span>
              </dd>
            </div>
          ) : (
            <div className="rounded-xl bg-[#f7f4ee] px-4 py-3">
              <dt className="text-xs font-bold text-muted">Пароль</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted">
                Пароль уже был показан по этой ссылке и больше не отображается. Войдите с сохранённым
                паролем или попросите администратора перевыпустить доступ.
              </dd>
            </div>
          )}
        </dl>

        {passwordRevealed ? (
          <p className="mt-4 text-xs text-muted">
            Сохраните логин и пароль. Повторное открытие ссылки не покажет пароль снова.
          </p>
        ) : (
          <p className="mt-4 text-xs text-muted">
            Если пароль не сохранился — попросите админа выдать доступ заново.
          </p>
        )}
        {copied && <p className="mt-2 text-xs font-semibold text-leaf">Скопировано: {copied}</p>}
        {loginError && <p className="mt-2 text-sm font-semibold text-clay">{loginError}</p>}

        <div className="mt-5 flex flex-col gap-2">
          {passwordRevealed ? (
            <Btn onClick={onEnterCabinet}>Войти в кабинет</Btn>
          ) : (
            <Btn to="/">Войти по логину и паролю</Btn>
          )}
          <Btn variant="ghost" className="bg-white" onClick={() => onCopy(inviteLink, 'ссылка')}>
            Копировать ссылку
          </Btn>
          <Link to="/" className="text-center text-sm font-semibold text-muted">
            На страницу входа
          </Link>
        </div>
      </Card>
    </div>
  )
}
