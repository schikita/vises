import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type {
  AppUpsertWrite,
  Application,
  DocFile,
  Status,
  UpsertAppResult,
} from '@/entities/application'
import { toAppUpsertPayload } from '@/entities/application'
import { SESSION_KEY, TOKEN_KEY, toSession } from '@/entities/session'
import type { Session } from '@/entities/session'
import { DEFAULT_SETTINGS } from '@/entities/settings'
import type { SystemSettings } from '@/entities/settings'
import type { IssuedAccess, Role, User } from '@/entities/user'
import {
  apiRequest,
  fetchApiBlob,
  openBlobInNewTab,
  setApiTokenProvider,
} from '@/shared/api'
import { StoreContext } from './store-context'

setApiTokenProvider(() => sessionStorage.getItem(TOKEN_KEY))

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [ready, setReady] = useState(false)
  const [session, setSession] = useState<Session | null>(null)
  const [apps, setApps] = useState<Application[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS)

  const applyAuth = useCallback((token: string, user: User) => {
    sessionStorage.setItem(TOKEN_KEY, token)
    const next = toSession(user)
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const loadAll = useCallback(async (role?: Role) => {
    const effectiveRole = role ?? session?.role
    const nextSettings = await apiRequest<SystemSettings>('/settings')
    setSettings(nextSettings)
    // DEC-007: client keeps full GET /apps array; staff lists self-fetch paged APIs.
    if (effectiveRole === 'client') {
      setApps(await apiRequest<Application[]>('/apps'))
    } else {
      setApps([])
    }
    // Staff users admin is page-local; do not download full /users for bootstrap.
    setUsers([])
  }, [session?.role])

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) {
      setReady(true)
      return
    }
    void (async () => {
      try {
        const me = await apiRequest<User>('/auth/me')
        setSession(toSession(me))
        await loadAll(me.role)
      } catch {
        sessionStorage.removeItem(TOKEN_KEY)
        sessionStorage.removeItem(SESSION_KEY)
        setSession(null)
      } finally {
        setReady(true)
      }
    })()
    // initial restore only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loginWithPassword = useCallback(
    async (loginValue: string, password: string) => {
      try {
        const data = await apiRequest<{ token: string; user: User }>('/auth/login', {
          method: 'POST',
          data: { login: loginValue, password },
        })
        applyAuth(data.token, data.user)
        await loadAll(data.user.role)
        return data.user
      } catch (err) {
        return err instanceof Error ? err.message : 'Ошибка входа'
      }
    },
    [applyAuth, loadAll],
  )

  const login = useCallback(
    async (role: Role) => {
      try {
        const data = await apiRequest<{ token: string; user: User }>('/auth/demo', {
          method: 'POST',
          data: { role },
        })
        applyAuth(data.token, data.user)
        await loadAll(data.user.role)
        return true as const
      } catch (err) {
        return err instanceof Error ? err.message : 'Демо-вход недоступен'
      }
    },
    [applyAuth, loadAll],
  )

  const loginByInvite = useCallback(async (token: string) => {
    try {
      return await apiRequest<User>(`/invite/${token}`)
    } catch {
      return null
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setSession(null)
    setApps([])
    setUsers([])
  }, [])

  const cacheApp = useCallback((application: Application) => {
    setApps((cur) =>
      cur.some((a) => a.id === application.id)
        ? cur.map((a) => (a.id === application.id ? application : a))
        : [application, ...cur],
    )
  }, [])

  const upsert = useCallback(async (app: AppUpsertWrite): Promise<UpsertAppResult> => {
    type UpsertHttpBody = {
      correlationId?: string
      payload?: UpsertAppResult['payload']
      application?: Application
      issuedClientAccess?: UpsertAppResult['issuedClientAccess']
    } & Partial<Application>

    const saved = await apiRequest<UpsertHttpBody>('/apps', {
      method: 'POST',
      data: toAppUpsertPayload(app),
    })
    const application = (saved.application ??
      (() => {
        const {
          correlationId: _c,
          payload: _p,
          issuedClientAccess: _i,
          application: _a,
          ...flat
        } = saved
        return flat as Application
      })()) as Application
    const issuedClientAccess = saved.issuedClientAccess
    setApps((cur) =>
      cur.some((a) => a.id === application.id)
        ? cur.map((a) => (a.id === application.id ? application : a))
        : [application, ...cur],
    )
    if (issuedClientAccess?.user) {
      setUsers((cur) =>
        cur.some((u) => u.id === issuedClientAccess.user.id)
          ? cur
          : [issuedClientAccess.user, ...cur],
      )
    }
    return {
      ...application,
      correlationId: saved.correlationId,
      payload: saved.payload,
      ...(issuedClientAccess ? { issuedClientAccess } : {}),
    }
  }, [])
  const remove = useCallback(async (id: string) => {
    await apiRequest(`/apps/${id}`, { method: 'DELETE' })
    setApps((cur) => cur.filter((a) => a.id !== id))
  }, [])

  const setStatus = useCallback(
    async (id: string, status: Status, note?: string): Promise<Application | null> => {
      const current = apps.find((a) => a.id === id)
      if (!current) return null
      return upsert({
        ...current,
        status,
        timeline: [
          ...current.timeline,
          {
            at: new Date().toISOString(),
            text: note || `Статус: ${status}`,
            actor: session?.name ?? 'Система',
          },
        ],
      })
    },
    [apps, session, upsert],
  )

  const addDoc = useCallback(async (id: string, doc: DocFile, file?: File) => {
    if (!file) return
    const body = new FormData()
    body.append('type', doc.type)
    body.append('file', file)
    const saved = await apiRequest<Application>(`/apps/${id}/docs`, {
      method: 'POST',
      data: body,
    })
    setApps((cur) =>
      cur.some((a) => a.id === saved.id)
        ? cur.map((a) => (a.id === saved.id ? saved : a))
        : [saved, ...cur],
    )
  }, [])

  const openDoc = useCallback(async (appId: string, docId: string) => {
    try {
      const blob = await fetchApiBlob(`/apps/${appId}/docs/${docId}`)
      openBlobInNewTab(blob)
    } catch {
      throw new Error('Не удалось открыть файл')
    }
  }, [])

  const openPortalAutofillScreenshot = useCallback(async (runId: string) => {
    try {
      const blob = await fetchApiBlob(`/apps/portal-autofill-runs/${runId}/screenshot`)
      openBlobInNewTab(blob)
    } catch {
      throw new Error('Не удалось открыть скриншот')
    }
  }, [])

  const createUser = useCallback(
    async (input: { name: string; email: string; login?: string; role: Role }) => {
      try {
        const data = await apiRequest<IssuedAccess>('/users', {
          method: 'POST',
          data: input,
        })
        setUsers((cur) => [data.user, ...cur])
        return data
      } catch (err) {
        return err instanceof Error ? err.message : 'Ошибка'
      }
    },
    [],
  )

  const updateUser = useCallback(async (id: string, patch: Partial<User>) => {
    try {
      const saved = await apiRequest<User>(`/users/${id}`, {
        method: 'PATCH',
        data: patch,
      })
      setUsers((cur) => cur.map((u) => (u.id === id ? saved : u)))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const reissueAccess = useCallback(async (id: string) => {
    try {
      return await apiRequest<IssuedAccess>(`/users/${id}/reissue`, { method: 'POST' })
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const removeUser = useCallback(async (id: string) => {
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' })
      setUsers((cur) => cur.filter((u) => u.id !== id))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  /** Users list is page-local (DEC-007); no full-collection refresh. */
  const refreshUsers = useCallback(async () => {}, [])

  const saveSettings = useCallback(async (patch: Partial<SystemSettings>) => {
    const saved = await apiRequest<SystemSettings>('/settings', {
      method: 'PATCH',
      data: patch,
    })
    setSettings(saved)
  }, [])

  const resetDemo = useCallback(async () => {
    await apiRequest('/settings/reset-demo', { method: 'POST' })
    await loadAll(session?.role)
  }, [loadAll, session?.role])

  const value = useMemo(
    () => ({
      ready,
      session,
      users,
      apps,
      settings,
      login,
      loginWithPassword,
      loginByInvite,
      logout,
      upsert,
      remove,
      setStatus,
      addDoc,
      openDoc,
      openPortalAutofillScreenshot,
      createUser,
      updateUser,
      reissueAccess,
      removeUser,
      refreshUsers,
      cacheApp,
      saveSettings,
      resetDemo,
    }),
    [
      ready,
      session,
      users,
      apps,
      settings,
      login,
      loginWithPassword,
      loginByInvite,
      logout,
      upsert,
      remove,
      setStatus,
      addDoc,
      openDoc,
      openPortalAutofillScreenshot,
      createUser,
      updateUser,
      reissueAccess,
      removeUser,
      refreshUsers,
      cacheApp,
      saveSettings,
      resetDemo,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
