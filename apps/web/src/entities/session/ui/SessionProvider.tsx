import { useCallback, useEffect, useMemo, useState } from 'react'
import type { StaffRole } from '@vises/contracts'
import {
  fetchAuthMe,
  postAuthDemo,
  postAuthLogin,
  postAuthRegister,
  setApiTokenProvider,
  type AuthRegisterBody,
} from '@/shared/api'
import { SESSION_KEY, TOKEN_KEY } from '../constants'
import { SessionContext } from '../model/session-context'
import type { Session } from '../types'
import type { SessionProviderProps } from '../types'
import {
  toSessionFromAuthUser,
  toSessionFromMe,
} from '../utils'

setApiTokenProvider(() => sessionStorage.getItem(TOKEN_KEY))

export const SessionProvider = ({
  children,
  onSessionChange,
}: SessionProviderProps): React.ReactElement => {
  const [ready, setReady] = useState((): boolean => !sessionStorage.getItem(TOKEN_KEY))
  const [session, setSession] = useState<Session | null>(null)

  const clearSessionStorage = useCallback((): void => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(SESSION_KEY)
  }, [])

  const persistSession = useCallback((token: string, next: Session): void => {
    sessionStorage.setItem(TOKEN_KEY, token)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const replaceSession = useCallback(
    (token: string, next: Session): void => {
      onSessionChange?.()
      persistSession(token, next)
    },
    [onSessionChange, persistSession],
  )

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) return
    void (async (): Promise<void> => {
      try {
        const me = await fetchAuthMe()
        const next = toSessionFromMe(me)
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
        setSession(next)
      } catch {
        clearSessionStorage()
        setSession(null)
      } finally {
        setReady(true)
      }
    })()
  }, [clearSessionStorage])

  const loginWithPassword = useCallback(
    async (identifier: string, password: string): Promise<Session | string> => {
      try {
        const data = await postAuthLogin({ login: identifier, password })
        const next = toSessionFromAuthUser(data.user)
        if (!next) return 'Unsupported role'
        replaceSession(data.token, next)
        return next
      } catch (err) {
        return err instanceof Error ? err.message : 'Login failed'
      }
    },
    [replaceSession],
  )

  const loginDemo = useCallback(
    async (role: StaffRole): Promise<true | string> => {
      try {
        const data = await postAuthDemo(role)
        const next = toSessionFromAuthUser(data.user)
        if (!next) return 'Unsupported role'
        replaceSession(data.token, next)
        return true
      } catch (err) {
        return err instanceof Error ? err.message : 'Demo login unavailable'
      }
    },
    [replaceSession],
  )

  const register = useCallback(
    async (body: AuthRegisterBody): Promise<Session | string> => {
      try {
        const data = await postAuthRegister(body)
        const next = toSessionFromAuthUser(data.user)
        if (!next) return 'Unsupported role'
        replaceSession(data.token, next)
        return next
      } catch (err) {
        return err instanceof Error ? err.message : 'Registration failed'
      }
    },
    [replaceSession],
  )

  const logout = useCallback((): void => {
    onSessionChange?.()
    clearSessionStorage()
    setSession(null)
  }, [clearSessionStorage, onSessionChange])

  const value = useMemo(
    () => ({
      ready,
      session,
      loginWithPassword,
      loginDemo,
      register,
      logout,
    }),
    [ready, session, loginWithPassword, loginDemo, register, logout],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
