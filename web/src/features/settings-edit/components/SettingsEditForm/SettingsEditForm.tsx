import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { settingsEditFormSchema } from '../../constants'
import type { SettingsEditFormProps, SettingsEditFormValues } from '../../types'
import { SettingsEditFormRender } from './SettingsEditFormRender'

export const SettingsEditForm = ({
  defaultValues,
  saved,
  onValidSubmit,
}: SettingsEditFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsEditFormValues>({
    resolver: zodResolver(settingsEditFormSchema),
    defaultValues,
  })

  return (
    <SettingsEditFormRender
      saved={saved}
      register={register}
      errors={errors}
      onSubmit={handleSubmit((values) => onValidSubmit(values))}
    />
  )
}
