import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientPassportFormSchema } from '../../constants'
import type {
  ClientPassportEditFormProps,
  ClientPassportFormValues,
} from '../../types'
import { ClientPassportEditFormRender } from './ClientPassportEditFormRender'

export const ClientPassportEditForm = ({
  defaultValues,
  apiError,
  saved,
  pending,
  onValidSubmit,
}: ClientPassportEditFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientPassportFormValues>({
    resolver: zodResolver(clientPassportFormSchema),
    defaultValues,
  })

  return (
    <ClientPassportEditFormRender
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
