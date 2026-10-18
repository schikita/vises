import type {
  AppUpsertWrite,
  Application,
  DocFile,
  Status,
  UpsertAppResult,
} from '@/entities/application'
import type { Session } from '@/entities/session'
import type { SystemSettings } from '@/entities/settings'
import type { IssuedAccess, Role, User } from '@/entities/user'

export type Store = {
  ready: boolean
  session: Session | null
  users: User[]
  apps: Application[]
  settings: SystemSettings
  login: (role: Role) => Promise<true | string>
  loginWithPassword: (login: string, password: string) => Promise<User | string>
  loginByInvite: (token: string) => Promise<User | null>
  logout: () => void
  upsert: (app: AppUpsertWrite) => Promise<UpsertAppResult>
  remove: (id: string) => Promise<void>
  setStatus: (id: string, status: Status, note?: string) => Promise<Application | null>
  addDoc: (id: string, doc: DocFile, file?: File) => Promise<void>
  openDoc: (appId: string, docId: string) => Promise<void>
  openPortalAutofillScreenshot: (runId: string) => Promise<void>
  createUser: (input: {
    name: string
    email: string
    login?: string
    role: Role
  }) => Promise<IssuedAccess | string>
  updateUser: (id: string, patch: Partial<User>) => Promise<string | null>
  reissueAccess: (id: string) => Promise<IssuedAccess | string>
  removeUser: (id: string) => Promise<string | null>
  refreshUsers: () => Promise<void>
  cacheApp: (app: Application) => void
  saveSettings: (patch: Partial<SystemSettings>) => Promise<void>
  resetDemo: () => Promise<void>
}
