import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { homePath, inviteUrl } from '@/entities/session'
import type { User } from '@/entities/user'
import { InviteRender } from './InviteRender'

export const InvitePage = () => {
  const { token = '' } = useParams()
  const { loginByInvite, loginWithPassword } = useStore()
  const nav = useNavigate()
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [show, setShow] = useState(true)
  const [copied, setCopied] = useState('')
  const [loginError, setLoginError] = useState('')

  useEffect(() => {
    void loginByInvite(token).then(setUser)
  }, [loginByInvite, token])

  const copy = (text: string, label: string) => {
    void navigator.clipboard.writeText(text)
    setCopied(label)
  }

  const onEnterCabinet = () => {
    if (!user?.password) return
    void loginWithPassword(user.login, user.password).then((result) => {
      if (typeof result === 'string') {
        setLoginError(result)
        return
      }
      setLoginError('')
      nav(homePath(user.role))
    })
  }

  return (
    <InviteRender
      user={user}
      show={show}
      copied={copied}
      loginError={loginError}
      inviteLink={user ? inviteUrl(user.inviteToken) : ''}
      onToggleShow={() => setShow((v) => !v)}
      onCopy={copy}
      onEnterCabinet={onEnterCabinet}
    />
  )
}
