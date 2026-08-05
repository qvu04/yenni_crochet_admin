import type { FormEvent } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { SegmentedControl } from '../../../components/ui'
import type { CustomerFilter } from '../../../services'
import { customerFilterOptions } from '../../../utils'

interface CustomerFiltersProps {
  searchInput: string
  type: CustomerFilter
  onSearchInputChange: (value: string) => void
  onSubmitSearch: () => void
  onTypeChange: (type: CustomerFilter) => void
}

export const CustomerFilters = ({
  searchInput,
  type,
  onSearchInputChange,
  onSubmitSearch,
  onTypeChange,
}: CustomerFiltersProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmitSearch()
  }

  return (
    <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[700px] xl:flex-row xl:items-center xl:justify-end">
      <form className="relative flex-1" onSubmit={handleSubmit}>
        <AiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted" />
        <input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Tìm tên, SĐT hoặc Zalo ID"
          className="h-11 w-full rounded-admin border border-berry/15 bg-cream pl-11 pr-4 text-sm font-bold text-ink outline-none transition focus:border-berry"
        />
      </form>
      <div className="overflow-x-auto pb-1">
        <SegmentedControl value={type} options={customerFilterOptions} onValueChange={onTypeChange} />
      </div>
    </div>
  )
}
