import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useSession } from '@/entities/session'
import { AuthRegisterForm, AUTH_REGISTER_MESSAGES } from '@/features/auth-register'
import { Logo } from '@/shared/ui'

export const RegisterPage = (): React.ReactElement => {
  const { session, ready, register } = useSession()
  const nav = useNavigate()
  const [error, setError] = useState('')

  if (ready && session) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-5 py-10">
      <Logo />
      <AuthRegisterForm
        apiError={error}
        onValidSubmit={async (values) => {
          const result = await register({
            name: values.name,
            login: values.login,
            password: values.password,
            ...(values.email ? { email: values.email } : {}),
          })
          if (typeof result === 'string') {
            setError(result)
            return
          }
          setError('')
          nav('/app')
        }}
      />
      <p className="text-center text-sm text-text-secondary">
        {AUTH_REGISTER_MESSAGES.hasAccount}{' '}
        <Link className="font-medium text-accent hover:text-accent-hover" to="/">
          {AUTH_REGISTER_MESSAGES.signIn}
        </Link>
      </p>
    </div>
  )
}
