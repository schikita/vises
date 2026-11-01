import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsPriceFormSchema } from '../../constants'
import type {
  SettingsPriceEditFormProps,
  SettingsPriceFormValues,
} from '../../types'
import { SettingsPriceEditFormRender } from './SettingsPriceEditFormRender'

export const SettingsPriceEditForm = ({
  defaultValues,
  apiError,
  saved,
  pending,
  onValidSubmit,
}: SettingsPriceEditFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SettingsPriceFormValues>({
    resolver: zodResolver(settingsPriceFormSchema),
    defaultValues,
  })

  useEffect((): void => {
    reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <SettingsPriceEditFormRender
      apiError={apiError}
      saved={saved}
      pending={pending}
      register={register}
      errors={errors}
      onSubmit={handleSubmit(async (values): Promise<void> => {
        await onValidSubmit(values)
      })}
    />
  )
}
