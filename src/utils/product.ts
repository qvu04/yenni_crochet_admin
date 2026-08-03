import type { Product, ProductTypeFilter } from '../services'
import type { ProductFormType, ProductFormValues } from '../schemas'

export const productTypeOptions: Array<{ label: string; value: ProductTypeFilter }> = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Đặt trước', value: 'preorder' },
  { label: 'Mới', value: 'new' },
  { label: 'Bán chạy', value: 'best_seller' },
]

export const productFormTypeOptions: Array<{ label: string; value: ProductFormType }> = [
  { label: 'Thường', value: 'normal' },
  { label: 'Đặt trước', value: 'preorder' },
  { label: 'Mới', value: 'new' },
  { label: 'Bán chạy', value: 'best_seller' },
]

export const defaultProductValues: ProductFormValues = {
  name: '',
  description: '',
  price: 0,
  estimated_days: '',
  stock_quantity: 0,
  product_type: 'normal',
  allow_customization: true,
  is_active: true,
  images: [],
  price_tiers: [],
  variants: [],
}

export const getProductLabel = (product: Product) => {
  if (product.is_pre_order || product.product_type === 'pre_order') return 'Đặt trước'
  if (product.product_type === 'new') return 'Mới'
  if (product.product_type === 'best_seller') return 'Bán chạy'
  return 'Thường'
}

export const getProductInventory = (product: Product) => {
  const activeVariants = product.product_variants?.filter((variant) => variant.is_active) ?? []

  if (activeVariants.length) {
    return activeVariants.reduce((total, variant) => total + variant.stock_quantity, 0)
  }

  return product.stock_quantity
}

export const normalizeProductType = (value: string | null): ProductTypeFilter =>
  value === 'preorder' || value === 'new' || value === 'best_seller' ? value : 'all'
