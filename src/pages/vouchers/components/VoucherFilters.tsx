import type { FormEvent } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { SegmentedControl } from '../../../components/ui'
import type { PromotionFilter, PromotionVisibilityFilter } from '../../../services'
import { promotionFilterOptions, promotionVisibilityFilterOptions } from '../../../utils'

interface VoucherFiltersProps {
  searchInput: string
  status: PromotionFilter
  visibility: PromotionVisibilityFilter
  onSearchInputChange: (value: string) => void
  onSubmitSearch: () => void
  onStatusChange: (status: PromotionFilter) => void
  onVisibilityChange: (visibility: PromotionVisibilityFilter) => void
}

export const VoucherFilters = ({
  searchInput,
  status,
  visibility,
  onSearchInputChange,
  onSubmitSearch,
  onStatusChange,
  onVisibilityChange,
}: VoucherFiltersProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmitSearch()
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <form className="relative flex-1" onSubmit={handleSubmit}>
        <AiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted" />
        <input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Tìm tên, mã hoặc mô tả voucher"
          className="h-11 w-full rounded-admin border border-berry/15 bg-cream pl-11 pr-4 text-sm font-bold text-ink outline-none transition focus:border-berry"
        />
      </form>
      <div className="flex flex-col gap-3 overflow-x-auto pb-1 2xl:flex-row 2xl:justify-end">
        <SegmentedControl value={status} options={promotionFilterOptions} onValueChange={onStatusChange} />
        <SegmentedControl
          value={visibility}
          options={promotionVisibilityFilterOptions}
          onValueChange={onVisibilityChange}
        />
      </div>
    </div>
  )
}
