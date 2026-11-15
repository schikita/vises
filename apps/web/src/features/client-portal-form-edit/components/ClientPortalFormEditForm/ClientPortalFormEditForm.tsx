import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientPortalFormSchema } from '../../constants'
import type {
  ClientPortalFormEditFormProps,
  ClientPortalFormValues,
} from '../../types'
import { ClientPortalFormEditFormRender } from './ClientPortalFormEditFormRender'

export const ClientPortalFormEditForm = ({
  defaultValues,
  tripDisabled,
  tripDisabledMessage,
  passportError,
  portalFormError,
  tripError,
  saved,
  pending,
  onValidSubmit,
}: ClientPortalFormEditFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientPortalFormValues>({
    resolver: zodResolver(clientPortalFormSchema),
    defaultValues,
  })

  return (
    <ClientPortalFormEditFormRender
      tripDisabled={tripDisabled}
      tripDisabledMessage={tripDisabledMessage}
      passportError={passportError}
      portalFormError={portalFormError}
      tripError={tripError}
      saved={saved}
      pending={pending}
      register={register}
      setValue={setValue}
      watch={watch}
      errors={errors}
      onSubmit={handleSubmit(async (values): Promise<void> => {
        await onValidSubmit(values)
      })}
    />
  )
}
