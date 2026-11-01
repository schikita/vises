import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { homePath, isStaffRole, useSession } from '@/entities/session'
import { AuthLoginForm } from '@/features/auth-login'
import { LandingRender } from './LandingRender'

export const Landing = (): React.ReactElement => {
  const { session, ready, loginDemo, loginWithPassword } = useSession()
  const nav = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const as = params.get('as')
    const to = params.get('to')
    if (as && isStaffRole(as)) {
      void loginDemo(as).then((result) => {
        if (result === true) nav(to || homePath(as))
        else setError(result)
      })
    }
  }, [loginDemo, nav])

  if (ready && session) {
    return <Navigate to={homePath(session.role)} replace />
  }

  return (
    <LandingRender
      session={session}
      loginForm={
        <>
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
          <p className="mt-3 text-center text-sm text-text-secondary">
            No account?{' '}
            <Link className="font-medium text-accent hover:text-accent-hover" to="/register">
              Register as agent
            </Link>
          </p>
        </>
      }
    />
  )
}
