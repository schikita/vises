import type { DocType } from '../types'

export const DOC_TYPES: { id: DocType; label: string; required: boolean }[] = [
  { id: 'selfie', label: 'Селфи без фильтров', required: true },
  { id: 'passport', label: 'Разворот паспорта', required: true },
  { id: 'visa_photo', label: 'Фото на визу', required: true },
  { id: 'insurance', label: 'Страховка', required: false },
  { id: 'video', label: 'Видео для визового центра', required: false },
  { id: 'other', label: 'Другое', required: false },
]
