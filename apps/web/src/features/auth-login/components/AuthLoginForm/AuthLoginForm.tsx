import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authLoginFormSchema } from '../../constants'
import type { AuthLoginFormProps, AuthLoginFormValues } from '../../types'
import { AuthLoginFormRender } from './AuthLoginFormRender'

export const AuthLoginForm = ({
  apiError,
  onValidSubmit,
}: AuthLoginFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthLoginFormValues>({
    resolver: zodResolver(authLoginFormSchema),
    defaultValues: { login: '', password: '' },
  })

  return (
    <AuthLoginFormRender
      apiError={apiError}
      register={register}
      errors={errors}
      onSubmit={handleSubmit((values) => onValidSubmit(values))}
    />
  )
}
