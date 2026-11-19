import { useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Application } from '@/entities/application'
import {
  APPLICATION_QUERY_KEYS,
  fetchAppById,
} from '@/entities/application'
import {
  CLIENT_QUERY_KEYS,
  fetchClientDetail,
  patchClientPassport,
  patchClientPortalForm,
  type ClientDetailWithPortalForm,
} from '@/entities/client'
import { homePath, useSession } from '@/entities/session'
import {
  ClientPortalFormEditForm,
  isPassportDirty,
  toPassportBody,
  toPortalFormBody,
  toPortalFormValues,
  toTripUpsertPatch,
  type ClientPortalFormSaveResult,
  type ClientPortalFormValues,
} from '@/features/client-portal-form-edit'
import {
  ENTITY_GONE_I18N_KEYS,
  isEntityGoneError,
  redirectIfEntityGone,
  resolveApiErrorI18nKey,
  useEntityGoneRedirect,
} from '@/shared/api'
import { useStore } from '@/widgets/app-store'
import { shouldShowPortalFormClientLink } from '../utils/should-show-portal-form-client-link.util'
import { ClientPortalFormRender } from './ClientPortalFormRender'

/**
 * Portal Edit Member + trip collection page (PFDC / REQ-FE-001…018).
 * Save order: passport (if dirty) → portal-form → apps upsert trip.
 * Never log form field values (PII).
 */
export const ClientPortalFormPage = (): React.ReactElement => {
  const { clientId = '' } = useParams<{ clientId: string }>()
  const { t } = useTranslation()
  const { session } = useSession()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { upsert } = useStore()

  const [passportError, setPassportError] = useState('')
  const [portalFormError, setPortalFormError] = useState('')
  const [tripError, setTripError] = useState('')
  const [saved, setSaved] = useState(false)
  const [pending, setPending] = useState(false)

  const role = session?.role
  const listPath = role ? `${homePath(role)}/clients` : '/app/clients'
  const detailPath = clientId ? `${listPath}/${clientId}` : listPath

  const detailQuery = useQuery({
    queryKey: CLIENT_QUERY_KEYS.detail(clientId),
    queryFn: (): Promise<ClientDetailWithPortalForm> =>
      fetchClientDetail(clientId),
    enabled: Boolean(clientId),
  })

  const applicationId = detailQuery.data?.applicationId ?? ''

  const applicationQuery = useQuery({
    queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
    queryFn: (): Promise<Application> => fetchAppById(applicationId),
    enabled: Boolean(applicationId),
  })

  useEntityGoneRedirect({
    error: detailQuery.error,
    enabled: detailQuery.isError,
    queryKey: CLIENT_QUERY_KEYS.all,
    listPath,
    noticeI18nKey: ENTITY_GONE_I18N_KEYS.client,
  })

  const loadError =
    detailQuery.isError && !isEntityGoneError(detailQuery.error)
      ? t(resolveApiErrorI18nKey(detailQuery.error))
      : applicationQuery.isError && applicationId
        ? t(resolveApiErrorI18nKey(applicationQuery.error))
        : ''

  const tripDisabled = !applicationId
  const tripDisabledMessage = t('clients.portalForm.tripDisabled')

  const resolveSubsectionError = (err: unknown): string => {
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
      return ''
    }
    return t(resolveApiErrorI18nKey(err))
  }

  const saveAll = async (
    values: ClientPortalFormValues,
    baseline: ClientPortalFormValues,
    application: Application | null,
  ): Promise<ClientPortalFormSaveResult> => {
    let nextPassportError = ''
    let nextPortalFormError = ''
    let nextTripError = ''

    if (isPassportDirty(values, baseline)) {
      try {
        await patchClientPassport(clientId, toPassportBody(values))
      } catch (err: unknown) {
        nextPassportError = resolveSubsectionError(err)
      }
    }

    try {
      await patchClientPortalForm(clientId, toPortalFormBody(values))
    } catch (err: unknown) {
      nextPortalFormError = resolveSubsectionError(err)
    }

    if (applicationId && application) {
      try {
        const tripPatch = toTripUpsertPatch(values)
        await upsert({
          ...application,
          submitCity: tripPatch.submitCity,
          visaType: tripPatch.visaType,
          visaSubType: tripPatch.visaSubType,
          category: tripPatch.category,
          destination: tripPatch.destination,
        })
      } catch (err: unknown) {
        nextTripError = resolveSubsectionError(err)
      }
    }

    await queryClient.invalidateQueries({
      queryKey: CLIENT_QUERY_KEYS.detail(clientId),
    })
    if (applicationId) {
      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.detail(applicationId),
      })
    }

    const ok =
      !nextPassportError && !nextPortalFormError && !nextTripError

    return {
      passportError: nextPassportError,
      portalFormError: nextPortalFormError,
      tripError: nextTripError,
      ok,
    }
  }

  const savedName =
    detailQuery.data !== undefined
      ? [detailQuery.data.firstName, detailQuery.data.lastName]
          .filter(Boolean)
          .join(' ')
          .trim()
      : ''
  const title = savedName || t('clients.portalForm.title')
  const showClientBackLink =
    detailQuery.data !== undefined &&
    shouldShowPortalFormClientLink(
      detailQuery.data.applicationId,
      detailQuery.data.applicationStatus,
      savedName.length > 0,
    )

  const loading =
    detailQuery.isLoading ||
    (Boolean(applicationId) && applicationQuery.isLoading)

  const formReady =
    detailQuery.data !== undefined &&
    (!applicationId || applicationQuery.data !== undefined)

  const form: ReactNode =
    formReady && detailQuery.data !== undefined ? (
      <ClientPortalFormEditForm
        key={`${detailQuery.data.updatedAt}:${applicationQuery.data?.updatedAt ?? 'none'}`}
        defaultValues={toPortalFormValues(
          detailQuery.data,
          applicationQuery.data ?? null,
        )}
        tripDisabled={tripDisabled}
        tripDisabledMessage={tripDisabledMessage}
        passportError={passportError}
        portalFormError={portalFormError}
        tripError={tripError}
        saved={saved}
        pending={pending}
        onValidSubmit={async (values): Promise<boolean> => {
          setPassportError('')
          setPortalFormError('')
          setTripError('')
          setSaved(false)
          setPending(true)
          try {
            const baseline = toPortalFormValues(
              detailQuery.data,
              applicationQuery.data ?? null,
            )
            const result = await saveAll(
              values,
              baseline,
              applicationQuery.data ?? null,
            )
            setPassportError(result.passportError)
            setPortalFormError(result.portalFormError)
            setTripError(result.tripError)
            setSaved(result.ok)
            return result.ok
          } finally {
            setPending(false)
          }
        }}
      />
    ) : null

  return (
    <ClientPortalFormRender
      detailPath={detailPath}
      showClientBackLink={showClientBackLink}
      loading={loading}
      loadError={loadError}
      title={title}
      form={form}
    />
  )
}
