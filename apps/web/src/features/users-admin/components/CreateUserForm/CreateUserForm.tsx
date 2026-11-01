import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createUserFormSchema } from '../../constants'
import type { CreateUserFormProps, CreateUserFormValues } from '../../types'
import { CreateUserFormRender } from './CreateUserFormRender'

export const CreateUserForm = ({
  apiError,
  allowedRoles,
  onValidSubmit,
}: CreateUserFormProps): React.ReactElement => {
  const defaultRole = allowedRoles[0] ?? 'agent'
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues: { name: '', email: '', login: '', role: defaultRole },
  })

  useEffect((): void => {
    const nextRole = allowedRoles[0] ?? 'agent'
    setValue('role', nextRole)
  }, [allowedRoles, setValue])

  return (
    <CreateUserFormRender
      apiError={apiError}
      allowedRoles={allowedRoles}
      register={register}
      errors={errors}
      onSubmit={handleSubmit(async (values) => {
        const role = allowedRoles.includes(values.role) ? values.role : defaultRole
        const ok = await onValidSubmit({ ...values, role })
        if (ok) {
          reset({ name: '', email: '', login: '', role: defaultRole })
        }
      })}
    />
  )
}
