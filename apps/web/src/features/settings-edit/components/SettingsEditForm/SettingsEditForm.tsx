import { useState, type ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsEditFormSchema } from '../../constants'
import type { SettingsEditFormProps, SettingsEditFormValues } from '../../types'
import { addUniqueTrimmedValue } from '../../utils'
import { SettingsEditFormRender } from './SettingsEditFormRender'

export const SettingsEditForm = ({
  defaultValues,
  saved,
  onValidSubmit,
}: SettingsEditFormProps): ReactElement => {
  const [cityDraft, setCityDraft] = useState('')
  const [destinationDraft, setDestinationDraft] = useState('')
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<SettingsEditFormValues>({
    resolver: zodResolver(settingsEditFormSchema),
    defaultValues,
  })

  const cities = watch('cities')
  const destinations = watch('destinations')

  const onAddCity = (): void => {
    setValue('cities', addUniqueTrimmedValue(cities, cityDraft), {
      shouldDirty: true,
      shouldValidate: true,
    })
    setCityDraft('')
  }

  const onRemoveCity = (value: string): void => {
    setValue(
      'cities',
      cities.filter((city) => city !== value),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const onAddDestination = (): void => {
    setValue('destinations', addUniqueTrimmedValue(destinations, destinationDraft), {
      shouldDirty: true,
      shouldValidate: true,
    })
    setDestinationDraft('')
  }

  const onRemoveDestination = (value: string): void => {
    setValue(
      'destinations',
      destinations.filter((destination) => destination !== value),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  return (
    <SettingsEditFormRender
      saved={saved && !isDirty}
      saving={isSubmitting}
      companyRegister={register('company')}
      priceRegister={register('price')}
      cities={cities}
      destinations={destinations}
      cityDraft={cityDraft}
      destinationDraft={destinationDraft}
      errors={errors}
      onCityDraftChange={setCityDraft}
      onDestinationDraftChange={setDestinationDraft}
      onAddCity={onAddCity}
      onRemoveCity={onRemoveCity}
      onAddDestination={onAddDestination}
      onRemoveDestination={onRemoveDestination}
      onSubmit={handleSubmit(async (values) => {
        await onValidSubmit(values)
        reset(values)
      })}
    />
  )
}
