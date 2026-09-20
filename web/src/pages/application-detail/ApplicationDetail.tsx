import { useEffect, useState } from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { useStore } from '@/app/providers'
import type { Application, DocType } from '@/entities/application'
import { fetchAppById, statusLabel } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { fetchManagerNames } from '@/entities/user'
import { applicationDetailFormSchema } from '@/features/application-form'
import { nowIso, uid } from '@/shared/lib'
import { APPLICATION_DETAIL_DEFAULT_TAB } from './constants'
import type { ApplicationDetailTabId } from './types'
import { ApplicationDetailRender } from './ApplicationDetailRender'

export const ApplicationDetail = () => {
  const { id } = useParams()
  const nav = useNavigate()
  const { apps, upsert, remove, addDoc, openDoc, session, settings, cacheApp } = useStore()
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

  const form = useForm<Application>({
    resolver: zodResolver(applicationDetailFormSchema) as Resolver<Application>,
    defaultValues: found ?? undefined,
    mode: 'onSubmit',
  })

  const isDirty = form.formState.isDirty

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
    form.setValue('updatedAt', found.updatedAt)
  }, [found, form])

  const save = form.handleSubmit(async (values) => {
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
      await upsert(next)
      form.reset(next)
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Не удалось сохранить заявку')
    }
  })

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

  return (
    <FormProvider {...form}>
      <ApplicationDetailRender
        form={loadState === 'ready' && found ? values : null}
        found={found ?? null}
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
        register={form.register}
        setValue={form.setValue}
        watch={form.watch}
        onTabChange={setActiveTab}
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
      />
    </FormProvider>
  )
}
