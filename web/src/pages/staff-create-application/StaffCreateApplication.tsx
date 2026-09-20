import { useMemo, useState } from 'react'
import { FormProvider, useFieldArray, useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import type { IssuedAccess } from '@/entities/user'
import type { Application } from '@/entities/application'
import { emptyApplicant, emptyApplication } from '@/entities/application'
import { inviteUrl, staffBase } from '@/entities/session'
import {
  CITIES_BY_COUNTRY,
  STAFF_TRIP_STEP_FIELDS,
  staffApplicationFormSchema,
} from '@/features/application-form'
import { nowIso } from '@/shared/lib'
import { STAFF_ANKETA_TABS } from './constants'
import type { StaffAnketaTab } from './types'
import { StaffCreateApplicationRender } from './StaffCreateApplicationRender'

export const StaffCreateApplication = () => {
  const { session, upsert, settings } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [anketaTab, setAnketaTab] = useState<StaffAnketaTab>(STAFF_ANKETA_TABS[0])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [issued, setIssued] = useState<IssuedAccess | null>(null)
  const [createdAppId, setCreatedAppId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const defaultValues = useMemo(() => {
    const app = emptyApplication('')
    app.paymentAmount = settings.defaultPrice
    app.manager = session?.name ?? ''
    app.destination = 'Испания'
    app.visaType = 'Туристическая'
    app.category = 'Normal'
    app.submitCountry = 'Belarus'
    app.submitCity = 'Minsk'
    const today = new Date().toISOString().slice(0, 10)
    app.submitFrom = today
    app.submitTo = today
    app.travelDate = today
    return app
  }, [session?.name, settings.defaultPrice])

  const form = useForm<Application>({
    resolver: zodResolver(staffApplicationFormSchema) as Resolver<Application>,
    defaultValues,
    mode: 'onSubmit',
  })

  const applicantsArray = useFieldArray({
    control: form.control,
    name: 'applicants',
    keyName: 'fieldKey',
  })

  const submitCountry = form.watch('submitCountry')
  const cities = CITIES_BY_COUNTRY[submitCountry] ?? ['Minsk']
  const staffAppsBase = `${staffBase(session?.role)}/apps`

  const goToCreatedApp = () => {
    if (!createdAppId) return
    nav(`${staffAppsBase}/${createdAppId}`)
  }

  const copyLink = (token: string) => {
    void navigator.clipboard.writeText(inviteUrl(token))
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const createApplication = form.handleSubmit(async (values) => {
    setSaving(true)
    setError('')
    const clientIdentity = values.clientEmail.trim()
    const next: Application = {
      ...values,
      clientEmail: clientIdentity,
      status: 'new',
      updatedAt: nowIso(),
      timeline: [
        {
          at: nowIso(),
          text: 'Заявка создана, анкета заполнена',
          actor: session?.name ?? 'Агент',
        },
      ],
    }
    try {
      const saved = await upsert(next)
      if (saved.issuedClientAccess) {
        setIssued(saved.issuedClientAccess)
        setCreatedAppId(saved.id)
        setSaving(false)
        return
      }
      nav(`${staffAppsBase}/${saved.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать заявку')
      setSaving(false)
    }
  })

  return (
    <FormProvider {...form}>
      <StaffCreateApplicationRender
        step={step}
        anketaTab={anketaTab}
        cities={cities}
        saving={saving}
        error={error}
        issued={issued}
        createdAppId={createdAppId}
        copied={copied}
        staffAppsBase={staffAppsBase}
        register={form.register}
        setValue={form.setValue}
        watch={form.watch}
        errors={form.formState.errors}
        applicantFields={applicantsArray.fields}
        onAnketaTabChange={setAnketaTab}
        onAddApplicant={() => applicantsArray.append(emptyApplicant('Spouse'))}
        onRemoveApplicant={(index) => {
          if (applicantsArray.fields.length <= 1) return
          applicantsArray.remove(index)
        }}
        onSubmit={(e) => {
          e.preventDefault()
          if (step === 0) {
            void form.trigger([...STAFF_TRIP_STEP_FIELDS]).then((ok) => {
              if (ok) {
                setStep(1)
                setAnketaTab(STAFF_ANKETA_TABS[0])
              }
            })
            return
          }
          void createApplication(e)
        }}
        onBack={() => (step === 0 ? nav(staffAppsBase) : setStep(0))}
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
