import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { balanceAdjustFormSchema } from '../../constants'
import type { BalanceAdjustFormProps, BalanceAdjustFormValues } from '../../types'
import { BalanceAdjustFormRender } from './BalanceAdjustFormRender'

export const BalanceAdjustForm = ({
  apiError,
  saved,
  pending,
  onValidSubmit,
}: BalanceAdjustFormProps): React.ReactElement => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BalanceAdjustFormValues>({
    resolver: zodResolver(balanceAdjustFormSchema),
    defaultValues: { amount: '', reason: '' },
  })

  return (
    <BalanceAdjustFormRender
      apiError={apiError}
      saved={saved}
      pending={pending}
      register={register}
      errors={errors}
      onSubmit={handleSubmit(async (values): Promise<void> => {
        const ok = await onValidSubmit(values)
        if (ok) {
          reset({ amount: '', reason: '' })
        }
      })}
    />
  )
}
