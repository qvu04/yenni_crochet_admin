import type { FormEvent } from 'react'
import { AiOutlineSearch } from 'react-icons/ai'
import { SegmentedControl } from '../../../components/ui'
import type { CampaignStatusFilter, CampaignTypeFilter } from '../../../services'
import { campaignStatusOptions, campaignTypeFilterOptions } from '../../../utils'

interface CampaignFiltersProps {
  searchInput: string
  status: CampaignStatusFilter
  type: CampaignTypeFilter
  onSearchInputChange: (value: string) => void
  onSubmitSearch: () => void
  onStatusChange: (status: CampaignStatusFilter) => void
  onTypeChange: (type: CampaignTypeFilter) => void
}

export const CampaignFilters = ({
  searchInput,
  status,
  type,
  onSearchInputChange,
  onSubmitSearch,
  onStatusChange,
  onTypeChange,
}: CampaignFiltersProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmitSearch()
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <form className="relative" onSubmit={handleSubmit}>
        <AiOutlineSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-muted" />
        <input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder="Tìm tên, tiêu đề phụ hoặc mô tả campaign"
          className="h-11 w-full rounded-admin border border-berry/15 bg-cream pl-11 pr-4 text-sm font-bold text-ink outline-none transition focus:border-berry"
        />
      </form>
      <div className="flex flex-col gap-3 overflow-x-auto pb-1 2xl:flex-row 2xl:justify-end">
        <SegmentedControl value={status} options={campaignStatusOptions} onValueChange={onStatusChange} />
        <SegmentedControl value={type} options={campaignTypeFilterOptions} onValueChange={onTypeChange} />
      </div>
    </div>
  )
}
