import { useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/app/providers'
import type { Application, DocType } from '@/entities/application'
import {
  APPLICATION_STATUS_NEEDS_FIXES,
  fetchAppById,
  statusLabel,
} from '@/entities/application'
import { staffBase } from '@/entities/session'
import { fetchManagerNames } from '@/entities/user'
import { applicationDetailFormSchema, applicationDetailStartFormSchema } from '@/features/application-form'
import { nowIso, uid } from '@/shared/lib'
import {
  APPLICATION_DETAIL_DEFAULT_TAB,
  APPLICATION_DETAIL_START_VALIDATION_COPY,
} from './constants'
import type {
  ApplicationDetailStartIssue,
  ApplicationDetailTabId,
} from './types'
import {
  collectApplicationDetailStartIssuesFromZod,
  computeApplicationDetailStartFormBlocked,
  hasApplicationDetailStartPathErrors,
  isApplicationDetailStartRelevantPath,
  mapApplicationDetailStartApiDetailToIssues,
  resolveApplicationDetailStartFirstTab,
  syncApplicationDetailStartFormErrors,
} from './utils'
import { ApplicationDetailRender } from './ApplicationDetailRender'

export const ApplicationDetail = () => {
  const { id } = useParams()
  const nav = useNavigate()
  const {
    apps,
    upsert,
    remove,
    addDoc,
    openDoc,
    openPortalAutofillScreenshot,
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
  const [uploading, setUploading] = useState<DocType | null>(null)
  const [docError, setDocError] = useState('')
  const [activeTab, setActiveTab] = useState<ApplicationDetailTabId>(APPLICATION_DETAIL_DEFAULT_TAB)
  const [managerNames, setManagerNames] = useState<string[]>([])
  const [startValidationOpen, setStartValidationOpen] = useState(false)
  const [startValidationIssues, setStartValidationIssues] = useState<
    ApplicationDetailStartIssue[]
  >([])

  const form = useForm<Application>({
    resolver: zodResolver(applicationDetailFormSchema) as Resolver<Application>,
    defaultValues: found ?? undefined,
    mode: 'onSubmit',
  })

  const isDirty = form.formState.isDirty
  const formErrors = form.formState.errors
  const watchedApplicants = form.watch('applicants')
  const startFormBlocked = computeApplicationDetailStartFormBlocked(
    watchedApplicants,
    formErrors,
  )
  const hasKnownStartErrors = hasApplicationDetailStartPathErrors(
    formErrors,
    watchedApplicants?.length ?? 0,
  )

  useEffect(() => {
    if (isDirty) setSaved(false)
  }, [isDirty])

  useEffect(() => {
    let cancelled = false
    void fetchManagerNames()
      .then((names) => {
        if (!cancelled) setManagerNames(names)
      })
      .catch(() => {
        if (!cancelled) setManagerNames([])
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
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
      .then((app) => {
        if (cancelled) return
        cacheApp(app)
        setLoadState('ready')
      })
      .catch(() => {
        if (cancelled) return
        setLoadState('missing')
      })
    return () => {
      cancelled = true
    }
  }, [id, apps, cacheApp])

  useEffect(() => {
    if (!found) {
      form.reset(undefined)
      return
    }
    // DEC-008: keep dirty local edits; sync store-owned status/timeline/documents after side effects.
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

  /** Returns null on success, Russian error message on failure. */
  const persistApplicationValues = useCallback(
    async (
      values: Application,
      portalWorkflowAction?: 'ensure' | 'supersede' | 'none',
    ): Promise<string | null> => {
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
                  text: `Статус: ${statusLabel(values.status)}`,
                  actor: session?.name ?? 'Агент',
                },
              ]
            : live.timeline,
      }
      try {
        await upsert(
          portalWorkflowAction
            ? { ...next, portalWorkflowAction }
            : next,
        )
        form.reset(next)
        setSaved(true)
        return null
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : APPLICATION_DETAIL_START_VALIDATION_COPY.saveBeforeStartFailed
        setSaveError(message)
        return message
      }
    },
    [apps, found, form, session?.name, upsert],
  )

  const save = form.handleSubmit(async (values) => {
    await persistApplicationValues(values)
  })

  const openStartDialog = useCallback((issues: ApplicationDetailStartIssue[]) => {
    setStartValidationIssues(issues)
    setStartValidationOpen(true)
  }, [])

  /** Persist CRM status «Нужны правки» after Start validation failures. */
  const markApplicationNeedsFixes = useCallback(async () => {
    const values = form.getValues()
    if (!values.id || values.status === APPLICATION_STATUS_NEEDS_FIXES) {
      return
    }
    await persistApplicationValues({
      ...values,
      status: APPLICATION_STATUS_NEEDS_FIXES,
    })
  }, [form, persistApplicationValues])

  const onStartBlsWorkflowApiError = useCallback(
    (detail: string) => {
      const issues = mapApplicationDetailStartApiDetailToIssues(detail)
      if (issues.length === 0) return
      openStartDialog(issues)
      // Backend sets «Нужны правки» on date-gate 400 — refresh so the form status updates.
      const appId = form.getValues('id')
      if (!appId) return
      void fetchAppById(appId)
        .then((app) => {
          cacheApp(app)
        })
        .catch(() => {
          /* keep dialog; status may stay stale until next load */
        })
    },
    [cacheApp, form, openStartDialog],
  )

  const syncStartFormErrors = useCallback(() => {
    syncApplicationDetailStartFormErrors({
      values: form.getValues(),
      setError: form.setError,
      clearErrors: form.clearErrors,
    })
  }, [form])

  const onStartRelevantBlur = useCallback(
    (fieldName: string) => {
      if (!isApplicationDetailStartRelevantPath(fieldName)) return
      syncStartFormErrors()
    },
    [syncStartFormErrors],
  )

  /** DEC-005: once Start errors exist, re-sync on change for snappier recovery. */
  const onStartRelevantChange = useCallback(
    (fieldName: string) => {
      if (!hasKnownStartErrors) return
      if (!isApplicationDetailStartRelevantPath(fieldName)) return
      syncStartFormErrors()
    },
    [hasKnownStartErrors, syncStartFormErrors],
  )

  /** DEC-004: tab change runs Start Completeness + date sync (no Dialog). */
  const onTabChange = useCallback(
    (tab: ApplicationDetailTabId) => {
      setActiveTab(tab)
      syncStartFormErrors()
    },
    [syncStartFormErrors],
  )

  const onBeforeStartBlsWorkflow = useCallback(
    async (_options: { supersede: boolean }): Promise<boolean> => {
      // Click-path full Start gate: Completeness + dates before any workflow API.
      const values = form.getValues()
      const applicants = values.applicants ?? []
      if (applicants.length === 0) {
        openStartDialog([
          { message: APPLICATION_DETAIL_START_VALIDATION_COPY.noApplicants },
        ])
        setActiveTab('applicants')
        await markApplicationNeedsFixes()
        return false
      }

      const parsed = applicationDetailStartFormSchema.safeParse(values)
      if (!parsed.success) {
        const issues = collectApplicationDetailStartIssuesFromZod(
          parsed.error,
          applicants,
        )
        openStartDialog(issues)
        const firstTab = resolveApplicationDetailStartFirstTab(issues)
        if (firstTab) setActiveTab(firstTab)
        // Persist status first (reset clears field errors), then re-apply errors.
        await markApplicationNeedsFixes()
        syncApplicationDetailStartFormErrors({
          values: form.getValues(),
          setError: form.setError,
          clearErrors: form.clearErrors,
        })
        return false
      }

      // Clear any stale Start chrome once the click-path schema passes.
      syncApplicationDetailStartFormErrors({
        values: form.getValues(),
        setError: form.setError,
        clearErrors: form.clearErrors,
      })

      // Persist + arm via upsert (DEC-015). supersede → portalWorkflowAction.
      const persistError = await persistApplicationValues(
        form.getValues(),
        _options.supersede ? 'supersede' : 'ensure',
      )
      if (persistError) {
        setSaveError(persistError)
        openStartDialog([{ message: persistError }])
        return false
      }

      return true
    },
    [
      form,
      markApplicationNeedsFixes,
      openStartDialog,
      persistApplicationValues,
    ],
  )

  const onUpload = (type: DocType, file: File) => {
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
      .catch((err: unknown) =>
        setDocError(err instanceof Error ? err.message : 'Не удалось загрузить'),
      )
      .finally(() => setUploading(null))
  }

  const values = form.watch()
  const formValues =
    loadState === 'ready' && found
      ? values.id === found.id && Array.isArray(values.applicants)
        ? values
        : found
      : null

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
        appsListPath={`${staffBase(session?.role)}/apps`}
        activeTab={activeTab}
        startValidationOpen={startValidationOpen}
        startValidationIssues={startValidationIssues}
        register={form.register}
        setValue={form.setValue}
        watch={form.watch}
        onTabChange={onTabChange}
        onCloseStartValidation={() => setStartValidationOpen(false)}
        startFormBlocked={startFormBlocked}
        onStartRelevantBlur={onStartRelevantBlur}
        onStartRelevantChange={onStartRelevantChange}
        onBeforeStartBlsWorkflow={onBeforeStartBlsWorkflow}
        onStartBlsWorkflowApiError={onStartBlsWorkflowApiError}
        onSave={() => {
          void save()
        }}
        onRemove={() => {
          const appId = form.getValues('id')
          if (!appId) return
          void remove(appId).then(() => nav(`${staffBase(session?.role)}/apps`))
        }}
        onUpload={onUpload}
        onOpenDoc={(docId) => {
          const appId = form.getValues('id')
          if (!appId) return
          void openDoc(appId, docId)
        }}
        onAutofillRunLinked={(runId) => openPortalAutofillScreenshot(runId)}
      />
    </FormProvider>
  )
}
