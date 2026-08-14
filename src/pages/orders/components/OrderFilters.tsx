import type { FormEvent } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { SegmentedControl } from '../../../components/ui'
import type { OrderStatusFilter } from '../../../services'
import { orderStatusOptions } from '../../../utils'

interface OrderFiltersProps {
  searchInput: string
  status: OrderStatusFilter
  onSearchInputChange: (value: string) => void
  onSubmitSearch: () => void
  onStatusChange: (status: OrderStatusFilter) => void
}

export const OrderFilters = ({
  searchInput,
  status,
  onSearchInputChange,
  onSubmitSearch,
  onStatusChange,
}: OrderFiltersProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmitSearch()
  }

  return (
    <div className="grid w-full gap-3 xl:grid-cols-[minmax(360px,1fr)_auto] xl:items-center">
      <form className="relative min-w-0" onSubmit={handleSubmit}>
        <AiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted" />
        <input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Tìm khách hàng, SĐT hoặc mã đơn đầy đủ"
          className="h-11 w-full rounded-admin border border-berry/15 bg-cream pl-11 pr-4 text-sm font-bold text-ink outline-none transition focus:border-berry"
        />
      </form>
      <div className="min-w-0 overflow-x-auto pb-1 xl:max-w-[720px]">
        <SegmentedControl value={status} options={orderStatusOptions} onValueChange={onStatusChange} />
      </div>
    </div>
  )
}
