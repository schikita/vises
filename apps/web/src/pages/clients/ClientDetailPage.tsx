import { useState, type ReactNode } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  ClientDetailDto,
  ClientDto,
  ClientPassportUpdateDto,
} from '@vises/contracts'
import {
  CLIENT_QUERY_KEYS,
  deleteClient,
  fetchClientDetail,
  patchClientPassport,
} from '@/entities/client'
import { homePath, useSession } from '@/entities/session'
import {
  ClientPassportEditForm,
  toPassportFormValues,
  toPassportUpdateBody,
} from '@/features/client-passport-edit'
import {
  ENTITY_GONE_I18N_KEYS,
  isEntityGoneError,
  redirectIfEntityGone,
  resolveApiErrorI18nKey,
  useEntityGoneRedirect,
} from '@/shared/api'
import { ClientDetailRender } from './ClientDetailRender'

/**
 * Client detail + passport edit (FE9 / AC-7 / AC-8).
 * Detail uses Decision 2A `ClientDetailDto` plaintext; no durable PII storage.
 * Staff-only delete; agents have no delete control.
 * AC-19c: 404 → invalidate client queries + list notice.
 */
export const ClientDetailPage = (): React.ReactElement => {
  const { clientId = '' } = useParams<{ clientId: string }>()
  const { t } = useTranslation()
  const { session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [passportError, setPassportError] = useState('')
  const [passportSaved, setPassportSaved] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const role = session?.role
  const listPath = role ? `${homePath(role)}/clients` : '/app/clients'
  const appsBase = role ? `${homePath(role)}/apps` : '/app/apps'
  const canDelete = role === 'admin' || role === 'superadmin'

  const detailQuery = useQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(clientId),
    queryFn: (): Promise<ClientDetailDto> => fetchClientDetail(clientId),
    enabled: Boolean(clientId),
  })

  useEntityGoneRedirect({
    error: detailQuery.error,
    enabled: detailQuery.isError,
    queryKey: CLIENT_QUERY_KEYS.all,
    listPath,
    noticeI18nKey: ENTITY_GONE_I18N_KEYS.client,
  })

  const passportMutation = useMutation({
    mutationFn: (body: ClientPassportUpdateDto): Promise<ClientDto> =>
      patchClientPassport(clientId, body),
    onSuccess: async (): Promise<void> => {
      setPassportError('')
      setPassportSaved(true)
      await queryClient.invalidateQueries({
        queryKey: CLIENT_QUERY_KEYS.detail(clientId),
      })
      await queryClient.invalidateQueries({
        queryKey: [...CLIENT_QUERY_KEYS.all, 'list'],
      })
    },
    onError: (err: unknown): void => {
      if (
        redirectIfEntityGone({
          error: err,
          queryClient,
          queryKey: CLIENT_QUERY_KEYS.all,
          navigate,
          listPath,
          noticeI18nKey: ENTITY_GONE_I18N_KEYS.client,
        })
      ) {
        return
      }
      setPassportSaved(false)
      setPassportError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (): Promise<{ ok: true }> => deleteClient(clientId),
    onSuccess: async (): Promise<void> => {
      setDeleteError('')
      await queryClient.invalidateQueries({ queryKey: CLIENT_QUERY_KEYS.all })
      navigate(listPath)
    },
    onError: (err: unknown): void => {
      if (
        redirectIfEntityGone({
          error: err,
          queryClient,
          queryKey: CLIENT_QUERY_KEYS.all,
          navigate,
          listPath,
          noticeI18nKey: ENTITY_GONE_I18N_KEYS.client,
        })
      ) {
        return
      }
      setDeleteError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const loadError =
    detailQuery.isError && !isEntityGoneError(detailQuery.error)
      ? t(resolveApiErrorI18nKey(detailQuery.error))
      : ''

  const passportForm: ReactNode =
    detailQuery.data !== undefined ? (
      <ClientPassportEditForm
        key={detailQuery.data.updatedAt}
        defaultValues={toPassportFormValues(detailQuery.data)}
        apiError={passportError}
        saved={passportSaved}
        pending={passportMutation.isPending}
        onValidSubmit={async (values): Promise<boolean> => {
          setPassportError('')
          setPassportSaved(false)
          try {
            await passportMutation.mutateAsync(toPassportUpdateBody(values))
            return true
          } catch {
            return false
          }
        }}
      />
    ) : null

  const applicationPath =
    detailQuery.data !== undefined
      ? `${appsBase}/${detailQuery.data.applicationId}`
      : null

  return (
    <ClientDetailRender
      listPath={listPath}
      applicationPath={applicationPath}
      loading={detailQuery.isLoading}
      loadError={loadError}
      detail={detailQuery.data ?? null}
      canDelete={canDelete}
      deletePending={deleteMutation.isPending}
      deleteError={deleteError}
      passportForm={passportForm}
      onDelete={(): void => {
        if (!window.confirm(t('clients.detail.deleteConfirm'))) {
          return
        }
        setDeleteError('')
        deleteMutation.mutate()
      }}
    />
  )
}
