import type { ReactElement } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserFormSchema } from '../../constants'
import type { CreateUserFormProps, CreateUserFormValues } from '../../types'
import { CreateUserFormRender } from './CreateUserFormRender'

export const CreateUserForm = ({
  apiError,
  onValidSubmit,
}: CreateUserFormProps): ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { name: '', email: '', login: '', role: 'agent' },
  })

  return (
    <CreateUserFormRender
      apiError={apiError}
      register={register}
      errors={errors}
      onSubmit={handleSubmit(async (values): Promise<void> => {
        const ok = await onValidSubmit(values)
        if (ok) reset({ name: '', email: '', login: '', role: 'agent' })
      })}
    />
  )
}
