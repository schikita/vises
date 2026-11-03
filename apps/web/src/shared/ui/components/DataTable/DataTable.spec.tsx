import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@/shared/testing'
import { DataTable } from './DataTable'

type SampleRow = {
  id: string
  name: string
}

describe('DataTable', (): void => {
  afterEach((): void => {
    cleanup()
  })

  it('renders centralized empty state when data is empty', (): void => {
    render(
      <DataTable<SampleRow>
        columns={[
          {
            id: 'name',
            header: 'Name',
            cell: (row): string => row.name,
          },
        ]}
        data={[]}
        emptyTitle="Nothing here"
        emptyText="Try another filter"
      />,
    )

    expect(screen.getByText('Nothing here')).toBeTruthy()
    expect(screen.getByText('Try another filter')).toBeTruthy()
    expect(screen.queryByRole('row', { name: /Alice/i })).toBeNull()
  })

  it('renders row cells via column cell renderers', (): void => {
    render(
      <DataTable<SampleRow>
        columns={[
          {
            id: 'name',
            header: 'Name',
            cell: (row): string => row.name,
          },
        ]}
        data={[{ id: '1', name: 'Alice' }]}
        getRowId={(row): string => row.id}
      />,
    )

    expect(screen.getByText('Alice')).toBeTruthy()
    expect(screen.getByText('Name')).toBeTruthy()
  })
})
