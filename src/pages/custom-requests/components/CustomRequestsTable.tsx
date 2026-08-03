import { AiOutlineEye, AiOutlineInbox, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { Badge, Button } from '../../../components/ui'
import type { CustomRequest } from '../../../services'
import {
  customRequestStatusLabels,
  formatDateTime,
  getCustomRequestOccasionLabel,
  getCustomRequestStatusTone,
} from '../../../utils'

interface CustomRequestsTableProps {
  requests: CustomRequest[]
  isLoading: boolean
  isError: boolean
  highlightedRequestId?: string | null
  onRetry: () => void
  onView: (request: CustomRequest) => void
}

export const CustomRequestsTable = ({
  requests,
  isLoading,
  isError,
  highlightedRequestId,
  onRetry,
  onView,
}: CustomRequestsTableProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-14 text-sm font-bold text-muted">
        <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
        Đang tải yêu cầu đặt riêng...
      </div>
    )
  }

  if (isError) {
    return (
      <div className="rounded-admin border border-berry/20 bg-berry/10 p-5">
        <p className="font-black text-berry">Không tải được yêu cầu đặt riêng</p>
        <p className="mt-1 text-sm text-muted">Kiểm tra quyền admin hoặc RLS của bảng custom_requests.</p>
        <Button className="mt-4" variant="secondary" onClick={onRetry}>
          Tải lại
        </Button>
      </div>
    )
  }

  if (!requests.length) {
    return (
      <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-5 py-14 text-center">
        <AiOutlineInbox className="mx-auto text-4xl text-berry" />
        <p className="mt-3 font-black text-ink">Chưa có yêu cầu phù hợp</p>
        <p className="mt-1 text-sm text-muted">Thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-admin border border-berry/10">
      <table className="w-full min-w-[980px] text-left text-sm">
        <thead className="bg-cream text-xs uppercase text-muted">
          <tr>
            <th className="px-4 py-3">Khách hàng</th>
            <th className="px-4 py-3">Yêu cầu</th>
            <th className="px-4 py-3">Dịp</th>
            <th className="px-4 py-3">Số lượng</th>
            <th className="px-4 py-3">Trạng thái</th>
            <th className="px-4 py-3">Ngày gửi</th>
            <th className="px-4 py-3 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-berry/10 bg-white">
          {requests.map((request) => (
            <tr
              key={request.id}
              data-custom-request-row-id={request.id}
              className={request.id === highlightedRequestId ? 'bg-mint/60 transition-colors' : 'transition-colors'}
            >
              <td className="px-4 py-4">
                <p className="font-black text-ink">{request.customer_name}</p>
                <p className="mt-1 text-xs font-bold text-muted">{request.phone}</p>
              </td>
              <td className="max-w-80 px-4 py-4 text-muted">
                <p className="line-clamp-2">{request.description || 'Chưa nhập mô tả'}</p>
                <p className="mt-1 text-xs font-bold text-muted">
                  {(request.reference_images ?? []).length} ảnh tham khảo
                </p>
              </td>
              <td className="px-4 py-4 text-muted">{getCustomRequestOccasionLabel(request)}</td>
              <td className="px-4 py-4 font-black text-ink">{request.quantity}</td>
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <Badge tone={getCustomRequestStatusTone(request.status)}>
                    {customRequestStatusLabels[request.status]}
                  </Badge>
                  {request.id === highlightedRequestId ? <Badge tone="success">Vừa lưu</Badge> : null}
                </div>
              </td>
              <td className="px-4 py-4 text-muted">{formatDateTime(request.created_at)}</td>
              <td className="px-4 py-4">
                <div className="flex justify-end">
                  <Button size="sm" variant="ghost" onClick={() => onView(request)}>
                    <AiOutlineEye className="text-lg" />
                    Chi tiết
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
