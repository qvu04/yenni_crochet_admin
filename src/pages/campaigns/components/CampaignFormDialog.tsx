import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { AiOutlineClose, AiOutlineCloudUpload, AiOutlineLoading3Quarters, AiOutlinePicture } from 'react-icons/ai'
import { ActionNotice, Button, SegmentedControl } from '../../../components/ui'
import {
  useCreateCampaignMutation,
  useProductsQuery,
  useUpdateCampaignMutation,
  useUploadCampaignImageMutation,
} from '../../../queries'
import { campaignFormSchema, type CampaignFormValues } from '../../../schemas'
import { campaignServices, type Campaign } from '../../../services'
import {
  campaignCtaActionOptions,
  campaignTypeOptions,
  defaultCampaignValues,
  formatCurrency,
  getProductLabel,
} from '../../../utils'
import { CampaignFormField, CampaignFormSection, CampaignToggleField } from './CampaignFormFields'

interface CampaignFormDialogProps {
  campaign: Campaign | null
  onClose: () => void
  onSaved: (campaign: Campaign, action: 'created' | 'updated') => void
}

export const CampaignFormDialog = ({ campaign, onClose, onSaved }: CampaignFormDialogProps) => {
  const createMutation = useCreateCampaignMutation()
  const updateMutation = useUpdateCampaignMutation()
  const uploadBannerMutation = useUploadCampaignImageMutation()
  const uploadDetailImageMutation = useUploadCampaignImageMutation()
  const productsQuery = useProductsQuery({ type: 'all' })
  const isEditing = Boolean(campaign)
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: campaign ? campaignServices.toCampaignFormValues(campaign) : defaultCampaignValues,
  })
  const campaignType = watch('campaign_type')
  const ctaAction = watch('cta_action')
  const bannerUrl = watch('banner_url')
  const detailImageUrl = watch('detail_image_url')
  const selectedProductIds = watch('product_ids')
  const isUploadingImage = uploadBannerMutation.isPending || uploadDetailImageMutation.isPending
  const isSubmitting = createMutation.isPending || updateMutation.isPending || isUploadingImage
  const submitError =
    createMutation.error?.message ||
    updateMutation.error?.message ||
    uploadBannerMutation.error?.message ||
    uploadDetailImageMutation.error?.message
  const products = productsQuery.data ?? []

  useEffect(() => {
    reset(campaign ? campaignServices.toCampaignFormValues(campaign) : defaultCampaignValues)
  }, [campaign, reset])

  const toggleProduct = (productId: string) => {
    setValue(
      'product_ids',
      selectedProductIds.includes(productId)
        ? selectedProductIds.filter((id) => id !== productId)
        : [...selectedProductIds, productId],
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const handleImageUpload = (
    files: FileList | null,
    fieldName: 'banner_url' | 'detail_image_url',
  ) => {
    const file = files?.[0]
    if (!file) return

    const uploadMutation = fieldName === 'banner_url' ? uploadBannerMutation : uploadDetailImageMutation
    uploadMutation.mutate(file, {
      onSuccess: (url) => {
        setValue(fieldName, url, { shouldDirty: true, shouldValidate: true })
      },
    })
  }

  const onSubmit = (values: CampaignFormValues) => {
    if (campaign) {
      updateMutation.mutate(
        { campaignId: campaign.id, values },
        {
          onSuccess: (savedCampaign) => {
            onSaved(savedCampaign, 'updated')
            onClose()
          },
        },
      )
      return
    }

    createMutation.mutate(values, {
      onSuccess: (savedCampaign) => {
        onSaved(savedCampaign, 'created')
        onClose()
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
      <div className="mx-auto max-w-6xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {isEditing ? 'Cập nhật campaign' : 'Tạo campaign'}
              </p>
              <h3 className="mt-1 text-xl font-black text-ink">{isEditing ? campaign?.name : 'Campaign mới'}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                {isEditing ? 'Lưu thay đổi' : 'Tạo campaign'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-5">
              <CampaignFormSection title="Thông tin hiển thị">
                <CampaignFormField label="Tên campaign" error={errors.name?.message}>
                  <input {...register('name')} className="admin-input" placeholder="Mùa len Valentine" />
                </CampaignFormField>
                <div className="grid gap-4 md:grid-cols-2">
                  <CampaignFormField label="Tiêu đề phụ" error={errors.subtitle?.message}>
                    <input {...register('subtitle')} className="admin-input" placeholder="Quà handmade cho người thương" />
                  </CampaignFormField>
                  <CampaignFormField label="Địa điểm" error={errors.event_location?.message}>
                    <input {...register('event_location')} className="admin-input" placeholder="Có thể để trống" />
                  </CampaignFormField>
                </div>
                <CampaignFormField label="Mô tả ngắn" error={errors.description?.message}>
                  <textarea {...register('description')} className="admin-input min-h-20 py-3" />
                </CampaignFormField>
                <CampaignFormField label="Nội dung chi tiết" error={errors.content?.message}>
                  <textarea {...register('content')} className="admin-input min-h-32 py-3" />
                </CampaignFormField>
                <CampaignToggleField label="Đang bật trên mini app" {...register('is_active')} />
              </CampaignFormSection>

              <CampaignFormSection title="Phân loại và CTA">
                <div>
                  <p className="mb-2 text-sm font-bold text-cocoa">Loại campaign</p>
                  <SegmentedControl
                    value={campaignType}
                    options={campaignTypeOptions}
                    onValueChange={(value) => setValue('campaign_type', value, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-cocoa">Điều hướng CTA</p>
                  <SegmentedControl
                    value={ctaAction}
                    options={campaignCtaActionOptions}
                    onValueChange={(value) => setValue('cta_action', value, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
                <CampaignFormField label="Nhãn CTA" error={errors.cta_label?.message}>
                  <input {...register('cta_label')} className="admin-input" placeholder="Bỏ trống để mini app dùng mặc định" />
                </CampaignFormField>
              </CampaignFormSection>

              <CampaignFormSection title="Thời gian">
                <div className="grid gap-4 md:grid-cols-2">
                  <CampaignFormField label="Ngày bắt đầu" error={errors.start_date?.message}>
                    <input {...register('start_date')} type="date" className="admin-input" />
                  </CampaignFormField>
                  <CampaignFormField label="Ngày kết thúc" error={errors.end_date?.message}>
                    <input {...register('end_date')} type="date" className="admin-input" />
                  </CampaignFormField>
                  <CampaignFormField label="Bắt đầu chi tiết" error={errors.start_at?.message}>
                    <input {...register('start_at')} type="datetime-local" className="admin-input" />
                  </CampaignFormField>
                  <CampaignFormField label="Kết thúc chi tiết" error={errors.end_at?.message}>
                    <input {...register('end_at')} type="datetime-local" className="admin-input" />
                  </CampaignFormField>
                </div>
              </CampaignFormSection>
            </div>

            <div className="space-y-5">
              <CampaignFormSection title="Hình ảnh">
                <ImageUploader
                  title="Banner trang chủ"
                  imageUrl={bannerUrl}
                  error={errors.banner_url?.message}
                  isUploading={uploadBannerMutation.isPending}
                  required
                  onUpload={(files) => handleImageUpload(files, 'banner_url')}
                  onRemove={() => setValue('banner_url', '', { shouldDirty: true, shouldValidate: true })}
                  registerInput={<input type="hidden" {...register('banner_url')} />}
                />
                <ImageUploader
                  title="Ảnh chi tiết"
                  imageUrl={detailImageUrl}
                  error={errors.detail_image_url?.message}
                  isUploading={uploadDetailImageMutation.isPending}
                  onUpload={(files) => handleImageUpload(files, 'detail_image_url')}
                  onRemove={() => setValue('detail_image_url', '', { shouldDirty: true, shouldValidate: true })}
                  registerInput={<input type="hidden" {...register('detail_image_url')} />}
                />
              </CampaignFormSection>

              <CampaignFormSection title="Sản phẩm trong campaign">
                {productsQuery.isLoading ? (
                  <div className="flex items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream py-8 text-sm font-bold text-muted">
                    <AiOutlineLoading3Quarters className="mr-2 animate-spin text-xl text-berry" />
                    Đang tải sản phẩm...
                  </div>
                ) : products.length ? (
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {products.map((product) => (
                      <label
                        key={product.id}
                        className="flex cursor-pointer items-center gap-3 rounded-admin border border-berry/10 bg-cream p-3 transition hover:border-berry/30"
                      >
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-berry"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => toggleProduct(product.id)}
                        />
                        <img
                          src={product.images?.[0] ?? ''}
                          alt={product.name}
                          className="h-12 w-12 rounded-admin bg-white object-cover ring-1 ring-berry/10"
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-black text-ink">{product.name}</span>
                          <span className="mt-1 block text-xs font-bold text-muted">
                            {getProductLabel(product)} · {formatCurrency(product.price)}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted">
                    Chưa có sản phẩm để gắn vào campaign.
                  </div>
                )}
              </CampaignFormSection>

              {submitError ? (
                <ActionNotice tone="danger" title="Không lưu được campaign" description={submitError} />
              ) : null}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const ImageUploader = ({
  title,
  imageUrl,
  error,
  isUploading,
  required,
  onUpload,
  onRemove,
  registerInput,
}: {
  title: string
  imageUrl?: string
  error?: string
  isUploading: boolean
  required?: boolean
  onUpload: (files: FileList | null) => void
  onRemove: () => void
  registerInput: ReactNode
}) => (
  <div>
    <p className="mb-2 text-sm font-bold text-cocoa">
      {title}
      {required ? <span className="text-berry"> *</span> : null}
    </p>
    {registerInput}
    <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-admin border border-dashed border-berry/25 bg-cream px-4 py-6 text-center transition hover:border-berry">
      <AiOutlineCloudUpload className="text-3xl text-berry" />
      <span className="mt-2 text-sm font-black text-ink">{isUploading ? 'Đang upload ảnh...' : 'Chọn ảnh'}</span>
      <span className="mt-1 text-xs font-bold text-muted">PNG, JPG, WEBP. Tối đa 5MB.</span>
      <input type="file" accept="image/*" className="hidden" disabled={isUploading} onChange={(event) => onUpload(event.target.files)} />
    </label>
    {error ? <span className="mt-2 block text-sm font-bold text-berry">{error}</span> : null}
    {imageUrl ? (
      <div className="group relative mt-3 aspect-[16/9] overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
        <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
        <button
          type="button"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ink/85 text-white opacity-0 transition group-hover:opacity-100"
          onClick={onRemove}
          aria-label={`Xóa ${title}`}
        >
          <AiOutlineClose />
        </button>
      </div>
    ) : (
      <div className="mt-3 flex aspect-[16/9] items-center justify-center rounded-admin border border-dashed border-berry/20 bg-cream text-3xl text-berry">
        <AiOutlinePicture />
      </div>
    )}
  </div>
)
