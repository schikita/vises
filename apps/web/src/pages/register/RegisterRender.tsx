import type { ReactElement } from 'react'
import { Link } from 'react-router-dom'
import { AUTH_REGISTER_MESSAGES } from '@/features/auth-register'
import { Logo } from '@/shared/ui'
import type { RegisterRenderProps } from './types'

export const RegisterRender = ({ form }: RegisterRenderProps): ReactElement => (
  <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
    <Logo />
    <div className="mt-8">{form}</div>
    <p className="mt-6 text-center text-sm text-muted">
      {AUTH_REGISTER_MESSAGES.hasAccount}{' '}
      <Link className="font-semibold text-leaf" to="/">
        {AUTH_REGISTER_MESSAGES.signIn}
      </Link>
    </p>
  </div>
)
