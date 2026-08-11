import { z } from 'zod'

export const productTypeSchema = z.enum(['normal', 'preorder', 'new', 'best_seller'])

export const productPriceTierSchema = z.object({
  id: z.string().optional(),
  min_quantity: z.coerce.number().int().min(2, 'Tối thiểu từ 2 sản phẩm'),
  max_quantity: z.number().int().min(2).nullable(),
  unit_price: z.coerce.number().int().min(0, 'Giá sỉ không hợp lệ'),
  is_active: z.boolean(),
})

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(1, 'Tên phân loại là bắt buộc'),
  color_name: z.string().trim().optional(),
  color_hex: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^#[0-9A-Fa-f]{6}$/.test(value), 'Mã màu dạng #FFFFFF'),
  price: z.number().int().min(0).nullable(),
  stock_quantity: z.coerce.number().int().min(0, 'Tồn kho không hợp lệ'),
  images: z.array(z.string().url()),
  is_active: z.boolean(),
})

export const productFormSchema = z.object({
  name: z.string().trim().min(1, 'Tên sản phẩm là bắt buộc'),
  description: z.string().trim().optional(),
  price: z.coerce.number().int().min(0, 'Giá bán không hợp lệ'),
  estimated_days: z.string().trim().optional(),
  stock_quantity: z.coerce.number().int().min(0, 'Tồn kho không hợp lệ'),
  product_type: productTypeSchema,
  allow_customization: z.boolean(),
  is_active: z.boolean(),
  images: z.array(z.string().url()),
  price_tiers: z.array(productPriceTierSchema),
  variants: z.array(productVariantSchema),
})

export type ProductFormValues = z.infer<typeof productFormSchema>
export type ProductFormType = z.infer<typeof productTypeSchema>
