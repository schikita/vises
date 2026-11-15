import { useEffect, useMemo, useState, type ReactElement } from 'react'
import { FormProvider, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import { emptyApplication } from '@/entities/application'
import { fetchClientsList, type ClientListDto } from '@/entities/client'
import { inviteUrl, staffBase } from '@/entities/session'
import type { IssuedAccess } from '@/entities/user'
import {
  createEmptyPortalOnePageFormValues,
  runPortalSaveAllCreate,
  type PortalOnePageFormValues,
} from '@/features/application-form'
import { nowIso } from '@/shared/lib'
import { staffPortalCreateFormSchema } from './constants/staff-portal-create-form.schema'
import { StaffCreateApplicationRender } from './StaffCreateApplicationRender'

export const StaffCreateApplication = (): ReactElement => {
  const { session, upsert, settings } = useStore()
  const nav = useNavigate()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [createdAppId, setCreatedAppId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [clients, setClients] = useState<ClientListDto[]>([])
  const [clientsLoading, setClientsLoading] = useState(true)
  const [clientsError, setClientsError] = useState('')
  const [selectedClientId, setSelectedClientId] = useState('')

  const defaultValues = useMemo(() => {
    return {
      ...createEmptyPortalOnePageFormValues(),
      destination: 'Испания',
      visaType: 'Туристическая',
      category: 'Normal',
      submitCountry: 'Belarus',
      submitCity: 'Minsk',
    }
  }, [])

  const form = useForm<PortalOnePageFormValues>({
    resolver: zodResolver(staffPortalCreateFormSchema) as Resolver<PortalOnePageFormValues>,
    defaultValues,
    mode: 'onSubmit',
  })

  const staffAppsBase = `${staffBase(session?.role)}/apps`

  useEffect(() => {
    let cancelled = false
    setClientsLoading(true)
    setClientsError('')
    void fetchClientsList()
      .then((rows) => {
        if (cancelled) return
        setClients(rows)
        setClientsLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        // Operator-safe: status/codes only — never field values.
        const message =
          err instanceof Error && err.message.trim()
            ? err.message.trim()
            : 'не удалось загрузить список клиентов'
        setClientsError(message)
        setClients([])
        setClientsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const goToCreatedApp = (): void => {
    if (!createdAppId) return
    nav(`${staffAppsBase}/${createdAppId}`)
  }

  const copyLink = (token: string): void => {
    void navigator.clipboard.writeText(inviteUrl(token))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const saveAll = form.handleSubmit(async (values): Promise<void> => {
    setSaving(true)
    setError('')
    const clientEmail = (values.clientEmail ?? '').trim()
    const draft = emptyApplication(clientEmail)
    // DEC-PF-011: omit/clear clientId on draft; runner sets selected or leaves empty
    // so API creates a real CRM Client (never synthetic orphan ids).
    draft.clientId = ''
    draft.paymentAmount = settings.defaultPrice
    draft.manager = session?.name ?? ''
    draft.status = 'new'
    draft.updatedAt = nowIso()
    draft.timeline = [
      {
        at: nowIso(),
        text: 'Заявка создана, анкета портала сохранена',
        actor: session?.name ?? 'Агент',
      },
    ]

    const result = await runPortalSaveAllCreate({
      values,
      draftApplication: draft,
      selectedClientId: selectedClientId.trim() || null,
      upsert,
    })

    if (!result.ok) {
      setError(result.message)
      setSaving(false)
      return
    }

    if (result.saved.issuedClientAccess) {
      setIssued(result.saved.issuedClientAccess)
      setCreatedAppId(result.saved.id)
      setSaving(false)
      return
    }

    nav(`${staffAppsBase}/${result.saved.id}`)
  })

  return (
    <FormProvider {...form}>
      <StaffCreateApplicationRender
        saving={saving}
        error={error}
        issued={issued}
        createdAppId={createdAppId}
        copied={copied}
        staffAppsBase={staffAppsBase}
        clients={clients}
        clientsLoading={clientsLoading}
        clientsError={clientsError}
        selectedClientId={selectedClientId}
        register={form.register}
        errors={form.formState.errors}
        onSelectedClientIdChange={setSelectedClientId}
        onSubmit={(e) => {
          e.preventDefault()
          void saveAll(e)
        }}
        onBack={() => nav(staffAppsBase)}
        onCopyLink={copyLink}
        onCopyAll={() => {
          if (!issued) return
          void navigator.clipboard.writeText(
            `Логин: ${issued.user.login}\nПароль: ${issued.password}\nСсылка: ${inviteUrl(issued.token)}`,
          )
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        }}
        onGoToCreatedApp={goToCreatedApp}
      />
    </FormProvider>
  )
}
