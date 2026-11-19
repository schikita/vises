import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '@/entities/session'
import { AuthRegisterForm, AUTH_REGISTER_MESSAGES } from '@/features/auth-register'
import { Logo } from '@/shared/ui'

const resolveRegisterName = (firstName: string, lastName: string, login: string): string => {
  const joined = [firstName, lastName].filter(Boolean).join(' ').trim()
  return joined.length > 0 ? joined : login
}

export const RegisterPage = (): React.ReactElement => {
  const { session, ready, register } = useSession()
  const nav = useNavigate()
  const [error, setError] = useState('')

  if (ready && session) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <Logo />
      <div className="mt-8">
        <AuthRegisterForm
          apiError={error}
          onValidSubmit={async (values) => {
            const result = await register({
              name: resolveRegisterName(
                values.firstName,
                values.lastName,
                values.login,
              ),
              login: values.login,
              email: values.email || undefined,
              password: values.password,
            })
            if (typeof result === 'string') {
              setError(result)
              return
            }
            setError('')
            nav('/app')
          }}
        />
      </div>
      <p className="mt-6 text-center text-sm text-text-secondary">
        {AUTH_REGISTER_MESSAGES.hasAccount}{' '}
        <Link className="font-medium text-accent hover:text-accent-hover" to="/">
          {AUTH_REGISTER_MESSAGES.signIn}
        </Link>
      </p>
    </div>
  )
}
