import { useState } from 'react'
import { AiOutlineClose, AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ActionNotice, Badge, Button } from '../../../components/ui'
import { useUpdateCustomRequestStatusMutation } from '../../../queries'
import type { CustomRequest, CustomRequestStatus } from '../../../services'
import {
  customRequestStatusLabels,
  formatDate,
  editableCustomRequestStatusOptions,
  formatDateTime,
  getCustomRequestBudgetLabel,
  getCustomRequestOccasionLabel,
  getCustomRequestStatusTone,
} from '../../../utils'

interface CustomRequestDetailDialogProps {
  request: CustomRequest
  onClose: () => void
  onSaved: (request: CustomRequest) => void
}

export const CustomRequestDetailDialog = ({
  request,
  onClose,
  onSaved,
}: CustomRequestDetailDialogProps) => {
  const [nextStatus, setNextStatus] = useState<CustomRequestStatus>(request.status)
  const updateStatusMutation = useUpdateCustomRequestStatusMutation()
  const referenceImages = request.reference_images ?? []
  const canSave = nextStatus !== request.status

  const handleSaveStatus = () => {
    updateStatusMutation.mutate(
      { requestId: request.id, status: nextStatus },
      {
        onSuccess: (savedRequest) => {
          onSaved(savedRequest)
          onClose()
        },
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
      <div className="mx-auto max-w-4xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Chi tiết đặt riêng</p>
            <h3 className="mt-1 text-xl font-black text-ink">{request.customer_name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-admin text-xl text-muted transition hover:bg-cream hover:text-ink"
            aria-label="Đóng chi tiết đặt riêng"
          >
            <AiOutlineClose />
          </button>
        </div>

        <div className="grid gap-6 p-5 lg:grid-cols-[1fr_0.78fr]">
          <section className="space-y-4">
            <div className="rounded-admin border border-berry/10 bg-cream p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-muted">Trạng thái hiện tại</p>
                  <div className="mt-2">
                    <Badge tone={getCustomRequestStatusTone(request.status)}>
                      {customRequestStatusLabels[request.status]}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm font-bold text-muted">{formatDateTime(request.created_at)}</p>
              </div>
            </div>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Mô tả khách gửi</h4>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-cocoa">
                {request.description || 'Khách chưa nhập mô tả.'}
              </p>
            </section>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Ảnh tham khảo</h4>
              {referenceImages.length ? (
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {referenceImages.map((imageUrl, index) => (
                    <a
                      key={imageUrl}
                      href={imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="aspect-square overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10"
                    >
                      <img
                        src={imageUrl}
                        alt={`Ảnh tham khảo ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </a>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted">
                  Khách chưa gửi ảnh tham khảo.
                </div>
              )}
            </section>
          </section>

          <aside className="space-y-4">
            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Thông tin khách</h4>
              <dl className="mt-4 space-y-3 text-sm">
                <InfoRow label="Tên" value={request.customer_name} />
                <InfoRow label="SĐT" value={request.phone} />
                <InfoRow label="Số lượng" value={String(request.quantity)} />
                <InfoRow label="Dịp tặng" value={getCustomRequestOccasionLabel(request)} />
                <InfoRow label="Thời gian mong muốn" value={request.expected_date ? formatDate(request.expected_date) : 'Chưa có'} />
                <InfoRow label="Ngân sách" value={getCustomRequestBudgetLabel(request)} />
                <InfoRow label="Tone màu" value={request.preferred_colors || 'Không có'} />
                <InfoRow label="Ghi chú" value={request.note || 'Không có'} />
              </dl>
            </section>

            <section className="rounded-admin border border-berry/10 bg-white p-4">
              <h4 className="font-black text-ink">Cập nhật trạng thái</h4>
              <select
                value={nextStatus}
                onChange={(event) => setNextStatus(event.target.value as CustomRequestStatus)}
                className="admin-input mt-4"
              >
                {editableCustomRequestStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {updateStatusMutation.error ? (
                <ActionNotice
                  tone="danger"
                  title="Không cập nhật được trạng thái"
                  description={updateStatusMutation.error.message}
                />
              ) : null}
              <Button className="mt-4 w-full" disabled={!canSave || updateStatusMutation.isPending} onClick={handleSaveStatus}>
                {updateStatusMutation.isPending ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                Lưu trạng thái
              </Button>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
    <dd className="mt-1 font-bold text-cocoa">{value}</dd>
  </div>
)
