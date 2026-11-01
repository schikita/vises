import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type {
  ApplicationDto,
  ApplicationStatus,
  ApplicationStatusHistoryResponseDto,
  ApplicationStatusTransitionActor,
} from '@vises/contracts'
import { useStore } from '@/widgets/app-store'
import type { Application, DocType } from '@/entities/application'
import {
  APPLICATION_QUERY_KEYS,
  ApplicationStatusHistoryTimeline,
  fetchAppById,
  fetchApplicationStatusHistory,
  isApplicationStatus,
  postApplicationStatus,
  statusLabel,
} from '@/entities/application'
import { homePath, staffBase, useSession } from '@/entities/session'
import { fetchManagerNames } from '@/entities/user'
import { ApplicationStatusChangeControls } from '@/features/application-status-change'
import { applicationDetailFormSchema } from '@/features/application-form'
import {
  CLIENT_APPLICATION_JOIN_QUERY_KEY,
  fetchClientApplicationJoins,
  findClientApplicationJoin,
} from '@/entities/client'
import {
  ENTITY_GONE_I18N_KEYS,
  isEntityGoneError,
  redirectIfEntityGone,
  resolveApiErrorI18nKey,
} from '@/shared/api'
import { Btn } from '@/shared/ui'
import { nowIso, uid } from '@/shared/lib'
import { APPLICATION_DETAIL_DEFAULT_TAB } from './constants'
import type { ApplicationDetailTabId } from './types'
import { ApplicationDetailRender } from './ApplicationDetailRender'

export const ApplicationDetail = (): React.ReactElement => {
  const { id } = useParams()
  const nav = useNavigate()
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { session: authSession } = useSession()
  const {
    apps,
    upsert,
    remove,
    addDoc,
    openDoc,
    session,
    settings,
    cacheApp,
  } = useStore()
  const found = id ? apps.find((a) => a.id === id) : undefined
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'missing'>(
    found ? 'ready' : 'loading',
  )
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [statusError, setStatusError] = useState('')
  const [uploading, setUploading] = useState<DocType | null>(null)
  const [docError, setDocError] = useState('')
  const [activeTab, setActiveTab] = useState<ApplicationDetailTabId>(
    APPLICATION_DETAIL_DEFAULT_TAB,
  )
  const [managerNames, setManagerNames] = useState<string[]>([])
  const applicationId = id ?? ''
  const role = authSession?.role ?? session?.role
  const clientsBase = role ? `${homePath(role)}/clients` : '/app/clients'
  const appsListPath = `${staffBase(session?.role)}/apps`
  const matrixActor: ApplicationStatusTransitionActor | null =
    role === 'superadmin' || role === 'admin' || role === 'agent' ? role : null

  const form = useForm<Application>({
    resolver: zodResolver(applicationDetailFormSchema) as Resolver<Application>,
    defaultValues: found ?? undefined,
    mode: 'onSubmit',
  })

  const isDirty = form.formState.isDirty

  useEffect((): void => {
    if (isDirty) setSaved(false)
  }, [isDirty])

  useEffect((): (() => void) => {
    let cancelled = false
    void fetchManagerNames()
      .then((names: string[]): void => {
        if (!cancelled) setManagerNames(names)
      })
      .catch((): void => {
        if (!cancelled) setManagerNames([])
      })
    return (): void => {
      cancelled = true
    }
  }, [])

  useEffect((): (() => void) | void => {
    if (!id) {
      setLoadState('missing')
      return
    }
    if (apps.some((a) => a.id === id)) {
      setLoadState('ready')
      return
    }
    let cancelled = false
    setLoadState('loading')
    void fetchAppById(id)
      .then((app: Application): void => {
        if (cancelled) return
        cacheApp(app)
        setLoadState('ready')
      })
      .catch((err: unknown): void => {
        if (cancelled) return
        if (
          redirectIfEntityGone({
            error: err,
            queryClient,
            queryKey: APPLICATION_QUERY_KEYS.all,
            navigate: nav,
            listPath: appsListPath,
            noticeI18nKey: ENTITY_GONE_I18N_KEYS.application,
          })
        ) {
          return
        }
        setLoadState('missing')
      })
    return (): void => {
      cancelled = true
    }
  }, [id, apps, cacheApp, queryClient, nav, appsListPath])

  useEffect((): void => {
    if (!found) {
      form.reset(undefined)
      return
    }
    const currentId = form.getValues('id')
    if (currentId !== found.id) {
      form.reset(found)
      setSaved(false)
      return
    }
    form.setValue('status', found.status)
    form.setValue('timeline', found.timeline)
    form.setValue('documents', found.documents)
    form.setValue('portalFormEmail', found.portalFormEmail ?? null)
    form.setValue('updatedAt', found.updatedAt)
  }, [found, form])

  const persistApplicationValues = useCallback(
    async (values: Application): Promise<string | null> => {
      setSaveError('')
      const live = apps.find((a) => a.id === values.id) ?? values
      const next: Application = {
        ...values,
        documents: live.documents,
        timeline:
          found && found.status !== values.status
            ? [
                ...live.timeline,
                {
                  at: nowIso(),
                  text: t('applicationDetail.timelineStatus', {
                    status: isApplicationStatus(values.status)
                      ? t(`applications.status.${values.status}`)
                      : statusLabel(values.status),
                  }),
                  actor:
                    session?.name ??
                    t('applicationDetail.timelineActorFallback'),
                },
              ]
            : live.timeline,
      }
      try {
        await upsert(next)
        form.reset(next)
        setSaved(true)
        return null
      } catch (err) {
        if (
          redirectIfEntityGone({
            error: err,
            queryClient,
            queryKey: APPLICATION_QUERY_KEYS.all,
            navigate: nav,
            listPath: appsListPath,
            noticeI18nKey: ENTITY_GONE_I18N_KEYS.application,
          })
        ) {
          return null
        }
        const message = t(resolveApiErrorI18nKey(err))
        setSaveError(message)
        return message
      }
    },
    [
      apps,
      appsListPath,
      found,
      form,
      nav,
      queryClient,
      session?.name,
      t,
      upsert,
    ],
  )

  const save = form.handleSubmit(async (values: Application): Promise<void> => {
    await persistApplicationValues(values)
  })

  const onUpload = (type: DocType, file: File): void => {
    const appId = form.getValues('id')
    if (!appId) return
    setDocError('')
    setUploading(type)
    void addDoc(
      appId,
      {
        id: uid('doc'),
        type,
        name: file.name,
        uploadedAt: nowIso(),
      },
      file,
    )
      .catch((err: unknown): void => {
        if (
          redirectIfEntityGone({
            error: err,
            queryClient,
            queryKey: APPLICATION_QUERY_KEYS.all,
            navigate: nav,
            listPath: appsListPath,
            noticeI18nKey: ENTITY_GONE_I18N_KEYS.application,
          })
        ) {
          return
        }
        setDocError(t(resolveApiErrorI18nKey(err)))
      })
      .finally((): void => {
        setUploading(null)
      })
  }

  const values = form.watch()
  const formValues =
    loadState === 'ready' && found
      ? values.id === found.id && Array.isArray(values.applicants)
        ? values
        : found
      : null

  const historyQuery = useQuery({
    queryKey: APPLICATION_QUERY_KEYS.history(applicationId),
    queryFn: (): Promise<ApplicationStatusHistoryResponseDto> =>
      fetchApplicationStatusHistory(applicationId),
    enabled: Boolean(applicationId) && loadState === 'ready',
  })

  const joinQuery = useQuery({
    queryKey: CLIENT_APPLICATION_JOIN_QUERY_KEY,
    queryFn: fetchClientApplicationJoins,
    enabled: Boolean(applicationId) && loadState === 'ready',
  })

  const statusMutation = useMutation({
    mutationFn: (targetStatus: ApplicationStatus): Promise<ApplicationDto> =>
      postApplicationStatus(applicationId, { targetStatus }),
    onSuccess: async (dto: ApplicationDto): Promise<void> => {
      setStatusError('')
      if (isApplicationStatus(dto.status)) {
        form.setValue('status', dto.status as Application['status'], {
          shouldDirty: false,
        })
      }
      const live = apps.find((a) => a.id === applicationId)
      if (live) {
        cacheApp({ ...live, status: dto.status as Application['status'] })
      }
      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.history(applicationId),
      })
      await queryClient.invalidateQueries({
        queryKey: APPLICATION_QUERY_KEYS.all,
      })
      await queryClient.invalidateQueries({
        queryKey: CLIENT_APPLICATION_JOIN_QUERY_KEY,
      })
    },
    onError: (err: unknown): void => {
      if (
        redirectIfEntityGone({
          error: err,
          queryClient,
          queryKey: APPLICATION_QUERY_KEYS.all,
          navigate: nav,
          listPath: appsListPath,
          noticeI18nKey: ENTITY_GONE_I18N_KEYS.application,
        })
      ) {
        return
      }
      setStatusError(t(resolveApiErrorI18nKey(err)))
    },
  })

  const currentApplicationStatus: ApplicationStatus | null =
    formValues && isApplicationStatus(formValues.status)
      ? formValues.status
      : null

  const statusChangeControls: ReactNode =
    currentApplicationStatus && matrixActor ? (
      <ApplicationStatusChangeControls
        currentStatus={currentApplicationStatus}
        actor={matrixActor}
        pending={statusMutation.isPending}
        apiError={statusError}
        onChangeStatus={(targetStatus): void => {
          setStatusError('')
          statusMutation.mutate(targetStatus)
        }}
      />
    ) : (
      <p className="text-sm text-text-secondary">
        {t('applications.statusChange.noTargets')}
      </p>
    )

  const historyTimeline: ReactNode = (
    <ApplicationStatusHistoryTimeline
      items={historyQuery.data?.items ?? []}
      loading={historyQuery.isLoading}
      error={
        historyQuery.isError
          ? isEntityGoneError(historyQuery.error)
            ? ''
            : t(resolveApiErrorI18nKey(historyQuery.error))
          : ''
      }
      emptyTitle={t('applications.history.emptyTitle')}
      emptyText={t('applications.history.emptyText')}
      loadingTitle={t('applications.history.loadingTitle')}
      loadingText={t('applications.history.loadingText')}
    />
  )

  useEffect((): void => {
    if (!historyQuery.isError) {
      return
    }
    redirectIfEntityGone({
      error: historyQuery.error,
      queryClient,
      queryKey: APPLICATION_QUERY_KEYS.all,
      navigate: nav,
      listPath: appsListPath,
      noticeI18nKey: ENTITY_GONE_I18N_KEYS.application,
    })
  }, [historyQuery.isError, historyQuery.error, queryClient, nav, appsListPath])

  const joinedClient = findClientApplicationJoin(
    joinQuery.data ?? [],
    applicationId,
  )
  const clientPassportLink: ReactNode = joinedClient ? (
    <Btn to={`${clientsBase}/${joinedClient.clientId}`}>
      {t('applications.detail.openPassport')}
    </Btn>
  ) : (
    <span className="text-sm text-text-secondary">
      {t('applications.detail.passportUnavailable')}
    </span>
  )

  return (
    <FormProvider {...form}>
      <ApplicationDetailRender
        form={formValues}
        loading={loadState === 'loading'}
        saved={saved}
        saveError={saveError}
        uploading={uploading}
        docError={docError}
        destinations={settings.destinations}
        cities={settings.cities}
        managerNames={managerNames}
        appsListPath={appsListPath}
        activeTab={activeTab}
        register={form.register}
        setValue={form.setValue}
        watch={form.watch}
        onTabChange={setActiveTab}
        statusChangeControls={statusChangeControls}
        historyTimeline={historyTimeline}
        clientPassportLink={clientPassportLink}
        onSave={(): void => {
          void save()
        }}
        onRemove={(): void => {
          const appId = form.getValues('id')
          if (!appId) return
          void remove(appId).then((): void => {
            nav(appsListPath)
          })
        }}
        onUpload={onUpload}
        onOpenDoc={(docId): void => {
          const appId = form.getValues('id')
          if (!appId) return
          void openDoc(appId, docId)
        }}
      />
    </FormProvider>
  )
}
