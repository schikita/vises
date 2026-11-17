import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsCityDestinationFormSchema } from '../../constants'
import type {
  SettingsCityDestinationFormProps,
  SettingsCityDestinationFormValues,
} from '../../types'
import { addUniqueTrimmedValue } from '../../utils'
import { SettingsCityDestinationFormRender } from './SettingsCityDestinationFormRender'

export const SettingsCityDestinationForm = ({
  defaultValues,
  apiError,
  saved,
  pending,
  onValidSubmit,
}: SettingsCityDestinationFormProps): React.ReactElement => {
  const [cityDraft, setCityDraft] = useState('')
  const [destinationDraft, setDestinationDraft] = useState('')
  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SettingsCityDestinationFormValues>({
    resolver: zodResolver(settingsCityDestinationFormSchema),
    defaultValues,
  })

  useEffect((): void => {
    reset(defaultValues)
  }, [defaultValues, reset])

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
      cities.filter((city): boolean => city !== value),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const onAddDestination = (): void => {
    setValue(
      'destinations',
      addUniqueTrimmedValue(destinations, destinationDraft),
      { shouldDirty: true, shouldValidate: true },
    )
    setDestinationDraft('')
  }

  const onRemoveDestination = (value: string): void => {
    setValue(
      'destinations',
      destinations.filter((destination): boolean => destination !== value),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  return (
    <SettingsCityDestinationFormRender
      apiError={apiError}
      saved={saved}
      pending={pending}
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
      onSubmit={handleSubmit(async (values): Promise<void> => {
        const ok = await onValidSubmit(values)
        if (ok) reset(values)
      })}
    />
  )
}
