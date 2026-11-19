import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import type { AppUpsertWrite, UpsertAppResult } from '@/entities/application'
import { cleanup, render, screen, waitFor } from '@/shared/testing'
import { APPLICATION_CREATE_WRITE } from '@/features/application-create'
import { ApplicationCreatePage } from './ApplicationCreatePage'

const upsertMock = vi.fn<(app: AppUpsertWrite) => Promise<UpsertAppResult>>()

vi.mock('@/widgets/app-store', (): Record<string, unknown> => ({
  useStore: (): { upsert: typeof upsertMock } => ({
    upsert: upsertMock,
  }),
}))

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

const renderCreatePage = (): void => {
  render(
    <MemoryRouter initialEntries={['/admin/apps/new']}>
      <Routes>
        <Route path="/admin/apps/new" element={<ApplicationCreatePage />} />
        <Route
          path="/admin/clients/:clientId/portal-form"
          element={<div>Portal form route</div>}
        />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ApplicationCreatePage', (): void => {
  beforeEach((): void => {
    upsertMock.mockReset()
  })

  afterEach((): void => {
    cleanup()
  })

  it('creates a blank application and opens the portal form', async (): Promise<void> => {
    upsertMock.mockResolvedValue(mockUpsertResult())

    renderCreatePage()

    await waitFor((): void => {
      expect(screen.getByText('Portal form route')).toBeInTheDocument()
    })
    expect(upsertMock).toHaveBeenCalledTimes(1)
    expect(upsertMock).toHaveBeenCalledWith(APPLICATION_CREATE_WRITE)
    expect(upsertMock.mock.calls.at(0)?.at(0)).not.toHaveProperty('clientEmail')
    expect(upsertMock.mock.calls.at(0)?.at(0)).not.toHaveProperty('id')
  })

  it('stays on the create page when the application has no client id', async (): Promise<void> => {
    upsertMock.mockResolvedValue(mockUpsertResult({ clientId: undefined }))

    renderCreatePage()

    expect(
      await screen.findByRole('alert'),
    ).toHaveTextContent(/could not open the portal form|не удалось открыть анкету/i)
    expect(screen.queryByText('Portal form route')).toBeNull()
  })
})
