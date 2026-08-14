import { useEffect, useMemo, useState } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { useSearchParams } from 'react-router-dom'
import { ActionNotice, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, getPaginatedItems, TablePagination } from '../../components/ui'
import { useCampaignActiveMutation, useCampaignsQuery } from '../../queries'
import type { Campaign, CampaignStatusFilter, CampaignTypeFilter } from '../../services'
import { getCampaignProducts, getCampaignStatus, normalizeCampaignStatus, normalizeCampaignType } from '../../utils'
import { CampaignFilters, CampaignFormDialog, CampaignMetric, CampaignsTable } from './components'

const SAVE_FEEDBACK_DURATION_MS = 4500

interface SavedCampaignNotice {
  id: string
  name: string
  action: 'created' | 'updated'
  isVisibleInCurrentView: boolean
}

export const CampaignsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = normalizeCampaignStatus(searchParams.get('status'))
  const type = normalizeCampaignType(searchParams.get('type'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [savedNotice, setSavedNotice] = useState<SavedCampaignNotice | null>(null)
  const campaignsQuery = useCampaignsQuery({ search, status, type })
  const activeMutation = useCampaignActiveMutation()

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const campaigns = useMemo(() => campaignsQuery.data ?? [], [campaignsQuery.data])
  const { items: paginatedCampaigns } = getPaginatedItems(campaigns, currentPage, pageSize)
  const currentCampaigns = useMemo(
    () => campaigns.filter((campaign) => getCampaignStatus(campaign).label === 'Đang diễn ra'),
    [campaigns],
  )
  const activeCampaigns = useMemo(() => campaigns.filter((campaign) => campaign.is_active), [campaigns])
  const totalLinkedProducts = useMemo(
    () => campaigns.reduce((total, campaign) => total + getCampaignProducts(campaign).length, 0),
    [campaigns],
  )
  const visibleCampaignIds = useMemo(() => new Set(campaigns.map((campaign) => campaign.id)), [campaigns])

  useEffect(() => {
    if (!savedNotice) return

    const timeoutId = window.setTimeout(() => {
      setSavedNotice(null)
    }, SAVE_FEEDBACK_DURATION_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [savedNotice])

  useEffect(() => {
    if (!savedNotice) return

    const nextVisibility = visibleCampaignIds.has(savedNotice.id)
    if (savedNotice.isVisibleInCurrentView !== nextVisibility) {
      setSavedNotice((currentNotice) =>
        currentNotice ? { ...currentNotice, isVisibleInCurrentView: nextVisibility } : currentNotice,
      )
    }
  }, [savedNotice, visibleCampaignIds])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, status, type, pageSize])

  const updateFilters = (nextValues: { q?: string; status?: CampaignStatusFilter; type?: CampaignTypeFilter }) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextSearch = nextValues.q ?? search
    const nextStatus = nextValues.status ?? status
    const nextType = nextValues.type ?? type

    if (nextSearch.trim()) {
      nextParams.set('q', nextSearch.trim())
    } else {
      nextParams.delete('q')
    }

    if (nextStatus !== 'all') {
      nextParams.set('status', nextStatus)
    } else {
      nextParams.delete('status')
    }

    if (nextType !== 'all') {
      nextParams.set('type', nextType)
    } else {
      nextParams.delete('type')
    }

    setSearchParams(nextParams)
  }

  const openCreateForm = () => {
    setEditingCampaign(null)
    setIsFormOpen(true)
  }

  const openEditForm = (campaign: Campaign) => {
    setEditingCampaign(campaign)
    setIsFormOpen(true)
  }

  const handleCampaignSaved = (campaign: Campaign, action: 'created' | 'updated') => {
    setSavedNotice({
      id: campaign.id,
      name: campaign.name,
      action,
      isVisibleInCurrentView: visibleCampaignIds.has(campaign.id),
    })
  }

  const scrollToSavedCampaign = () => {
    if (!savedNotice) return

    document
      .querySelector(`[data-campaign-row-id="${savedNotice.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Campaign</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Quản lý campaign</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Điều phối banner trên trang chủ, nội dung sự kiện và danh sách sản phẩm được gắn vào từng campaign.
          </p>
        </div>
        <Button variant="secondary" onClick={openCreateForm}>
          <AiOutlinePlus className="text-xl" />
          Tạo campaign
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <CampaignMetric label="Tổng campaign" value={campaigns.length} />
        <CampaignMetric label="Đang bật" value={activeCampaigns.length} />
        <CampaignMetric label="Đang diễn ra" value={currentCampaigns.length} />
        <CampaignMetric label="Sản phẩm gắn" value={totalLinkedProducts} />
      </section>

      {savedNotice ? (
        <ActionNotice
          tone="success"
          title={`${savedNotice.action === 'created' ? 'Đã tạo campaign' : 'Đã cập nhật campaign'} “${savedNotice.name}”`}
          description={
            savedNotice.isVisibleInCurrentView
              ? 'Campaign đã được đánh dấu trong danh sách bên dưới.'
              : 'Campaign đã lưu thành công nhưng không nằm trong bộ lọc hiện tại.'
          }
          primaryAction={
            savedNotice.isVisibleInCurrentView
              ? {
                  label: 'Xem trong danh sách',
                  onClick: scrollToSavedCampaign,
                }
              : undefined
          }
          onDismiss={() => setSavedNotice(null)}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 xl:flex-row">
          <div>
            <CardTitle>Danh sách campaign</CardTitle>
            <CardDescription>Tìm kiếm, lọc trạng thái và phân loại campaign đang hiển thị trên mini app.</CardDescription>
          </div>
          <div className="w-full xl:max-w-4xl">
            <CampaignFilters
              searchInput={searchInput}
              status={status}
              type={type}
              onSearchInputChange={setSearchInput}
              onSubmitSearch={() => updateFilters({ q: searchInput })}
              onStatusChange={(value) => updateFilters({ status: value })}
              onTypeChange={(value) => updateFilters({ type: value })}
            />
          </div>
        </CardHeader>
        <CardContent>
          <CampaignsTable
            campaigns={paginatedCampaigns}
            isLoading={campaignsQuery.isLoading}
            isError={campaignsQuery.isError}
            isTogglingActive={activeMutation.isPending}
            highlightedCampaignId={savedNotice?.isVisibleInCurrentView ? savedNotice.id : null}
            onRetry={() => void campaignsQuery.refetch()}
            onEdit={openEditForm}
            onToggleActive={(campaign) =>
              activeMutation.mutate({ campaignId: campaign.id, isActive: !campaign.is_active })
            }
          />
          <TablePagination
            totalItems={campaigns.length}
            currentPage={currentPage}
            pageSize={pageSize}
            itemLabel="campaign"
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </CardContent>
      </Card>

      {isFormOpen ? (
        <CampaignFormDialog
          campaign={editingCampaign}
          onClose={() => setIsFormOpen(false)}
          onSaved={handleCampaignSaved}
        />
      ) : null}
    </div>
  )
}
