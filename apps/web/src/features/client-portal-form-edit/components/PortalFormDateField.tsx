import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { DayPicker } from 'react-day-picker'
import { Field, Popover } from '@/shared/ui'
import {
  PORTAL_FORM_DATE_END_MONTH,
  PORTAL_FORM_DATE_START_MONTH,
} from '../constants'
import { usePortalFormLabels } from '../model/use-portal-form-labels.hook'
import type { PortalFormDateFieldProps } from '../types'
import { formatPortalDateYmd, parsePortalDateYmd } from '../utils'
import 'react-day-picker/style.css'

export const PortalFormDateField = ({
  name,
  label,
  required,
  pending,
  value,
  register,
  setValue,
  errors,
}: PortalFormDateFieldProps): React.ReactElement => {
  const { t } = useTranslation()
  const { issueMessage } = usePortalFormLabels()
  const errorMessage = issueMessage(errors[name]?.message)
  const chooseDateLabel = `${t('clients.portalForm.chooseDate')}, ${label}`
  const [open, setOpen] = useState(false)
  const [month, setMonth] = useState<Date>(PORTAL_FORM_DATE_END_MONTH)
  const selected = parsePortalDateYmd(value)

  const handleOpenChange = (nextOpen: boolean): void => {
    if (nextOpen) {
      setMonth(parsePortalDateYmd(value) ?? new Date())
    }
    setOpen(nextOpen)
  }

  return (
    <Field label={label} required={required} error={errorMessage}>
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1">
          <input
            className="field min-w-0 flex-1 self-stretch tabular-nums"
            autoComplete="off"
            disabled={pending}
            aria-invalid={Boolean(errors[name])}
            {...register(name)}
            readOnly
          />
        </div>
        <Popover
          className="flex shrink-0 self-stretch"
          open={open}
          onOpenChange={handleOpenChange}
          contentAriaLabel={chooseDateLabel}
          trigger={
            <button
              type="button"
              className="field flex !w-11 shrink-0 items-center justify-center self-stretch px-0"
              aria-label={chooseDateLabel}
              disabled={pending}
            >
              <CalendarDays size={16} aria-hidden />
            </button>
          }
        >
          <DayPicker
            mode="single"
            month={month}
            onMonthChange={(nextMonth: Date): void => {
              setMonth(nextMonth)
            }}
            selected={selected}
            onSelect={(nextDate: Date | undefined): void => {
              if (nextDate === undefined) {
                return
              }
              setValue(name, formatPortalDateYmd(nextDate), {
                shouldDirty: true,
                shouldValidate: true,
              })
              setOpen(false)
            }}
            captionLayout="dropdown"
            navLayout="after"
            startMonth={PORTAL_FORM_DATE_START_MONTH}
            endMonth={PORTAL_FORM_DATE_END_MONTH}
          />
        </Popover>
      </div>
    </Field>
  )
}
