import { useMemo, useState } from 'react'
import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ActionNotice, Badge, Button } from '../../../components/ui'
import { useGrantPromotionMutation, usePromotionsQuery } from '../../../queries'
import type { Customer, CustomerPromotion } from '../../../services'
import { formatPromotionDiscount, getPromotionStatus } from '../../../utils'

interface GrantVoucherDialogProps {
  customer: Customer
  onClose: () => void
  onGranted: (customer: Customer, userPromotion: CustomerPromotion) => void
}

export const GrantVoucherDialog = ({ customer, onClose, onGranted }: GrantVoucherDialogProps) => {
  const [selectedPromotionId, setSelectedPromotionId] = useState('')
  const promotionsQuery = usePromotionsQuery({ status: 'current', visibility: 'private' })
  const grantPromotionMutation = useGrantPromotionMutation()
  const grantedPromotionIds = useMemo(
    () => new Set(customer.user_promotions.map((userPromotion) => userPromotion.promotion_id)),
    [customer.user_promotions],
  )
  const promotions = promotionsQuery.data ?? []
  const canSubmit = Boolean(customer.zalo_user_id && selectedPromotionId)

  const handleGrantVoucher = () => {
    if (!customer.zalo_user_id || !selectedPromotionId) return

    grantPromotionMutation.mutate(
      {
        promotionId: selectedPromotionId,
        zaloUserId: customer.zalo_user_id,
      },
      {
        onSuccess: (userPromotion) => {
          onGranted(customer, userPromotion)
          onClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
      <div className="mx-auto max-w-3xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Cấp voucher</p>
            <h3 className="mt-1 text-xl font-black text-ink">{customer.display_name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-admin text-xl text-muted transition hover:bg-cream hover:text-ink"
            aria-label="Đóng cấp voucher"
          >
            <AiOutlineClose />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {!customer.zalo_user_id ? (
            <ActionNotice
              tone="warning"
              title="Chưa thể cấp voucher"
              description="Khách này chưa có Zalo user id nên admin chưa thể gắn voucher cá nhân."
            />
          ) : null}

          {promotionsQuery.isLoading ? (
            <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-12 text-sm font-bold text-muted">
              <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
              Đang tải voucher...
            </div>
          ) : promotions.length ? (
            <div className="grid gap-3">
              {promotions.map((promotion) => {
                const isGranted = grantedPromotionIds.has(promotion.id)
                const status = getPromotionStatus(promotion)

                return (
                  <label
                    key={promotion.id}
                    className={[
                      'flex cursor-pointer gap-3 rounded-admin border p-3 transition',
                      selectedPromotionId === promotion.id ? 'border-berry bg-blush/45' : 'border-berry/10 bg-cream',
                      isGranted ? 'cursor-not-allowed opacity-60' : 'hover:border-berry/30',
                    ].join(' ')}
                  >
                    <input
                      type="radio"
                      name="promotion"
                      className="mt-1 h-4 w-4 accent-berry"
                      value={promotion.id}
                      checked={selectedPromotionId === promotion.id}
                      disabled={isGranted}
                      onChange={() => setSelectedPromotionId(promotion.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-black text-ink">{promotion.title}</p>
                        <Badge tone={status.tone}>{status.label}</Badge>
                        {isGranted ? <Badge tone="success">Đã cấp</Badge> : null}
                      </div>
                      <p className="mt-1 text-xs font-black text-cocoa">{promotion.code}</p>
                      <p className="mt-2 text-sm font-bold text-muted">{formatPromotionDiscount(promotion)}</p>
                    </div>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-10 text-center text-sm font-bold text-muted">
              Chưa có voucher riêng tư đang chạy để cấp cho khách.
            </div>
          )}

          {grantPromotionMutation.error ? (
            <ActionNotice
              tone="danger"
              title="Không cấp được voucher"
              description={grantPromotionMutation.error.message}
            />
          ) : null}

          <div className="flex justify-end gap-2 border-t border-berry/10 pt-4">
            <Button variant="ghost" onClick={onClose} disabled={grantPromotionMutation.isPending}>
              Hủy
            </Button>
            <Button disabled={!canSubmit || grantPromotionMutation.isPending} onClick={handleGrantVoucher}>
              {grantPromotionMutation.isPending ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
              Cấp voucher
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
