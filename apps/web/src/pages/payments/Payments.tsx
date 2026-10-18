import { useEffect, useState } from 'react'
import { useStore } from '@/app/providers'
import type { Application } from '@/entities/application'
import { fetchPaymentsPage, money } from '@/entities/application'
import { staffBase } from '@/entities/session'
import { STAFF_LIST_PAGE_SIZE, staffListPageCount } from '@/shared/lib'
import { PaymentsRender } from './PaymentsRender'

export const Payments = () => {
  const { session } = useStore()
  const [page, setPage] = useState(1)
  const [pageItems, setPageItems] = useState<Application[]>([])
  const [total, setTotal] = useState(0)
  const [paidLabel, setPaidLabel] = useState(money(0))
  const [unpaidLabel, setUnpaidLabel] = useState(money(0))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    void fetchPaymentsPage({ page, pageSize: STAFF_LIST_PAGE_SIZE })
      .then((data) => {
        if (cancelled) return
        setPageItems(data.items)
        setTotal(data.total)
        setPaidLabel(money(data.summary.paidTotal))
        setUnpaidLabel(money(data.summary.unpaidTotal))
        const pageCount = staffListPageCount(data.total, data.pageSize)
        if (page > pageCount) setPage(pageCount)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setPageItems([])
        setTotal(0)
        setPaidLabel(money(0))
        setUnpaidLabel(money(0))
        setError(err instanceof Error ? err.message : 'Не удалось загрузить платежи')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [page])

  return (
    <PaymentsRender
      apps={pageItems}
      total={total}
      page={page}
      pageSize={STAFF_LIST_PAGE_SIZE}
      paidLabel={paidLabel}
      unpaidLabel={unpaidLabel}
      loading={loading}
      error={error}
      appsBase={`${staffBase(session?.role)}/apps`}
      onPageChange={setPage}
    />
  )
}
