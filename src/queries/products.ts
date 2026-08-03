import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductFilters } from '../services'
import { productServices } from '../services'
import type { ProductFormValues } from '../schemas'
import { dashboardQueryKeys } from './dashboard'

export const productQueryKeys = {
  all: ['products'] as const,
  list: (filters: ProductFilters) => [...productQueryKeys.all, 'list', filters] as const,
}

export const useProductsQuery = (filters: ProductFilters) =>
  useQuery({
    queryKey: productQueryKeys.list(filters),
    queryFn: () => productServices.getProducts(filters),
    staleTime: 60 * 1000,
  })

const invalidateProducts = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: productQueryKeys.all })
  void queryClient.invalidateQueries({ queryKey: dashboardQueryKeys.all })
}

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ProductFormValues) => productServices.createProduct(values),
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export const useUpdateProductMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, values }: { productId: string; values: ProductFormValues }) =>
      productServices.updateProduct(productId, values),
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export const useProductActiveMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ productId, isActive }: { productId: string; isActive: boolean }) =>
      productServices.setProductActive(productId, isActive),
    onSuccess: () => invalidateProducts(queryClient),
  })
}

export const useUploadProductImagesMutation = () =>
  useMutation({
    mutationFn: (files: File[]) => productServices.uploadProductImages(files),
  })
