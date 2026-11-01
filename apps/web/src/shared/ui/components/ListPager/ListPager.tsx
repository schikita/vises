import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { staffListPageCount } from '@/shared/lib'
import { LIST_PAGER_BUTTON_CLASS } from './list-pager.constants'
import type { ListPagerProps } from './list-pager.types'

export const ListPager = (props: ListPagerProps): React.ReactElement | null => {
  const { page, pageSize, total, onPageChange } = props
  const { t } = useTranslation()

  if (total <= pageSize) {
    return null
  }

  const pageCount = staffListPageCount(total, pageSize)
  const safePage = Math.min(Math.max(1, page), pageCount)
  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, total)

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-text-secondary">
        {t('chrome.listPager.pageOf', { page: safePage, pageCount })}
        {total > 0
          ? t('chrome.listPager.shownRange', {
              start: rangeStart,
              end: rangeEnd,
            })
          : null}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={LIST_PAGER_BUTTON_CLASS}
          disabled={safePage <= 1}
          onClick={(): void => {
            onPageChange(safePage - 1)
          }}
        >
          <ChevronLeft size={16} />
          {t('chrome.listPager.previous')}
        </button>
        <button
          type="button"
          className={LIST_PAGER_BUTTON_CLASS}
          disabled={safePage >= pageCount}
          onClick={(): void => {
            onPageChange(safePage + 1)
          }}
        >
          {t('chrome.listPager.next')}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
