import { useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { useStore } from '@/app/providers'
import type { Application } from '@/entities/application'
import { emptyApplication } from '@/entities/application'
import {
  CLIENT_PERSON_STEP_FIELDS,
  CLIENT_TRIP_STEP_FIELDS,
  clientApplicationFormSchema,
} from '@/features/application-form'
import { nowIso } from '@/shared/lib'
import { NEW_APPLICATION_STEPS } from './constants'
import { NewApplicationRender } from './NewApplicationRender'

export const NewApplication = () => {
  const { session, upsert, settings } = useStore()
  const nav = useNavigate()
  const [step, setStep] = useState(0)
  const [error, setError] = useState('')
  const [submittedId, setSubmittedId] = useState<string | null>(null)
  const [submittedCode, setSubmittedCode] = useState('')

  const defaultValues = useMemo(() => {
    const app = emptyApplication(session?.email || session?.login || '')
    app.paymentAmount = settings.defaultPrice
    if (settings.destinations[0]) app.destination = settings.destinations[0]
    if (settings.cities[0]) app.submitCity = settings.cities[0]
    return app
  }, [session?.email, session?.login, settings.cities, settings.defaultPrice, settings.destinations])

  const form = useForm<Application>({
    resolver: zodResolver(clientApplicationFormSchema) as Resolver<Application>,
    defaultValues,
    mode: 'onSubmit',
  })

  const title = useMemo(() => NEW_APPLICATION_STEPS[step], [step])

  const onFormSubmit = form.handleSubmit(async (values) => {
    setError('')
    const next: Application = {
      ...values,
      portalFormEmail: null,
      status: 'docs',
      updatedAt: nowIso(),
      timeline: [
        { at: nowIso(), text: 'Анкета отправлена, жду документы', actor: session?.name ?? 'Клиент' },
      ],
    }
    try {
      const saved = await upsert(next)
      setSubmittedId(saved.id)
      setSubmittedCode(saved.code)
      setStep(2)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить анкету')
    }
  })

  return (
    <NewApplicationRender
      step={step}
      title={title}
      error={error}
      destinations={settings.destinations}
      cities={settings.cities}
      submittedId={submittedId}
      submittedCode={submittedCode}
      register={form.register}
      setValue={form.setValue}
      errors={form.formState.errors}
      watch={form.watch}
      onBack={() => (step === 0 ? nav('/app') : setStep(0))}
      onFormSubmit={(e) => {
        e.preventDefault()
        if (step === 0) {
          void form.trigger([...CLIENT_TRIP_STEP_FIELDS]).then((ok) => {
            if (ok) setStep(1)
          })
          return
        }
        void form.trigger([...CLIENT_PERSON_STEP_FIELDS]).then((ok) => {
          if (ok) void onFormSubmit(e)
        })
      }}
    />
  )
}
