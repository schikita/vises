import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { balanceTopUpFormSchema } from '../../constants'
import type { BalanceTopUpFormProps, BalanceTopUpFormValues } from '../../types'
import { BalanceTopUpFormRender } from './BalanceTopUpFormRender'

export const BalanceTopUpForm = ({
  apiError,
  saved,
  pending,
  onValidSubmit,
}: BalanceTopUpFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BalanceTopUpFormValues>({
    resolver: zodResolver(balanceTopUpFormSchema),
    defaultValues: { amount: '' },
  })

  return (
    <BalanceTopUpFormRender
      apiError={apiError}
      saved={saved}
      pending={pending}
      register={register}
      errors={errors}
      onSubmit={handleSubmit(async (values): Promise<void> => {
        const ok = await onValidSubmit(values)
        if (ok) {
          reset({ amount: '' })
        }
      })}
    />
  )
}
