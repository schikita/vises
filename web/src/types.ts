export type Role = 'admin' | 'manager' | 'client'

export type Status =
  | 'new'
  | 'docs'
  | 'review'
  | 'ready'
  | 'booked'
  | 'done'
  | 'fixes'
  | 'autofill_ok'
  | 'autofill_failed'
  | 'declined'

export type DocType =
  | 'selfie'
  | 'passport'
  | 'visa_photo'
  | 'insurance'
  | 'video'
  | 'other'

export interface Applicant {
  id: string
  firstName: string
  lastName: string
  lastNameAtBirth: string
  dob: string
  placeOfBirth: string
  countryOfBirth: string
  nationality: string
  gender: 'female' | 'male'
  maritalStatus: string
  passportNumber: string
  passportIssued: string
  passportExpires: string
  relationship?: string
  otherNames?: string
  nationalityAtBirth?: string
  nationalId?: string
  passportType?: string
  passportIssuedBy?: string
  email?: string
  phone?: string
  address?: string
  purpose?: string
  firstEntry?: string
  entries?: string
  durationDays?: string
}

export interface DocFile {
  id: string
  type: DocType
  name: string
  uploadedAt: string
  /** Server filesystem name; absent/empty means open is unavailable (DEC-005). */
  stored?: string
  preview?: string
}

export interface TimelineItem {
  at: string
  text: string
  actor: string
}

export interface Application {
  id: string
  code: string
  clientEmail: string
  status: Status
  destination: string
  visaType: string
  category?: string
  submitCountry: string
  submitCity: string
  submitFrom?: string
  submitTo?: string
  travelDate: string
  returnDate: string
  paused?: boolean
  transfer?: boolean
  comment: string
  applicants: Applicant[]
  documents: DocFile[]
  paymentAmount: number
  paymentPaid: boolean
  paymentNote: string
  visitDate: string
  visitTime: string
  visitPlace: string
  manager: string
  timeline: TimelineItem[]
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  login: string
  email: string
  password: string
  role: Role
  active: boolean
  inviteToken: string
  createdAt: string
  updatedAt: string
}

export interface Session {
  userId: string
  role: Role
  name: string
  email: string
  login: string
}

export interface SystemSettings {
  company: string
  defaultPrice: number
  cities: string[]
  destinations: string[]
}

export const ROLE_LABEL: Record<Role, string> = {
  admin: 'Админ',
  manager: 'Агент',
  client: 'Клиент',
}

export const DEFAULT_SETTINGS: SystemSettings = {
  company: 'Vises',
  defaultPrice: 180,
  cities: ['Минск', 'Москва'],
  destinations: ['Испания', 'Кипр', 'Франция', 'Италия'],
}

export function homePath(role: Role) {
  if (role === 'admin') return '/owner'
  if (role === 'manager') return '/admin'
  return '/app'
}

export function staffBase(role?: Role | null) {
  return role === 'admin' ? '/owner' : '/admin'
}

export function genPassword() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  const pick = (n: number) =>
    Array.from({ length: n }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return `${pick(4)}-${pick(4)}-${pick(4)}`
}

export function genLogin(name: string, email: string) {
  const fromEmail = email.trim().toLowerCase()
  if (fromEmail) return fromEmail
  const ascii = name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9.]/g, '')
  return ascii || `user-${uid().slice(-6)}`
}

export function invitePath(token: string) {
  return `/invite/${token}`
}

export function appBase() {
  return String(import.meta.env.BASE_URL || '/').replace(/\/$/, '')
}

export function publicUrl(path: string) {
  const base = appBase()
  const clean = path.startsWith('/') ? path : `/${path}`
  return `${window.location.origin}${base}${clean}`
}

export const STATUSES: { id: Status; label: string; hint: string }[] = [
  { id: 'new', label: 'Новая', hint: 'Заявка только создана' },
  { id: 'docs', label: 'Документы', hint: 'Ждём файлы от клиента' },
  { id: 'review', label: 'На рассмотрении', hint: 'Агент смотрит комплект / автозаполнение прошло успешно' },
  { id: 'ready', label: 'Готова', hint: 'Можно записывать на визит' },
  { id: 'booked', label: 'Визит назначен', hint: 'Дата и время известны' },
  { id: 'done', label: 'Завершена', hint: 'Клиент сходил в центр' },
  { id: 'fixes', label: 'Нужны правки', hint: 'Клиенту надо что-то исправить' },
  {
    id: 'autofill_ok',
    label: 'Автозаполнение успешно',
    hint: 'Ручной статус: автозаполнение прошло успешно',
  },
  {
    id: 'autofill_failed',
    label: 'Ошибка автозаполнения',
    hint: 'Ручной статус: при автозаполнении была ошибка',
  },
  {
    id: 'declined',
    label: 'Отклонено порталом',
    hint: 'Ручной статус: портал отклонил заявку',
  },
]

export const DOC_TYPES: { id: DocType; label: string; required: boolean }[] = [
  { id: 'selfie', label: 'Селфи без фильтров', required: true },
  { id: 'passport', label: 'Разворот паспорта', required: true },
  { id: 'visa_photo', label: 'Фото на визу', required: true },
  { id: 'insurance', label: 'Страховка', required: false },
  { id: 'video', label: 'Видео для визового центра', required: false },
  { id: 'other', label: 'Другое', required: false },
]

export function statusLabel(id: Status) {
  return STATUSES.find((s) => s.id === id)?.label ?? id
}

export function uid(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`
}

export function nowIso() {
  return new Date().toISOString()
}

export function formatDate(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso.includes('T') ? iso : `${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Portal autofill capture outcome (mirrors backend list DTO; not CRM Status). */
export type PortalAutofillCaptureStatus = 'captured' | 'capture_failed'

/** Staff list item from GET /apps/:applicationId/portal-autofill-runs (DEC-001). */
export interface PortalAutofillRunListItem {
  id: string
  applicationId: string
  applicantId: string
  createdAt: string
  captureStatus: PortalAutofillCaptureStatus
  reportOk: boolean
  errorNote: string | null
  screenshotAvailable: boolean
  /** Absolute API path when a PNG was captured; otherwise null */
  downloadPath: string | null
}

export interface PortalAutofillRunListResponse {
  runs: PortalAutofillRunListItem[]
}

/** Russian labels for portal run capture status (DEC-006). Do not use CRM StatusBadge. */
export function portalCaptureStatusLabel(status: PortalAutofillCaptureStatus) {
  if (status === 'captured') return 'Скриншот сохранён'
  if (status === 'capture_failed') return 'Скриншот не сохранён'
  return status
}

/** Russian labels for portal fill reportOk (DEC-006). */
export function portalReportOkLabel(reportOk: boolean) {
  return reportOk ? 'Заполнение: успешно' : 'Заполнение: с ошибками'
}

/** Minimal autofill report shape from POST …/portal-autofill (200/422/502 body). */
export interface AutofillReportSummary {
  ok: boolean
  applicationId: string
  applicantId: string
  summary?: {
    filled: number
    skipped: number
    failed: number
  }
  generatedAt?: string
  evidence?: {
    runId: string
    captureOk: boolean
    downloadPath?: string
    error?: string
  }
}

/** Result of store.runPortalAutofill (DEC-006): keep report body on 422/502. */
export interface PortalAutofillRunResult {
  httpStatus: number
  report?: AutofillReportSummary
  message?: string
}

/** CRM status after staff portal autofill settles (truthful, not random). */
export type PortalAutofillCrmOutcome = {
  status: Extract<Status, 'review' | 'declined'>
  note: string
}

/**
 * Map autofill result → CRM status.
 * Success only when fill report is ok and a screenshot was captured;
 * otherwise declined.
 */
export function resolveCrmStatusAfterPortalAutofill(
  result: PortalAutofillRunResult,
): PortalAutofillCrmOutcome {
  const fillOk = result.report?.ok === true
  const screenshotOk = result.report?.evidence?.captureOk === true
  if (fillOk && screenshotOk) {
    return {
      status: 'review',
      note: 'После автозаполнения: поля заполнены, скриншот сохранён — статус «На рассмотрении»',
    }
  }
  return {
    status: 'declined',
    note: 'После автозаполнения: ошибка или скриншот не сохранён — статус «Отклонено»',
  }
}

const PORTAL_AUTOFILL_REQUIRED_FIELDS: (keyof Applicant)[] = [
  'firstName',
  'lastName',
  'lastNameAtBirth',
  'dob',
  'countryOfBirth',
  'passportNumber',
  'passportIssued',
  'passportExpires',
  'passportType',
  'passportIssuedBy',
]

/** Digits-only phone length required by portal mapper (REQ-002). */
export function portalAutofillPhoneDigits(phone: string | undefined): string {
  return (phone ?? '').replace(/\D/g, '')
}

/**
 * Client-side completeness gate for staff portal autofill trigger (REQ-002 / DEC-005).
 * Does not use requiredDocsOk or CRM status.
 */
export function isPortalAutofillApplicantReady(
  applicant: Applicant | undefined | null,
  clientEmail: string | undefined | null,
): boolean {
  if (!applicant) return false
  for (const key of PORTAL_AUTOFILL_REQUIRED_FIELDS) {
    const raw = applicant[key]
    if (typeof raw !== 'string' || !raw.trim()) return false
  }
  if (portalAutofillPhoneDigits(applicant.phone).length !== 9) return false
  const email = (applicant.email ?? '').trim() || (clientEmail ?? '').trim()
  return Boolean(email)
}

export function money(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽'
}

export function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
}

export function requiredDocsOk(app: Application) {
  const have = new Set(app.documents.map((d) => d.type))
  return DOC_TYPES.filter((d) => d.required).every((d) => have.has(d.id))
}

export function progress(app: Application) {
  const order: Status[] = ['new', 'docs', 'review', 'ready', 'booked', 'done']
  if (app.status === 'fixes') return 40
  const i = order.indexOf(app.status)
  return Math.round(((i + 1) / order.length) * 100)
}

export function emptyApplicant(relationship = 'Self'): Applicant {
  return {
    id: uid('p'),
    relationship,
    firstName: '',
    lastName: '',
    lastNameAtBirth: '',
    otherNames: '',
    dob: '',
    placeOfBirth: '',
    countryOfBirth: 'BELARUS',
    nationality: 'BELARUS',
    nationalityAtBirth: 'BELARUS',
    gender: 'female',
    maritalStatus: 'Single',
    nationalId: '',
    passportType: 'Ordinary passport',
    passportNumber: '',
    passportIssued: '',
    passportExpires: '',
    passportIssuedBy: '',
    email: '',
    phone: '',
    address: '',
    purpose: 'Tourism',
    firstEntry: 'Spain',
    entries: 'Multientry',
    durationDays: '90',
  }
}

export function emptyApplication(email: string): Application {
  return {
    id: uid('app'),
    code: `VS-${Math.floor(2400 + Math.random() * 500)}`,
    clientEmail: email,
    status: 'new',
    destination: 'Испания',
    visaType: 'Туристическая',
    category: 'Normal',
    submitCountry: 'Belarus',
    submitCity: 'Minsk',
    submitFrom: '',
    submitTo: '',
    travelDate: '',
    returnDate: '',
    paused: false,
    transfer: false,
    comment: '',
    applicants: [emptyApplicant()],
    documents: [],
    paymentAmount: 180,
    paymentPaid: false,
    paymentNote: '',
    visitDate: '',
    visitTime: '',
    visitPlace: '',
    manager: 'Мария',
    timeline: [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}
