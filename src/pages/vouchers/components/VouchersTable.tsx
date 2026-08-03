import {
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineGift,
  AiOutlineLoading3Quarters,
} from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { Promotion } from '../../../services'
import {
  formatDate,
  formatPromotionDiscount,
  getPromotionClaimedCount,
  getPromotionStatus,
  getPromotionUsedCount,
  promotionVisibilityLabels,
} from '../../../utils'

interface VouchersTableProps {
  promotions: Promotion[]
  isLoading: boolean
  isError: boolean
  isTogglingActive: boolean
  highlightedPromotionId?: string | null
  onRetry: () => void
  onEdit: (promotion: Promotion) => void
  onToggleActive: (promotion: Promotion) => void
}

export const VouchersTable = ({
  promotions,
  isLoading,
  isError,
  isTogglingActive,
  highlightedPromotionId,
  onRetry,
  onEdit,
  onToggleActive,
}: VouchersTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-14 text-sm font-bold text-muted">
        <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
        Đang tải voucher...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-admin border border-berry/20 bg-berry/10 p-5">
        <p className="font-black text-berry">Không tải được voucher</p>
        <p className="mt-1 text-sm text-muted">Kiểm tra quyền admin hoặc RLS của bảng promotions.</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Tải lại
        </Button>
      </div>
    )
  }

  if (!promotions.length) {
    return (
      <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-5 py-14 text-center">
        <AiOutlineGift className="mx-auto text-4xl text-berry" />
        <p className="mt-3 font-black text-ink">Chưa có voucher phù hợp</p>
        <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc hoặc tạo voucher mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-admin border border-berry/10">
      <table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Voucher</th>
            <th className="px-4 py-3">Phạm vi</th>
            <th className="px-4 py-3">Giảm giá</th>
            <th className="px-4 py-3">Điều kiện</th>
            <th className="px-4 py-3">Lượt nhận</th>
            <th className="px-4 py-3">Thời gian</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-berry/10 bg-white">
          {promotions.map((promotion) => {
            const status = getPromotionStatus(promotion)
            const usedCount = getPromotionUsedCount(promotion)
            const claimedCount = getPromotionClaimedCount(promotion)
            const visibility = promotion.visibility ?? 'private'

            return (
              <tr
                key={promotion.id}
                data-voucher-row-id={promotion.id}
                className={promotion.id === highlightedPromotionId ? 'bg-mint/60 transition-colors' : 'transition-colors'}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-20 shrink-0 items-center justify-center overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
                      {promotion.banner_url ? (
                        <img src={promotion.banner_url} alt={promotion.title} className="h-full w-full object-cover" />
                      ) : (
                        <AiOutlineGift className="text-2xl text-berry" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-black text-ink">{promotion.title}</p>
                        {promotion.id === highlightedPromotionId ? <Badge tone="success">Vừa lưu</Badge> : null}
                      </div>
                      <p className="mt-1 inline-flex rounded-full bg-cream px-2 py-1 text-xs font-black text-cocoa">
                        {promotion.code}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge tone={visibility === 'private' ? 'info' : 'warning'}>
                    {promotionVisibilityLabels[visibility]}
                  </Badge>
                </td>
                <td className="px-4 py-4 font-black text-ink">{formatPromotionDiscount(promotion)}</td>
                <td className="px-4 py-4 text-muted">
                  <p>{promotion.min_order_value ? `Đơn từ ${promotion.min_order_value.toLocaleString('vi-VN')}đ` : 'Không giới hạn tối thiểu'}</p>
                  <p className="mt-1 text-xs font-bold">
                    {promotion.max_order_value ? `Tối đa đơn ${promotion.max_order_value.toLocaleString('vi-VN')}đ` : 'Không giới hạn tối đa'}
                  </p>
                </td>
                <td className="px-4 py-4 text-muted">
                  <p className="font-black text-ink">
                    {claimedCount}/{promotion.usage_limit ?? '∞'}
                  </p>
                  <p className="mt-1 text-xs font-bold">{usedCount} đã dùng</p>
                </td>
                <td className="px-4 py-4 text-muted">
                  {formatDate(promotion.start_date)} - {formatDate(promotion.end_date)}
                </td>
                <td className="px-4 py-4">
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(promotion)}>
                      <AiOutlineEdit className="text-lg" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant={promotion.is_active ? 'danger' : 'secondary'}
                      disabled={isTogglingActive}
                      onClick={() => onToggleActive(promotion)}
                    >
                      {promotion.is_active ? <AiOutlineEyeInvisible className="text-lg" /> : <AiOutlineEye className="text-lg" />}
                      {promotion.is_active ? 'Tắt' : 'Bật'}
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
