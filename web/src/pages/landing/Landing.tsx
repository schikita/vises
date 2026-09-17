import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath } from '@/entities/session'
import type { Role } from '@/entities/user'
import { AuthLoginForm } from '@/features/auth-login'
import { LandingRender } from './LandingRender'

export const Landing = () => {
  const { session, login, loginWithPassword } = useStore()
  const nav = useNavigate()
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

  const enter = async (role: Role) => {
    const result = await login(role)
    if (result === true) nav(homePath(role))
    else setError(result)
  }

  return (
    <LandingRender
      session={session}
      onEnter={enter}
      loginForm={
        <AuthLoginForm
          apiError={error}
          onValidSubmit={async ({ login: loginValue, password }) => {
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
