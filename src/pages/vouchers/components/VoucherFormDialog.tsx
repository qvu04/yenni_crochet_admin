import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { ActionNotice, Button, SegmentedControl } from '../../../components/ui'
import { useCreatePromotionMutation, useUpdatePromotionMutation } from '../../../queries'
import { promotionFormSchema, type PromotionFormValues } from '../../../schemas'
import { voucherServices, type Promotion } from '../../../services'
import { defaultPromotionValues, promotionDiscountTypeOptions } from '../../../utils'
import { VoucherFormField, VoucherFormSection, VoucherToggleField } from './VoucherFormFields'

interface VoucherFormDialogProps {
  promotion: Promotion | null
  onClose: () => void
  onSaved: (promotion: Promotion, action: 'created' | 'updated') => void
}

export const VoucherFormDialog = ({ promotion, onClose, onSaved }: VoucherFormDialogProps) => {
  const createMutation = useCreatePromotionMutation()
  const updateMutation = useUpdatePromotionMutation()
  const isEditing = Boolean(promotion)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionFormSchema),
    defaultValues: promotion ? voucherServices.toPromotionFormValues(promotion) : defaultPromotionValues,
  })
  const discountType = watch('discount_type')
  const bannerUrl = watch('banner_url')
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const submitError = createMutation.error?.message || updateMutation.error?.message
  const nullableNumberRegisterOptions = {
    setValueAs: (value: string) => (value === '' ? null : Number(value)),
  }

  useEffect(() => {
    reset(promotion ? voucherServices.toPromotionFormValues(promotion) : defaultPromotionValues)
  }, [promotion, reset])

  const onSubmit = (values: PromotionFormValues) => {
    if (promotion) {
      updateMutation.mutate(
        { promotionId: promotion.id, values },
        {
          onSuccess: (savedPromotion) => {
            onSaved(savedPromotion, 'updated')
            onClose()
          },
        },
      )
      return
    }

    createMutation.mutate(values, {
      onSuccess: (savedPromotion) => {
        onSaved(savedPromotion, 'created')
        onClose()
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
      <div className="mx-auto max-w-4xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {isEditing ? 'Cập nhật voucher' : 'Tạo voucher'}
              </p>
              <h3 className="mt-1 text-xl font-black text-ink">{isEditing ? promotion?.title : 'Voucher mới'}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                {isEditing ? 'Lưu thay đổi' : 'Tạo voucher'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
              <VoucherFormSection title="Thông tin voucher">
                <div className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
                  <VoucherFormField label="Tên voucher" error={errors.title?.message}>
                    <input {...register('title')} className="admin-input" placeholder="Ưu đãi khách quen" />
                  </VoucherFormField>
                  <VoucherFormField label="Mã voucher" error={errors.code?.message}>
                    <input {...register('code')} className="admin-input uppercase" placeholder="YENNI10" />
                  </VoucherFormField>
                </div>
                <VoucherFormField label="Mô tả" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    className="admin-input min-h-24 py-3"
                    placeholder="Mô tả ngắn hiển thị trong tab Ưu đãi."
                  />
                </VoucherFormField>
                <VoucherToggleField label="Đang bật voucher" {...register('is_active')} />
              </VoucherFormSection>

              <VoucherFormSection title="Cấu hình giảm giá">
                <div>
                  <p className="mb-2 text-sm font-bold text-cocoa">Loại giảm giá</p>
                  <SegmentedControl
                    value={discountType}
                    options={promotionDiscountTypeOptions}
                    onValueChange={(value) => setValue('discount_type', value, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
                {discountType !== 'free_shipping' ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <VoucherFormField
                      label={discountType === 'percent' ? 'Phần trăm giảm' : 'Số tiền giảm'}
                      error={errors.discount_value?.message}
                    >
                      <input {...register('discount_value')} type="number" min={0} className="admin-input" />
                    </VoucherFormField>
                    <VoucherFormField label="Giảm tối đa" error={errors.max_discount_value?.message}>
                      <input {...register('max_discount_value', nullableNumberRegisterOptions)} type="number" min={0} className="admin-input" placeholder="Bỏ trống nếu không giới hạn" />
                    </VoucherFormField>
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <VoucherFormField label="Đơn tối thiểu" error={errors.min_order_value?.message}>
                    <input {...register('min_order_value', nullableNumberRegisterOptions)} type="number" min={0} className="admin-input" placeholder="Không giới hạn" />
                  </VoucherFormField>
                  <VoucherFormField label="Đơn tối đa" error={errors.max_order_value?.message}>
                    <input {...register('max_order_value', nullableNumberRegisterOptions)} type="number" min={0} className="admin-input" placeholder="Không giới hạn" />
                  </VoucherFormField>
                </div>
              </VoucherFormSection>
            </div>

            <div className="space-y-5">
              <VoucherFormSection title="Thời gian và giới hạn">
                <div className="grid gap-4 md:grid-cols-2">
                  <VoucherFormField label="Ngày bắt đầu" error={errors.start_date?.message}>
                    <input {...register('start_date')} type="date" className="admin-input" />
                  </VoucherFormField>
                  <VoucherFormField label="Ngày kết thúc" error={errors.end_date?.message}>
                    <input {...register('end_date')} type="date" className="admin-input" />
                  </VoucherFormField>
                </div>
                <VoucherFormField label="Giới hạn lượt dùng" error={errors.usage_limit?.message}>
                  <input {...register('usage_limit', nullableNumberRegisterOptions)} type="number" min={0} className="admin-input" placeholder="Bỏ trống nếu không giới hạn" />
                </VoucherFormField>
              </VoucherFormSection>

              <VoucherFormSection title="Hiển thị">
                <VoucherFormField label="Banner URL" error={errors.banner_url?.message}>
                  <input {...register('banner_url')} className="admin-input" placeholder="https://..." />
                </VoucherFormField>
                <VoucherFormField label="Campaign ID" error={errors.campaign_id?.message}>
                  <input {...register('campaign_id')} className="admin-input" placeholder="Có thể để trống" />
                </VoucherFormField>
                {bannerUrl ? (
                  <div className="aspect-[16/9] overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
                    <img src={bannerUrl} alt="Banner voucher" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted">
                    Chưa có banner preview.
                  </div>
                )}
              </VoucherFormSection>

              {submitError ? (
                <ActionNotice tone="danger" title="Không lưu được voucher" description={submitError} />
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
