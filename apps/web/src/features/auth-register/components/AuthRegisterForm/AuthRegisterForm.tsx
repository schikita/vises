import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authRegisterFormSchema } from '../../constants'
import type { AuthRegisterFormProps, AuthRegisterFormValues } from '../../types'
import { AuthRegisterFormRender } from './AuthRegisterFormRender'

export const AuthRegisterForm = ({
  apiError,
  onValidSubmit,
}: AuthRegisterFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuthRegisterFormValues>({
    resolver: zodResolver(authRegisterFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      login: '',
      password: '',
      email: '',
    },
  })

  return (
    <AuthRegisterFormRender
      apiError={apiError}
      register={register}
      errors={errors}
      onSubmit={handleSubmit((values) => {
        void onValidSubmit(values)
      })}
    />
  )
}
