export type ListPagerProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}
