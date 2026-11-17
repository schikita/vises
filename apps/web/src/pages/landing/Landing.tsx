import { useEffect, useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath } from '@/entities/session'
import type { Role } from '@/entities/user'
import { AuthLoginForm } from '@/features/auth-login'
import { LandingRender } from './LandingRender'

export const Landing = (): ReactElement => {
  const { session, login, loginWithPassword } = useStore()
  const nav = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const as = params.get('as') as Role | null
    const to = params.get('to')
    if (as === 'agent' || as === 'admin' || as === 'superadmin') {
      void login(as).then((result) => {
        if (result === true) nav(to || homePath(as))
        else setError(result)
      })
    }
  }, [login, nav])

  return (
    <LandingRender
      session={session}
      loginForm={
        <AuthLoginForm
          apiError={error}
          onValidSubmit={async ({ login: loginValue, password }): Promise<void> => {
            const result = await loginWithPassword(loginValue, password)
            if (typeof result === 'string') {
              setError(result)
              return
            }
            setError('')
            nav(homePath(result.role))
          }}
        />
      }
    />
  )
}
