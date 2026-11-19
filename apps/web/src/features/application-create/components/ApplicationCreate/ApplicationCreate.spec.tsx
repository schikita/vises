import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { AppUpsertWrite, UpsertAppResult } from '@/entities/application'
import { resolveApiErrorI18nKey } from '@/shared/api'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen, waitFor } from '@/shared/testing'
import { APPLICATION_CREATE_WRITE } from '../../constants'
import { ApplicationCreate } from './ApplicationCreate'

const featureRoot = join(dirname(fileURLToPath(import.meta.url)), '../..')

const mockUpsertResult = (overrides?: Partial<UpsertAppResult>): UpsertAppResult => {
  return {
    id: 'app-created',
    clientId: 'cli-created',
    code: 'VS-2500',
    clientEmail: '',
    portalFormEmail: null,
    status: 'draft',
    destination: '',
    visaType: '',
    submitCountry: '',
    submitCity: '',
    travelDate: '',
    returnDate: '',
    comment: '',
    applicants: [],
    documents: [],
    paymentAmount: 0,
    paymentPaid: false,
    paymentNote: '',
    visitDate: '',
    visitTime: '',
    visitPlace: '',
    manager: '',
    timeline: [],
    createdAt: '',
    updatedAt: '',
    ...overrides,
  }
}

describe('ApplicationCreate', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('creates a blank application and opens the portal form when a client id returns', async (): Promise<void> => {
    const result = mockUpsertResult()
    const upsert = vi.fn(
      async (_app: AppUpsertWrite): Promise<UpsertAppResult> => result,
    )
    const onCreated = vi.fn<(result: UpsertAppResult) => void>()

    render(<ApplicationCreate upsert={upsert} onCreated={onCreated} />)

    await waitFor((): void => {
      expect(onCreated).toHaveBeenCalledWith(result)
    })
    expect(upsert).toHaveBeenCalledTimes(1)
    expect(upsert).toHaveBeenCalledWith(APPLICATION_CREATE_WRITE)
    expect(upsert.mock.calls.at(0)?.at(0)).not.toHaveProperty('clientEmail')
    expect(upsert.mock.calls.at(0)?.at(0)).not.toHaveProperty('id')
    expect(screen.queryByLabelText(/client email|email клиента/i)).toBeNull()
  })

  it('shows an error when the created application has no client id', async (): Promise<void> => {
    const upsert = vi.fn(
      async (): Promise<UpsertAppResult> => mockUpsertResult({ clientId: '  ' }),
    )
    const onCreated = vi.fn<(result: UpsertAppResult) => void>()

    render(<ApplicationCreate upsert={upsert} onCreated={onCreated} />)

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/could not open the portal form|не удалось открыть анкету/i)
    expect(onCreated).not.toHaveBeenCalled()
  })

  it('surfaces operator-safe API error copy', async (): Promise<void> => {
    const upsert = vi.fn(async (): Promise<UpsertAppResult> => {
      throw { detail: 'insufficient_balance' }
    })
    const expected = i18n.t(
      resolveApiErrorI18nKey({ detail: 'insufficient_balance' }),
    )

    render(
      <ApplicationCreate
        upsert={upsert}
        onCreated={(): void => undefined}
      />,
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(expected)
  })

  it('does not import or call postClientCreate / POST /clients', (): void => {
    const sliceFiles = [
      'index.ts',
      'components/ApplicationCreate/ApplicationCreate.tsx',
      'components/ApplicationCreateIssuedAccess/ApplicationCreateIssuedAccess.tsx',
      'utils/start-application-create.util.ts',
      'utils/build-invite-url.util.ts',
      'utils/format-issued-access-clipboard.util.ts',
    ]

    for (const relative of sliceFiles) {
      const source = readFileSync(join(featureRoot, relative), 'utf8')
      expect(source).not.toMatch(/postClientCreate/)
      expect(source).not.toMatch(/\/clients['"`]/)
    }
  })

  it('does not console.log or telemetry password values', (): void => {
    const sliceFiles = [
      'components/ApplicationCreate/ApplicationCreate.tsx',
      'components/ApplicationCreateIssuedAccess/ApplicationCreateIssuedAccess.tsx',
      'utils/format-issued-access-clipboard.util.ts',
      'utils/build-invite-url.util.ts',
    ]

    for (const relative of sliceFiles) {
      const source = readFileSync(join(featureRoot, relative), 'utf8')
      expect(source).not.toMatch(/console\.(log|debug|info|warn|error)/)
      expect(source).not.toMatch(/telemetry/i)
      expect(source).not.toMatch(/analytics/i)
    }
  })
})
