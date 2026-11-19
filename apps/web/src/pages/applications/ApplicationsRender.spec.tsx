import { beforeEach, describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { i18n } from '@/shared/i18n'
import { cleanup, render, screen } from '@/shared/testing'
import type { ApplicationsListRow } from './types'
import { ApplicationsRender } from './ApplicationsRender'

const placeholderRow: ApplicationsListRow = {
  id: 'app-1',
  code: 'VS-10027',
  status: 'draft',
  applicationStatus: 'draft',
  category: 'Деловая',
  visaType: 'Деловая',
  submitCity: 'Минск',
  travelDate: '2027-12-25',
  clientId: null,
  clientName: 'Без имени',
}

const renderList = (loading: boolean): void => {
  render(
    <MemoryRouter>
      <ApplicationsRender
        filteredCount={478}
        pageItems={[placeholderRow]}
        cities={['Минск']}
        q=""
        status="all"
        city="all"
        page={1}
        pageSize={20}
        sort={{ key: 'travelDate', dir: 'desc' }}
        loading={loading}
        error=""
        notice=""
        appsBase="/admin/apps"
        clientsBase="/admin/clients"
        createCtaTo={null}
        createCtaLabel=""
        onQueryChange={(): void => undefined}
        onStatusChange={(): void => undefined}
        onCityChange={(): void => undefined}
        onPageChange={(): void => undefined}
        onSortChange={(): void => undefined}
      />
    </MemoryRouter>,
  )
}

describe('ApplicationsRender loading', (): void => {
  beforeEach((): void => {
    cleanup()
  })

  it('shows the loading state instead of placeholder rows while data is in flight', (): void => {
    renderList(true)

    expect(
      screen.getByText(i18n.t('applications.list.loadingText')),
    ).toBeInTheDocument()
    expect(screen.queryByText('VS-10027')).not.toBeInTheDocument()
    expect(screen.queryByText('Без имени')).not.toBeInTheDocument()
    expect(screen.queryByText(/1–20 \/ 478/)).not.toBeInTheDocument()
  })

  it('shows the table once loading has finished', (): void => {
    renderList(false)

    expect(
      screen.queryByText(i18n.t('applications.list.loadingText')),
    ).not.toBeInTheDocument()
    expect(screen.getByText('VS-10027')).toBeInTheDocument()
    expect(screen.getByText(/1–20 \/ 478/)).toBeInTheDocument()
  })
})
