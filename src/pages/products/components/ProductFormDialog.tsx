import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import {
  AiOutlineClose,
  AiOutlineCloudUpload,
  AiOutlineLoading3Quarters,
  AiOutlinePlus,
} from 'react-icons/ai'
import { Button, SegmentedControl } from '../../../components/ui'
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadProductImagesMutation,
} from '../../../queries'
import { productFormSchema, type ProductFormValues } from '../../../schemas'
import { productServices, type Product } from '../../../services'
import { defaultProductValues, productFormTypeOptions } from '../../../utils'
import { FormField, FormSection, ToggleField } from './ProductFormFields'

interface ProductFormDialogProps {
  product: Product | null
  onClose: () => void
  onSaved: (product: Product, action: 'created' | 'updated') => void
}

export const ProductFormDialog = ({ product, onClose, onSaved }: ProductFormDialogProps) => {
  const createMutation = useCreateProductMutation()
  const updateMutation = useUpdateProductMutation()
  const uploadMutation = useUploadProductImagesMutation()
  const isEditing = Boolean(product)
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? productServices.toProductFormValues(product) : defaultProductValues,
  })
  const priceTiersFieldArray = useFieldArray({ control, name: 'price_tiers' })
  const variantsFieldArray = useFieldArray({ control, name: 'variants' })
  const images = watch('images')
  const selectedType = watch('product_type')
  const variants = watch('variants')
  const hasVariants = variants.length > 0
  const totalVariantStock = variants
    .filter((variant) => variant.is_active)
    .reduce((total, variant) => total + Number(variant.stock_quantity || 0), 0)
  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const submitError = createMutation.error?.message || updateMutation.error?.message || uploadMutation.error?.message

  useEffect(() => {
    reset(product ? productServices.toProductFormValues(product) : defaultProductValues)
  }, [product, reset])

  useEffect(() => {
    if (!hasVariants) return
    setValue('stock_quantity', totalVariantStock, { shouldDirty: true, shouldValidate: true })
  }, [hasVariants, setValue, totalVariantStock])

  const handleImageUpload = (files: FileList | null) => {
    const uploadFiles = Array.from(files ?? [])
    if (!uploadFiles.length) return

    uploadMutation.mutate(uploadFiles, {
      onSuccess: (urls) => {
        setValue('images', [...images, ...urls], { shouldDirty: true, shouldValidate: true })
      },
    })
  }

  const onSubmit = (values: ProductFormValues) => {
    if (product) {
      updateMutation.mutate(
        { productId: product.id, values },
        {
          onSuccess: (savedProduct) => {
            onSaved(savedProduct, 'updated')
            onClose()
          },
        },
      )
      return
    }

    createMutation.mutate(values, {
      onSuccess: (savedProduct) => {
        onSaved(savedProduct, 'created')
        onClose()
      },
    })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/20 px-4 py-6 backdrop-blur-[2px]">
      <div className="mx-auto max-w-5xl rounded-admin bg-white shadow-soft ring-1 ring-berry/10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-t-admin border-b border-berry/10 bg-white px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted">
                {isEditing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}
              </p>
              <h3 className="mt-1 text-xl font-black text-ink">{isEditing ? product?.name : 'Sản phẩm mới'}</h3>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <AiOutlineLoading3Quarters className="animate-spin text-lg" /> : null}
                {isEditing ? 'Lưu thay đổi' : 'Tạo sản phẩm'}
              </Button>
            </div>
          </div>

          <div className="grid gap-6 p-5 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <FormSection title="Thông tin chính">
                <FormField label="Tên sản phẩm" error={errors.name?.message}>
                  <input {...register('name')} className="admin-input" placeholder="Móc khóa gấu len mini" />
                </FormField>
                <FormField label="Mô tả" error={errors.description?.message}>
                  <textarea
                    {...register('description')}
                    className="admin-input min-h-28 py-3"
                    placeholder="Mô tả chất liệu, kích thước, điểm nổi bật..."
                  />
                </FormField>
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField label="Giá bán" error={errors.price?.message}>
                    <input {...register('price')} type="number" min={0} className="admin-input" />
                  </FormField>
                  <FormField label={hasVariants ? 'Tồn kho tổng' : 'Tồn kho'} error={errors.stock_quantity?.message}>
                    <input
                      {...register('stock_quantity')}
                      type="number"
                      min={0}
                      disabled={hasVariants}
                      className="admin-input disabled:cursor-not-allowed disabled:opacity-70"
                    />
                  </FormField>
                  <FormField label="Thời gian làm" error={errors.estimated_days?.message}>
                    <input {...register('estimated_days')} className="admin-input" placeholder="5-7 ngày" />
                  </FormField>
                </div>
                <div>
                  <p className="mb-2 text-sm font-bold text-cocoa">Nhóm sản phẩm</p>
                  <SegmentedControl
                    value={selectedType}
                    options={productFormTypeOptions}
                    onValueChange={(value) => setValue('product_type', value)}
                  />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <ToggleField label="Đang bật bán" {...register('is_active')} />
                  <ToggleField label="Cho phép tùy chỉnh" {...register('allow_customization')} />
                </div>
              </FormSection>

              <FormSection title="Giá sỉ theo số lượng">
                <div className="space-y-3">
                  {priceTiersFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 rounded-admin border border-berry/10 bg-cream p-3 md:grid-cols-[1fr_1fr_1fr_auto]">
                      <ProductNumberField label="Từ số lượng">
                        <input {...register(`price_tiers.${index}.min_quantity`)} type="number" min={2} className="admin-input bg-white" />
                      </ProductNumberField>
                      <ProductNumberField label="Đến số lượng">
                        <input
                          {...register(`price_tiers.${index}.max_quantity`, {
                            setValueAs: (value) => (value === '' ? null : Number(value)),
                          })}
                          type="number"
                          min={2}
                          className="admin-input bg-white"
                          placeholder="Bỏ trống nếu không giới hạn"
                        />
                      </ProductNumberField>
                      <ProductNumberField label="Đơn giá sỉ">
                        <input {...register(`price_tiers.${index}.unit_price`)} type="number" min={0} className="admin-input bg-white" />
                      </ProductNumberField>
                      <div className="flex items-end gap-2">
                        <label className="flex h-11 items-center gap-2 rounded-admin bg-white px-3 text-xs font-bold text-cocoa ring-1 ring-berry/10">
                          <input type="checkbox" className="accent-berry" {...register(`price_tiers.${index}.is_active`)} />
                          Bật
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => priceTiersFieldArray.remove(index)}>
                          <AiOutlineClose />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    onClick={() => priceTiersFieldArray.append({ min_quantity: 2, max_quantity: null, unit_price: 0, is_active: true })}
                  >
                    <AiOutlinePlus className="text-lg" />
                    Thêm mức giá sỉ
                  </Button>
                </div>
              </FormSection>

              <FormSection title="Phân loại sản phẩm">
                <div className="space-y-3">
                  {variantsFieldArray.fields.map((field, index) => (
                    <div key={field.id} className="grid gap-3 rounded-admin border border-berry/10 bg-cream p-3 md:grid-cols-2">
                      <ProductNumberField label="Tên phân loại">
                        <input {...register(`variants.${index}.name`)} className="admin-input bg-white" placeholder="VD: Màu hồng" />
                      </ProductNumberField>
                      <ProductNumberField label="Tên màu">
                        <input {...register(`variants.${index}.color_name`)} className="admin-input bg-white" placeholder="VD: Hồng pastel" />
                      </ProductNumberField>
                      <ProductNumberField label="Mã màu">
                        <input {...register(`variants.${index}.color_hex`)} className="admin-input bg-white" placeholder="#F8B7C1" />
                      </ProductNumberField>
                      <ProductNumberField label="Giá riêng">
                        <input
                          {...register(`variants.${index}.price`, {
                            setValueAs: (value) => (value === '' ? null : Number(value)),
                          })}
                          type="number"
                          min={0}
                          className="admin-input bg-white"
                          placeholder="Bỏ trống nếu dùng giá gốc"
                        />
                      </ProductNumberField>
                      <ProductNumberField label="Tồn kho phân loại">
                        <input {...register(`variants.${index}.stock_quantity`)} type="number" min={0} className="admin-input bg-white" />
                      </ProductNumberField>
                      <div className="flex gap-2">
                        <label className="flex h-11 flex-1 items-center gap-2 rounded-admin bg-white px-3 text-sm font-bold text-cocoa ring-1 ring-berry/10">
                          <input type="checkbox" className="accent-berry" {...register(`variants.${index}.is_active`)} />
                          Đang bán
                        </label>
                        <Button variant="ghost" size="icon" onClick={() => variantsFieldArray.remove(index)}>
                          <AiOutlineClose />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="secondary"
                    onClick={() => variantsFieldArray.append({ name: '', color_name: '', color_hex: '', price: null, stock_quantity: 0, is_active: true })}
                  >
                    <AiOutlinePlus className="text-lg" />
                    Thêm phân loại
                  </Button>
                </div>
              </FormSection>
            </div>

            <div className="space-y-5">
              <FormSection title="Ảnh sản phẩm">
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-admin border border-dashed border-berry/25 bg-cream px-4 py-8 text-center transition hover:border-berry">
                  <AiOutlineCloudUpload className="text-4xl text-berry" />
                  <span className="mt-3 text-sm font-black text-ink">
                    {uploadMutation.isPending ? 'Đang upload ảnh...' : 'Chọn ảnh sản phẩm'}
                  </span>
                  <span className="mt-1 text-xs font-bold text-muted">PNG, JPG, WEBP. Mỗi ảnh tối đa 5MB.</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadMutation.isPending}
                    onChange={(event) => handleImageUpload(event.target.files)}
                  />
                </label>
                {images.length ? (
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((imageUrl, index) => (
                      <div key={imageUrl} className="group relative aspect-square overflow-hidden rounded-admin bg-cream ring-1 ring-berry/10">
                        <img src={imageUrl} alt={`Ảnh sản phẩm ${index + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink/85 text-white opacity-0 transition group-hover:opacity-100"
                          onClick={() => setValue('images', images.filter((url) => url !== imageUrl), { shouldDirty: true })}
                        >
                          <AiOutlineClose />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-admin border border-dashed border-berry/20 bg-cream px-4 py-8 text-center text-sm font-bold text-muted">
                    Chưa có ảnh sản phẩm.
                  </div>
                )}
              </FormSection>

              {submitError ? (
                <div className="rounded-admin border border-berry/20 bg-berry/10 p-4 text-sm font-bold text-berry">
                  {submitError}
                </div>
              ) : null}

              <div className="rounded-admin bg-ink p-5 text-white">
                <p className="text-sm font-bold text-white/65">Ghi chú thao tác</p>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Nút Ẩn chỉ tắt hiển thị sản phẩm trên shop. Dữ liệu vẫn được giữ lại để không làm mất liên kết với đơn hàng cũ.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const ProductNumberField = ({ label, children }: { label: string; children: ReactNode }) => (
  <label className="space-y-1">
    <span className="block text-xs font-black uppercase text-muted">{label}</span>
    {children}
  </label>
)
