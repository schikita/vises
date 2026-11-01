import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  CLIENT_CREATE_FORM_EMPTY_VALUES,
  clientCreateFormSchema,
} from '../../constants'
import type { ClientCreateFormProps, ClientCreateFormValues } from '../../types'
import { ClientCreateFormRender } from './ClientCreateFormRender'

export const ClientCreateForm = ({
  apiError,
  pending,
  priceHint,
  onValidSubmit,
}: ClientCreateFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientCreateFormValues>({
    resolver: zodResolver(clientCreateFormSchema),
    defaultValues: CLIENT_CREATE_FORM_EMPTY_VALUES,
  })

  return (
    <ClientCreateFormRender
      apiError={apiError}
      pending={pending}
      priceHint={priceHint}
      register={register}
      errors={errors}
      onSubmit={handleSubmit(async (values): Promise<void> => {
        const ok = await onValidSubmit(values)
        if (ok) {
          reset(CLIENT_CREATE_FORM_EMPTY_VALUES)
        }
      })}
    />
  )
}
