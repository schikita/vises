import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  Application,
  DocFile,
  Role,
  Session,
  Status,
  SystemSettings,
  User,
} from './types'
import { DEFAULT_SETTINGS, appBase } from './types'

const TOKEN_KEY = 'vises-token'
const SESSION_KEY = 'vises-session-v1'

export interface IssuedAccess {
  user: User
  password: string
  token: string
}

function apiUrl(path: string) {
  const prefix = import.meta.env.DEV ? '' : appBase()
  return `${prefix}/api${path}`
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = sessionStorage.getItem(TOKEN_KEY)
  const headers = new Headers(init.headers)
  if (!headers.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const res = await fetch(apiUrl(path), { ...init, headers })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { detail?: string | { msg: string }[] }
    const detail = data.detail
    const msg =
      typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((d) => d.msg).join(', ')
          : `Ошибка ${res.status}`
    throw new Error(msg)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function toSession(user: User): Session {
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email || user.login,
    login: user.login,
  }
}

interface Store {
  ready: boolean
  session: Session | null
  users: User[]
  apps: Application[]
  settings: SystemSettings
  login: (role: Role) => Promise<boolean>
  loginWithPassword: (login: string, password: string) => Promise<User | string>
  loginByInvite: (token: string) => Promise<User | null>
  logout: () => void
  upsert: (app: Application) => Promise<void>
  remove: (id: string) => Promise<void>
  setStatus: (id: string, status: Status, note?: string) => Promise<void>
  addDoc: (id: string, doc: DocFile, file?: File) => Promise<void>
  openDoc: (appId: string, docId: string) => Promise<void>
  createUser: (input: {
    name: string
    email: string
    login?: string
    role: Role
  }) => Promise<IssuedAccess | string>
  updateUser: (id: string, patch: Partial<User>) => Promise<string | null>
  reissueAccess: (id: string) => Promise<IssuedAccess | string>
  removeUser: (id: string) => Promise<string | null>
  saveSettings: (patch: Partial<SystemSettings>) => Promise<void>
  resetDemo: () => Promise<void>
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
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
    const [nextApps, nextSettings] = await Promise.all([
      request<Application[]>('/apps'),
      request<SystemSettings>('/settings'),
    ])
    setApps(nextApps)
    setSettings(nextSettings)
    if ((role ?? session?.role) === 'admin') {
      setUsers(await request<User[]>('/users'))
    } else {
      setUsers([])
    }
  }, [session?.role])

  useEffect(() => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    if (!token) {
      setReady(true)
      return
    }
    void (async () => {
      try {
        const me = await request<User>('/auth/me')
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
        const data = await request<{ token: string; user: User }>('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ login: loginValue, password }),
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
        const data = await request<{ token: string; user: User }>('/auth/demo', {
          method: 'POST',
          body: JSON.stringify({ role }),
        })
        applyAuth(data.token, data.user)
        await loadAll(data.user.role)
        return true
      } catch {
        return false
      }
    },
    [applyAuth, loadAll],
  )

  const loginByInvite = useCallback(async (token: string) => {
    try {
      return await request<User>(`/invite/${token}`)
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

  const upsert = useCallback(async (app: Application) => {
    const saved = await request<Application>('/apps', {
      method: 'POST',
      body: JSON.stringify(app),
    })
    setApps((cur) => (cur.some((a) => a.id === saved.id) ? cur.map((a) => (a.id === saved.id ? saved : a)) : [saved, ...cur]))
  }, [])

  const remove = useCallback(async (id: string) => {
    await request(`/apps/${id}`, { method: 'DELETE' })
    setApps((cur) => cur.filter((a) => a.id !== id))
  }, [])

  const setStatus = useCallback(
    async (id: string, status: Status, note?: string) => {
      const current = apps.find((a) => a.id === id)
      if (!current) return
      await upsert({
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
    const saved = await request<Application>(`/apps/${id}/docs`, { method: 'POST', body })
    setApps((cur) => cur.map((a) => (a.id === saved.id ? saved : a)))
  }, [])

  const openDoc = useCallback(async (appId: string, docId: string) => {
    const token = sessionStorage.getItem(TOKEN_KEY)
    const res = await fetch(apiUrl(`/apps/${appId}/docs/${docId}`), {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error('Не удалось открыть файл')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener')
  }, [])

  const createUser = useCallback(
    async (input: { name: string; email: string; login?: string; role: Role }) => {
      try {
        const data = await request<IssuedAccess>('/users', {
          method: 'POST',
          body: JSON.stringify(input),
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
      const saved = await request<User>(`/users/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(patch),
      })
      setUsers((cur) => cur.map((u) => (u.id === id ? saved : u)))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const reissueAccess = useCallback(async (id: string) => {
    try {
      return await request<IssuedAccess>(`/users/${id}/reissue`, { method: 'POST' })
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const removeUser = useCallback(async (id: string) => {
    try {
      await request(`/users/${id}`, { method: 'DELETE' })
      setUsers((cur) => cur.filter((u) => u.id !== id))
      return null
    } catch (err) {
      return err instanceof Error ? err.message : 'Ошибка'
    }
  }, [])

  const saveSettings = useCallback(async (patch: Partial<SystemSettings>) => {
    const saved = await request<SystemSettings>('/settings', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    setSettings(saved)
  }, [])

  const resetDemo = useCallback(async () => {
    await request('/settings/reset-demo', { method: 'POST' })
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
      createUser,
      updateUser,
      reissueAccess,
      removeUser,
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
      createUser,
      updateUser,
      reissueAccess,
      removeUser,
      saveSettings,
      resetDemo,
    ],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('Store missing')
  return ctx
}
