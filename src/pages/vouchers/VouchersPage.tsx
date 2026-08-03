import { useEffect, useMemo, useState } from 'react'
import { AiOutlinePlus } from 'react-icons/ai'
import { useSearchParams } from 'react-router-dom'
import { ActionNotice, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui'
import { usePromotionActiveMutation, usePromotionsQuery } from '../../queries'
import type { Promotion, PromotionFilter } from '../../services'
import {
  formatPromotionDiscount,
  getPromotionClaimedCount,
  getPromotionStatus,
  getPromotionUsedCount,
  normalizePromotionFilter,
} from '../../utils'
import { VoucherFilters, VoucherFormDialog, VoucherMetric, VouchersTable } from './components'

const SAVE_FEEDBACK_DURATION_MS = 4500

interface SavedPromotionNotice {
  id: string
  title: string
  action: 'created' | 'updated'
  isVisibleInCurrentView: boolean
}

export const VouchersPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = normalizePromotionFilter(searchParams.get('status'))
  const search = searchParams.get('q') ?? ''
  const [searchInput, setSearchInput] = useState(search)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [savedNotice, setSavedNotice] = useState<SavedPromotionNotice | null>(null)
  const promotionsQuery = usePromotionsQuery({ search, status })
  const activeMutation = usePromotionActiveMutation()

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const promotions = useMemo(() => promotionsQuery.data ?? [], [promotionsQuery.data])
  const currentPromotions = useMemo(
    () => promotions.filter((promotion) => getPromotionStatus(promotion).label === 'Đang chạy'),
    [promotions],
  )
  const totalClaimed = useMemo(
    () => promotions.reduce((total, promotion) => total + getPromotionClaimedCount(promotion), 0),
    [promotions],
  )
  const totalUsed = useMemo(
    () => promotions.reduce((total, promotion) => total + getPromotionUsedCount(promotion), 0),
    [promotions],
  )
  const visiblePromotionIds = useMemo(() => new Set(promotions.map((promotion) => promotion.id)), [promotions])

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

    const nextVisibility = visiblePromotionIds.has(savedNotice.id)
    if (savedNotice.isVisibleInCurrentView !== nextVisibility) {
      setSavedNotice((currentNotice) =>
        currentNotice ? { ...currentNotice, isVisibleInCurrentView: nextVisibility } : currentNotice,
      )
    }
  }, [savedNotice, visiblePromotionIds])

  const updateFilters = (nextValues: { q?: string; status?: PromotionFilter }) => {
    const nextParams = new URLSearchParams(searchParams)
    const nextSearch = nextValues.q ?? search
    const nextStatus = nextValues.status ?? status

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

    setSearchParams(nextParams)
  }

  const openCreateForm = () => {
    setEditingPromotion(null)
    setIsFormOpen(true)
  }

  const openEditForm = (promotion: Promotion) => {
    setEditingPromotion(promotion)
    setIsFormOpen(true)
  }

  const handlePromotionSaved = (promotion: Promotion, action: 'created' | 'updated') => {
    setSavedNotice({
      id: promotion.id,
      title: promotion.title,
      action,
      isVisibleInCurrentView: visiblePromotionIds.has(promotion.id),
    })
  }

  const scrollToSavedPromotion = () => {
    if (!savedNotice) return

    document
      .querySelector(`[data-voucher-row-id="${savedNotice.id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Ưu đãi</p>
          <h2 className="mt-2 text-3xl font-black text-ink">Quản lý voucher</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Tạo mã giảm giá, kiểm soát thời gian áp dụng, giới hạn lượt dùng và theo dõi ví voucher của khách.
          </p>
        </div>
        <Button variant="secondary" onClick={openCreateForm}>
          <AiOutlinePlus className="text-xl" />
          Tạo voucher
        </Button>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <VoucherMetric label="Tổng voucher" value={promotions.length} />
        <VoucherMetric label="Đang chạy" value={currentPromotions.length} />
        <VoucherMetric label="Lượt đổi" value={totalClaimed} />
        <VoucherMetric label="Lượt dùng" value={totalUsed} />
      </section>

      {savedNotice ? (
        <ActionNotice
          tone="success"
          title={`${savedNotice.action === 'created' ? 'Đã tạo voucher' : 'Đã cập nhật voucher'} “${savedNotice.title}”`}
          description={
            savedNotice.isVisibleInCurrentView
              ? `Voucher đã lưu và đang được đánh dấu trong danh sách. ${formatPromotionDiscount(promotions.find((item) => item.id === savedNotice.id) ?? { discount_type: 'fixed', discount_value: 0, max_discount_value: null })}`
              : 'Voucher đã lưu thành công nhưng không nằm trong bộ lọc hiện tại.'
          }
          primaryAction={
            savedNotice.isVisibleInCurrentView
              ? {
                  label: 'Xem trong danh sách',
                  onClick: scrollToSavedPromotion,
                }
              : undefined
          }
          onDismiss={() => setSavedNotice(null)}
        />
      ) : null}

      <Card>
        <CardHeader className="flex-col gap-4 xl:flex-row">
          <div>
            <CardTitle>Danh sách voucher</CardTitle>
            <CardDescription>Tìm kiếm theo tên, mã voucher và lọc theo trạng thái vận hành.</CardDescription>
          </div>
          <VoucherFilters
            searchInput={searchInput}
            status={status}
            onSearchInputChange={setSearchInput}
            onSubmitSearch={() => updateFilters({ q: searchInput })}
            onStatusChange={(value) => updateFilters({ status: value })}
          />
        </CardHeader>
        <CardContent>
          <VouchersTable
            promotions={promotions}
            isLoading={promotionsQuery.isLoading}
            isError={promotionsQuery.isError}
            isTogglingActive={activeMutation.isPending}
            highlightedPromotionId={savedNotice?.isVisibleInCurrentView ? savedNotice.id : null}
            onRetry={() => void promotionsQuery.refetch()}
            onEdit={openEditForm}
            onToggleActive={(promotion) =>
              activeMutation.mutate({ promotionId: promotion.id, isActive: !promotion.is_active })
            }
          />
        </CardContent>
      </Card>

      {isFormOpen ? (
        <VoucherFormDialog
          promotion={editingPromotion}
          onClose={() => setIsFormOpen(false)}
          onSaved={handlePromotionSaved}
        />
      ) : null}
    </div>
  )
}
