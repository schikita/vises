import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { ClientDto, ClientListDto } from '@vises/contracts'
import {
  CLIENT_QUERY_KEYS,
  fetchClientsList,
  postClientCreate,
} from '@/entities/client'
import { homePath, useSession } from '@/entities/session'
import {
  ClientCreateForm,
  toClientCreateBody,
} from '@/features/client-create'
import { PricePerClientHint } from '@/features/settings-price-edit'
import { readListNoticeI18nKey, resolveApiErrorI18nKey } from '@/shared/api'
import { ClientsRender } from './ClientsRender'

/**
 * Clients list (FE9 / AC-7): Decision 2A `ClientListDto` + maskedPassport.
 * Agent-only create with PricePerClientHint; staff list has no create control.
 */
export const ClientsPage = (): React.ReactElement => {
  const { t } = useTranslation()
  const { session } = useSession()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState('')

  const role = session?.role
  const canCreate = role === 'agent'
  const detailBasePath = role ? `${homePath(role)}/clients` : '/app/clients'
  const noticeKey = readListNoticeI18nKey(location.state)
  const notice = noticeKey ? t(noticeKey) : ''

  const listQuery = useQuery({
    queryKey: CLIENT_QUERY_KEYS.list(),
    queryFn: (): Promise<ClientListDto[]> => fetchClientsList(),
  })

  const createMutation = useMutation({
    mutationFn: postClientCreate,
    onSuccess: async (created: ClientDto): Promise<void> => {
      setCreateError('')
      setCreateOpen(false)
      await queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all })
      navigate(`${detailBasePath}/${created.id}`)
    },
    onError: (err: unknown): void => {
      setCreateError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const items = listQuery.data ?? []
  const listError = listQuery.isError
    ? t(resolveApiErrorI18nKey(listQuery.error))
    : ''

  const createForm: ReactNode = (
    <ClientCreateForm
      apiError={createError}
      pending={createMutation.isPending}
      priceHint={<PricePerClientHint className="text-sm text-text-secondary" />}
      onValidSubmit={async (values): Promise<boolean> => {
        setCreateError('')
        try {
          await createMutation.mutateAsync(toClientCreateBody(values))
          return true
        } catch {
          return false
        }
      }}
    />
  )

  return (
    <ClientsRender
      items={items}
      loading={listQuery.isLoading}
      listError={listError}
      notice={notice}
      detailBasePath={detailBasePath}
      canCreate={canCreate}
      createOpen={createOpen}
      createForm={createForm}
      onOpenCreate={(): void => {
        setCreateError('')
        setCreateOpen(true)
      }}
      onCloseCreate={(): void => setCreateOpen(false)}
    />
  )
}
