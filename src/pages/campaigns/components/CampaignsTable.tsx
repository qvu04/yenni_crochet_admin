import {
  AiOutlineCalendar,
  AiOutlineEdit,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineLoading3Quarters,
  AiOutlinePicture,
} from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { Campaign } from '../../../services'
import { campaignTypeLabels, formatDate, getCampaignProducts, getCampaignStatus } from '../../../utils'

interface CampaignsTableProps {
  campaigns: Campaign[]
  isLoading: boolean
  isError: boolean
  isTogglingActive: boolean
  highlightedCampaignId?: string | null
  onRetry: () => void
  onEdit: (campaign: Campaign) => void
  onToggleActive: (campaign: Campaign) => void
}

export const CampaignsTable = ({
  campaigns,
  isLoading,
  isError,
  isTogglingActive,
  highlightedCampaignId,
  onRetry,
  onEdit,
  onToggleActive,
}: CampaignsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-14 text-sm font-bold text-muted">
        <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
        Đang tải campaign...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-admin border border-berry/20 bg-berry/10 p-5">
        <p className="font-black text-berry">Không tải được campaign</p>
        <p className="mt-1 text-sm text-muted">Kiểm tra quyền admin hoặc RLS của bảng campaigns.</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Tải lại
        </Button>
      </div>
    )
  }

  if (!campaigns.length) {
    return (
      <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-5 py-14 text-center">
        <AiOutlineCalendar className="mx-auto text-4xl text-berry" />
        <p className="mt-3 font-black text-ink">Chưa có campaign phù hợp</p>
        <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc hoặc tạo campaign mới.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-admin border border-berry/10">
      <table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Campaign</th>
            <th className="px-4 py-3">Loại</th>
            <th className="px-4 py-3">Thời gian</th>
            <th className="px-4 py-3">Sản phẩm</th>
            <th className="px-4 py-3">CTA</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-berry/10 bg-white">
          {campaigns.map((campaign) => {
            const status = getCampaignStatus(campaign)
            const products = getCampaignProducts(campaign)

            return (
              <tr
                key={campaign.id}
                data-campaign-row-id={campaign.id}
                className={campaign.id === highlightedCampaignId ? 'bg-mint/60 transition-colors' : 'transition-colors'}
              >
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
                      {campaign.banner_url ? (
                        <img src={campaign.banner_url} alt={campaign.name} className="h-full w-full object-cover" />
                      ) : (
                        <AiOutlinePicture className="text-2xl text-berry" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-black text-ink">{campaign.name}</p>
                        {campaign.id === highlightedCampaignId ? <Badge tone="success">Vừa lưu</Badge> : null}
                      </div>
                      <p className="mt-1 line-clamp-1 text-xs font-bold text-muted">
                        {campaign.subtitle || campaign.description || 'Chưa có mô tả ngắn'}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <Badge tone="info">{campaignTypeLabels[campaign.campaign_type ?? 'collection']}</Badge>
                </td>
                <td className="px-4 py-4 text-muted">
                  {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                </td>
                <td className="px-4 py-4 font-black text-ink">{products.length} sản phẩm</td>
                <td className="px-4 py-4 text-muted">{campaign.cta_label || 'Mặc định'}</td>
                <td className="px-4 py-4">
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td className="px-4 py-4">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="ghost" onClick={() => onEdit(campaign)}>
                      <AiOutlineEdit className="text-lg" />
                      Sửa
                    </Button>
                    <Button
                      size="sm"
                      variant={campaign.is_active ? 'danger' : 'secondary'}
                      disabled={isTogglingActive}
                      onClick={() => onToggleActive(campaign)}
                    >
                      {campaign.is_active ? <AiOutlineEyeInvisible className="text-lg" /> : <AiOutlineEye className="text-lg" />}
                      {campaign.is_active ? 'Tắt' : 'Bật'}
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
