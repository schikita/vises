import { ChevronLeft, ChevronRight } from 'lucide-react'
import { staffListPageCount } from '@/shared/lib'

type ListPagerProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export const ListPager = ({ page, pageSize, total, onPageChange }: ListPagerProps) => {
  if (total <= pageSize) return null

  const pageCount = staffListPageCount(total, pageSize)
  const safePage = Math.min(Math.max(1, page), pageCount)
  const rangeStart = total === 0 ? 0 : (safePage - 1) * pageSize + 1
  const rangeEnd = Math.min(safePage * pageSize, total)

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        Страница {safePage} из {pageCount}
        {total > 0 ? ` · показано ${rangeStart}–${rangeEnd}` : null}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
          disabled={safePage <= 1}
          onClick={() => onPageChange(safePage - 1)}
        >
          <ChevronLeft size={16} />
          Назад
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-xl border border-line bg-white px-3 py-2 text-sm font-semibold disabled:opacity-40"
          disabled={safePage >= pageCount}
          onClick={() => onPageChange(safePage + 1)}
        >
          Вперёд
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
