import { z } from 'zod'

export const promotionDiscountTypeSchema = z.enum(['percent', 'fixed', 'free_shipping'])
export const promotionVisibilitySchema = z.enum(['public', 'private'])

const nullableNumberSchema = z.number().int().min(0).nullable()

export const promotionFormSchema = z
  .object({
    title: z.string().trim().min(1, 'Tên voucher là bắt buộc'),
    code: z.string().trim().min(2, 'Mã voucher tối thiểu 2 ký tự'),
    description: z.string().trim().optional(),
    visibility: promotionVisibilitySchema,
    discount_type: promotionDiscountTypeSchema,
    discount_value: z.coerce.number().int().min(0, 'Giá trị giảm không hợp lệ'),
    min_order_value: nullableNumberSchema,
    max_order_value: nullableNumberSchema,
    max_discount_value: nullableNumberSchema,
    banner_url: z.string().trim().url('Link banner không hợp lệ').optional().or(z.literal('')),
    campaign_id: z.string().trim().optional(),
    start_date: z.string().trim().min(1, 'Ngày bắt đầu là bắt buộc'),
    end_date: z.string().trim().min(1, 'Ngày kết thúc là bắt buộc'),
    usage_limit: nullableNumberSchema,
    is_active: z.boolean(),
  })
  .refine((values) => new Date(values.end_date) >= new Date(values.start_date), {
    path: ['end_date'],
    message: 'Ngày kết thúc phải sau ngày bắt đầu',
  })
  .refine((values) => values.discount_type !== 'percent' || values.discount_value <= 100, {
    path: ['discount_value'],
    message: 'Voucher phần trăm tối đa 100%',
  })

export type PromotionFormValues = z.infer<typeof promotionFormSchema>
export type PromotionDiscountType = z.infer<typeof promotionDiscountTypeSchema>
export type PromotionVisibility = z.infer<typeof promotionVisibilitySchema>
