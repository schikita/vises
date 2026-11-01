import { useCallback, useEffect, useMemo, useState } from 'react'
import type {
  AppUpsertWrite,
  Application,
  DocFile,
  Status,
  UpsertAppResult,
} from '@/entities/application'
import { toAppUpsertPayload } from '@/entities/application'
import { useSession } from '@/entities/session'
import { DEFAULT_SETTINGS } from '@/entities/settings'
import type { SystemSettings } from '@/entities/settings'
import type { IssuedAccess, Role, User } from '@/entities/user'
import { apiRequest, fetchApiBlob, openBlobInNewTab } from '@/shared/api'
import { StoreContext } from '../model/store-context'
import type { StoreProviderProps } from '../types/store-provider.types'

export const StoreProvider = ({ children }: StoreProviderProps): React.ReactElement => {
  const {
    ready,
    session,
    loginDemo,
    loginWithPassword: sessionLoginWithPassword,
    logout: sessionLogout,
  } = useSession()
  const [apps, setApps] = useState<Application[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS)

  const loadAll = useCallback(async (): Promise<void> => {
    const nextSettings = await apiRequest<SystemSettings>('/settings')
    setSettings(nextSettings)
    setApps([])
    setUsers([])
  }, [])

  useEffect(() => {
    if (!ready || !session) return
    void loadAll().catch(() => {
      setSettings(DEFAULT_SETTINGS)
    })
  }, [ready, session?.userId, loadAll, session])

  const loginWithPassword = useCallback(
    async (loginValue: string, password: string): Promise<User | string> => {
      const result = await sessionLoginWithPassword(loginValue, password)
      if (typeof result === 'string') return result
      await loadAll()
      return {
        id: result.userId,
        name: result.name,
        login: result.login,
        email: result.email,
        role: result.role,
        active: result.active,
        inviteToken: '',
        createdAt: '',
        updatedAt: '',
      }
    },
    [loadAll, sessionLoginWithPassword],
  )

  const login = useCallback(
    async (role: Role): Promise<true | string> => {
      const result = await loginDemo(role)
      if (result === true) await loadAll()
      return result
    },
    [loadAll, loginDemo],
  )

  const logout = useCallback((): void => {
    sessionLogout()
    setApps([])
    setUsers([])
  }, [sessionLogout])

  const cacheApp = useCallback((application: Application): void => {
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

  const remove = useCallback(async (id: string): Promise<void> => {
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

  const addDoc = useCallback(async (id: string, doc: DocFile, file?: File): Promise<void> => {
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

  const openDoc = useCallback(async (appId: string, docId: string): Promise<void> => {
    try {
      const blob = await fetchApiBlob(`/apps/${appId}/docs/${docId}`)
      openBlobInNewTab(blob)
    } catch {
      throw new Error('Не удалось открыть файл')
    }
  }, [])

  const createUser = useCallback(
    async (input: {
      name: string
      email: string
      login?: string
      role: Role
    }): Promise<IssuedAccess | string> => {
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

  const updateUser = useCallback(async (id: string, patch: Partial<User>): Promise<string | null> => {
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

  const reissueAccess = useCallback(async (id: string): Promise<IssuedAccess | string> => {
    try {
      return await apiRequest<IssuedAccess>(`/users/${id}/reissue`, { method: 'POST' })
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const removeUser = useCallback(async (id: string): Promise<string | null> => {
    try {
      await apiRequest(`/users/${id}`, { method: 'DELETE' })
      setUsers((cur) => cur.filter((u) => u.id !== id))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const refreshUsers = useCallback(async (): Promise<void> => {}, [])

  const saveSettings = useCallback(async (patch: Partial<SystemSettings>): Promise<void> => {
    const saved = await apiRequest<SystemSettings>('/settings', {
      method: 'PATCH',
      data: patch,
    })
    setSettings(saved)
  }, [])

  const resetDemo = useCallback(async (): Promise<void> => {
    await apiRequest('/settings/reset-demo', { method: 'POST' })
    await loadAll()
  }, [loadAll])

  const value = useMemo(
    () => ({
      ready,
      session,
      users,
      apps,
      settings,
      login,
      loginWithPassword,
      logout,
      upsert,
      remove,
      setStatus,
      addDoc,
      openDoc,
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
      logout,
      upsert,
      remove,
      setStatus,
      addDoc,
      openDoc,
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
