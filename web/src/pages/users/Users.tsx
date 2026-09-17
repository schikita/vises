import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { useStore } from '@/app/providers'
import { inviteUrl } from '@/entities/session'
import type { IssuedAccess, Role } from '@/entities/user'
import { CreateUserForm } from '@/features/users-admin'
import { UsersRender } from './UsersRender'

export const UsersPage = () => {
  const { users, createUser, updateUser, reissueAccess, removeUser, refreshUsers, session } =
    useStore()
  const [error, setError] = useState('')
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [copied, setCopied] = useState(false)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all')

  useEffect(() => {
    void refreshUsers()
  }, [refreshUsers])

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    return users.filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false
      if (!query) return true
      return `${u.name} ${u.login} ${u.email}`.toLowerCase().includes(query)
    })
  }, [users, q, roleFilter])

  const copyLink = (token: string) => {
    void navigator.clipboard.writeText(inviteUrl(token))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const createForm: ReactNode = (
    <CreateUserForm
      apiError={error}
      onValidSubmit={async ({ name, email, login, role }) => {
        const result = await createUser({ name, email, login, role })
        if (typeof result === 'string') {
          setError(result)
          setIssued(null)
          return false
        }
        setError('')
        setIssued(result)
        return true
      }}
    />
  )

  return (
    <UsersRender
      filtered={filtered}
      createForm={createForm}
      issued={issued}
      copied={copied}
      q={q}
      roleFilter={roleFilter}
      sessionUserId={session?.userId}
      onQueryChange={setQ}
      onRoleFilterChange={setRoleFilter}
      onCopyLink={copyLink}
      onCopyCredentials={(issuedAccess) => {
        void navigator.clipboard.writeText(
          `Vises\nЛогин: ${issuedAccess.user.login}\nПароль: ${issuedAccess.password}\nСсылка: ${inviteUrl(issuedAccess.token)}`,
        )
      }}
      onReissue={(userId) => {
        void reissueAccess(userId).then((result) => {
          if (typeof result === 'string') setError(result)
          else {
            setError('')
            setIssued(result)
          }
        })
      }}
      onToggleActive={(userId, active) => {
        void updateUser(userId, { active: !active }).then((err) => {
          if (err) setError(err)
        })
      }}
      onRemove={(userId) => {
        void removeUser(userId).then((err) => {
          if (err) setError(err)
        })
      }}
    />
  )
}
