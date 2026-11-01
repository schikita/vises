import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { ClientListTable } from '@/entities/client'
import { Btn, Dialog, Empty } from '@/shared/ui'
import type { ClientsRenderProps } from './types'

export const ClientsRender = ({
  items,
  loading,
  listError,
  notice,
  detailBasePath,
  canCreate,
  createOpen,
  createForm,
  onOpenCreate,
  onCloseCreate,
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
            detailBasePath={detailBasePath}
            emptyTitle={t('clients.list.emptyTitle')}
            emptyText={
              canCreate
                ? t('clients.list.emptyTextAgent')
                : t('clients.list.emptyTextStaff')
            }
          />
        </div>
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
