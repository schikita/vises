import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ClientListTable } from '@/entities/client'
import { Btn, Dialog, Empty, ListPager } from '@/shared/ui'
import type { ClientsRenderProps } from './types'

export const ClientsRender = ({
  items,
  loading,
  listError,
  notice,
  total,
  page,
  pageSize,
  search,
  sortBy,
  sortDir,
  showAgentColumn,
  canCreate,
  createOpen,
  createForm,
  onOpenCreate,
  onCloseCreate,
  onSearchChange,
  onSortChange,
  onPageChange,
  onRowActivate,
}: ClientsRenderProps): React.ReactElement => {
  const { t } = useTranslation()

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
            {t('clients.list.title')}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t('clients.list.subtitle')}
            {total > 0 ? t('clients.list.totalSuffix', { total }) : null}
          </p>
        </div>
        {canCreate ? (
          <Btn type="button" onClick={onOpenCreate}>
            <Plus size={16} />
            {t('clients.create.open')}
          </Btn>
        ) : null}
      </div>

      {notice ? (
        <p className="mt-4 text-sm font-medium text-text-secondary" role="status">
          {notice}
        </p>
      ) : null}

      {listError ? (
        <p className="mt-4 text-sm font-medium text-danger" role="alert">
          {listError}
        </p>
      ) : null}

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="field"
          type="search"
          value={search}
          onChange={(event): void => onSearchChange(event.target.value)}
          placeholder={t('clients.list.searchPlaceholder')}
        />
      </div>

      {loading ? (
        <Empty
          title={t('clients.list.loadingTitle')}
          text={t('clients.list.loadingText')}
        />
      ) : null}

      {!loading && !listError ? (
        <div className="mt-5">
          <ClientListTable
            items={items}
            emptyTitle={t('clients.list.emptyTitle')}
            emptyText={
              canCreate
                ? t('clients.list.emptyTextAgent')
                : t('clients.list.emptyTextStaff')
            }
            showAgentColumn={showAgentColumn}
            sortBy={sortBy}
            sortDir={sortDir}
            onSortChange={onSortChange}
            onRowActivate={onRowActivate}
          />
        </div>
      ) : null}

      {!loading ? (
        <ListPager
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
        />
      ) : null}

      {canCreate ? (
        <Dialog
          open={createOpen}
          title={t('clients.create.title')}
          onClose={onCloseCreate}
        >
          {createForm}
        </Dialog>
      ) : null}
    </div>
  )
}
