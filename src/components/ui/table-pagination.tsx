const PAGE_SIZE_OPTIONS = [10, 20, 50]

interface TablePaginationProps {
  totalItems: number
  currentPage: number
  pageSize: number
  itemLabel: string
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const getPaginatedItems = <T,>(items: T[], currentPage: number, pageSize: number) => {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = items.length ? (safeCurrentPage - 1) * pageSize : 0
  const endIndex = Math.min(startIndex + pageSize, items.length)

  return {
    totalPages,
    safeCurrentPage,
    startIndex,
    endIndex,
    items: items.slice(startIndex, endIndex),
  }
}

export const getVisiblePages = (currentPage: number, totalPages: number) => {
  const pages = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) pages.add(currentPage - 1)
  if (currentPage < totalPages) pages.add(currentPage + 1)

  return Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
}

export const TablePagination = ({
  totalItems,
  currentPage,
  pageSize,
  itemLabel,
  onPageChange,
  onPageSizeChange,
}: TablePaginationProps) => {
  if (!totalItems) return null

  const { totalPages, safeCurrentPage, startIndex, endIndex } = getPaginatedItems(
    Array.from({ length: totalItems }),
    currentPage,
    pageSize,
  )

  return (
    <div className="mt-4 flex flex-col gap-3 rounded-admin bg-cream px-4 py-3 text-sm font-bold text-cocoa md:flex-row md:items-center md:justify-between">
      <div>
        Hiển thị {startIndex + 1}-{endIndex} trong {totalItems} {itemLabel}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="h-9 rounded-admin border border-berry/15 bg-white px-3 text-xs font-black text-ink outline-none"
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}/trang
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
          disabled={safeCurrentPage === 1}
          className="h-9 rounded-admin bg-white px-3 text-xs font-black text-ink shadow-sm ring-1 ring-berry/10 disabled:pointer-events-none disabled:opacity-45"
        >
          Trước
        </button>
        {getVisiblePages(safeCurrentPage, totalPages).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`h-9 min-w-9 rounded-admin px-3 text-xs font-black shadow-sm ring-1 ring-berry/10 ${
              page === safeCurrentPage ? 'bg-ink text-white' : 'bg-white text-ink'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, safeCurrentPage + 1))}
          disabled={safeCurrentPage === totalPages}
          className="h-9 rounded-admin bg-white px-3 text-xs font-black text-ink shadow-sm ring-1 ring-berry/10 disabled:pointer-events-none disabled:opacity-45"
        >
          Sau
        </button>
      </div>
    </div>
  )
}
