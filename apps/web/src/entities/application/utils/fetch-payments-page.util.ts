import { apiRequest } from '@/shared/api'
import { buildStaffListQuery } from '@/shared/lib'
import type { FetchPaymentsPageParams } from '../types/fetch-payments-page-params.types'
import type { PaymentsPaginatedList } from '../types/payments-paginated-list.types'

/** Staff paged GET /payments (+ full-set summary). */
export const fetchPaymentsPage = (
  params: FetchPaymentsPageParams,
): Promise<PaymentsPaginatedList> =>
  apiRequest<PaymentsPaginatedList>(
    `/payments${buildStaffListQuery({
      page: params.page,
      pageSize: params.pageSize,
    })}`,
  )
