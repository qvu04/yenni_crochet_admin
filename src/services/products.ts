import { supabase } from './supabase'
import type { ProductFormType, ProductFormValues } from '../schemas'

const PRODUCT_STORAGE_BUCKET = 'Products'
const PRODUCT_IMAGES_FOLDER = 'products'
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024

export type ProductTypeFilter = 'all' | 'preorder' | 'new' | 'best_seller'
export type ProductType = 'new' | 'best_seller' | 'pre_order'

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  color_name: string | null
  color_hex: string | null
  images: string[]
  price: number | null
  stock_quantity: number
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ProductPriceTier {
  id: string
  product_id: string
  variant_id: string | null
  min_quantity: number
  max_quantity: number | null
  unit_price: number
  is_active: boolean
  sort_order: number
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  images: string[]
  estimated_days: string | null
  allow_customization: boolean
  is_active: boolean
  is_featured: boolean
  is_pre_order: boolean
  stock_quantity: number
  product_type: ProductType | null
  created_at: string
  product_variants?: ProductVariant[] | null
  product_price_tiers?: ProductPriceTier[] | null
}

export interface ProductFilters {
  search?: string
  type?: ProductTypeFilter
}

const PRODUCT_SELECT = `
  *,
  product_variants(*),
  product_price_tiers(*)
`

const getFileExtension = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  return extension || 'jpg'
}

const toProductTypeColumns = (type: ProductFormType) => ({
  is_pre_order: type === 'preorder',
  product_type: type === 'normal' || type === 'preorder' ? null : type,
})

const toProductFormType = (product: Product): ProductFormType => {
  if (product.is_pre_order || product.product_type === 'pre_order') return 'preorder'
  if (product.product_type === 'new') return 'new'
  if (product.product_type === 'best_seller') return 'best_seller'
  return 'normal'
}

const normalizeProductPayload = (values: ProductFormValues) => ({
  name: values.name.trim(),
  description: values.description?.trim() || null,
  price: values.price,
  images: values.images,
  estimated_days: values.estimated_days?.trim() || null,
  allow_customization: values.allow_customization,
  is_active: values.is_active,
  stock_quantity: values.variants.length
    ? values.variants
      .filter((variant) => variant.is_active)
      .reduce((total, variant) => total + variant.stock_quantity, 0)
    : values.stock_quantity,
  is_featured: values.product_type === 'best_seller',
  ...toProductTypeColumns(values.product_type),
})

const syncProductRelations = async (productId: string, values: ProductFormValues) => {
  const priceTierRows = values.price_tiers.map((tier, index) => ({
    ...(tier.id ? { id: tier.id } : {}),
    product_id: productId,
    variant_id: null,
    min_quantity: tier.min_quantity,
    max_quantity: tier.max_quantity ?? null,
    unit_price: tier.unit_price,
    is_active: tier.is_active,
    sort_order: index,
  }))

  const variantRows = values.variants.map((variant, index) => ({
    ...(variant.id ? { id: variant.id } : {}),
    product_id: productId,
    name: variant.name.trim(),
    color_name: variant.color_name?.trim() || null,
    color_hex: variant.color_hex?.trim() || null,
    images: [],
    price: variant.price ?? null,
    stock_quantity: variant.stock_quantity,
    is_active: variant.is_active,
    sort_order: index,
  }))

  const [currentTiersResult, currentVariantsResult] = await Promise.all([
    supabase.from('product_price_tiers').select('id').eq('product_id', productId),
    supabase.from('product_variants').select('id').eq('product_id', productId),
  ])

  if (currentTiersResult.error) {
    throw new Error(currentTiersResult.error.message)
  }

  if (currentVariantsResult.error) {
    throw new Error(currentVariantsResult.error.message)
  }

  const nextTierIds = new Set(priceTierRows.map((tier) => tier.id).filter(Boolean))
  const nextVariantIds = new Set(variantRows.map((variant) => variant.id).filter(Boolean))
  const staleTierIds = (currentTiersResult.data ?? [])
    .map((tier) => tier.id)
    .filter((id) => !nextTierIds.has(id))
  const staleVariantIds = (currentVariantsResult.data ?? [])
    .map((variant) => variant.id)
    .filter((id) => !nextVariantIds.has(id))

  if (staleTierIds.length) {
    const { error } = await supabase.from('product_price_tiers').delete().in('id', staleTierIds)
    if (error) throw new Error(error.message)
  }

  if (staleVariantIds.length) {
    const { error } = await supabase.from('product_variants').delete().in('id', staleVariantIds)
    if (error) throw new Error(error.message)
  }

  if (priceTierRows.length) {
    const { error } = await supabase.from('product_price_tiers').upsert(priceTierRows)
    if (error) throw new Error(error.message)
  }

  if (variantRows.length) {
    const { error } = await supabase.from('product_variants').upsert(variantRows)
    if (error) throw new Error(error.message)
  }
}

export const productServices = {
  getProducts: async ({ search, type = 'all' }: ProductFilters): Promise<Product[]> => {
    let query = supabase.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false })

    if (search?.trim()) {
      query = query.ilike('name', `%${search.trim()}%`)
    }

    if (type === 'preorder') {
      query = query.eq('is_pre_order', true)
    } else if (type === 'new' || type === 'best_seller') {
      query = query.eq('product_type', type)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(error.message)
    }

    return (data ?? []) as Product[]
  },

  createProduct: async (values: ProductFormValues): Promise<Product> => {
    const { data, error } = await supabase
      .from('products')
      .insert(normalizeProductPayload(values))
      .select(PRODUCT_SELECT)
      .single()

    if (error) {
      throw new Error(error.message)
    }

    await syncProductRelations(data.id, values)

    const { data: product, error: productError } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', data.id)
      .single()

    if (productError) {
      throw new Error(productError.message)
    }

    return product as Product
  },

  updateProduct: async (productId: string, values: ProductFormValues): Promise<Product> => {
    const { error } = await supabase
      .from('products')
      .update(normalizeProductPayload(values))
      .eq('id', productId)

    if (error) {
      throw new Error(error.message)
    }

    await syncProductRelations(productId, values)

    const { data, error: productError } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('id', productId)
      .single()

    if (productError) {
      throw new Error(productError.message)
    }

    return data as Product
  },

  setProductActive: async (productId: string, isActive: boolean): Promise<void> => {
    const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', productId)

    if (error) {
      throw new Error(error.message)
    }
  },

  uploadProductImages: async (files: File[]): Promise<string[]> => {
    const uploads = files.map(async (file) => {
      if (!file.type.startsWith('image/')) {
        throw new Error('Chỉ hỗ trợ tải ảnh sản phẩm.')
      }

      if (file.size > MAX_PRODUCT_IMAGE_SIZE) {
        throw new Error('Mỗi ảnh sản phẩm tối đa 5MB.')
      }

      const path = `${PRODUCT_IMAGES_FOLDER}/${Date.now()}-${crypto.randomUUID()}.${getFileExtension(file.name)}`
      const { error } = await supabase.storage.from(PRODUCT_STORAGE_BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (error) {
        throw new Error(error.message)
      }

      const { data } = supabase.storage.from(PRODUCT_STORAGE_BUCKET).getPublicUrl(path)
      return data.publicUrl
    })

    return Promise.all(uploads)
  },

  toProductFormValues: (product: Product): ProductFormValues => ({
    name: product.name,
    description: product.description ?? '',
    price: Number(product.price ?? 0),
    estimated_days: product.estimated_days ?? '',
    stock_quantity: product.stock_quantity,
    product_type: toProductFormType(product),
    allow_customization: product.allow_customization,
    is_active: product.is_active,
    images: product.images ?? [],
    price_tiers:
      product.product_price_tiers
        ?.sort((firstTier, secondTier) => firstTier.sort_order - secondTier.sort_order)
        .map((tier) => ({
          id: tier.id,
          min_quantity: tier.min_quantity,
          max_quantity: tier.max_quantity,
          unit_price: tier.unit_price,
          is_active: tier.is_active,
        })) ?? [],
    variants:
      product.product_variants
        ?.sort((firstVariant, secondVariant) => firstVariant.sort_order - secondVariant.sort_order)
        .map((variant) => ({
          id: variant.id,
          name: variant.name,
          color_name: variant.color_name ?? '',
          color_hex: variant.color_hex ?? '',
          price: variant.price,
          stock_quantity: variant.stock_quantity,
          is_active: variant.is_active,
        })) ?? [],
  }),
}
