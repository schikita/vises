import { useState, type ReactElement } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath } from '@/entities/session'
import { AuthRegisterForm } from '@/features/auth-register'
import { RegisterRender } from './RegisterRender'

export const RegisterPage = (): ReactElement => {
  const { ready, session, registerWithPassword } = useStore()
  const nav = useNavigate()
  const [error, setError] = useState('')

  if (ready && session) {
    return <Navigate to={homePath(session.role)} replace />
  }

  return (
    <RegisterRender
      form={
        <AuthRegisterForm
          apiError={error}
          onValidSubmit={async (values): Promise<void> => {
            const email = values.email.trim()
            const result = await registerWithPassword({
              name: values.name,
              login: values.login,
              password: values.password,
              ...(email ? { email } : {}),
            })
            if (typeof result === 'string') {
              setError(result)
              return
            }
            setError('')
            nav('/app')
          }}
        />
      }
    />
  )
}
