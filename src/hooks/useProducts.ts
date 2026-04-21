import { useQuery } from '@tanstack/react-query'
import { productApi, type ProductFilters } from '@/services/productApi'

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn:  () => productApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useProduct(id: number | null) {
  return useQuery({
    queryKey: ['product', id],
    queryFn:  () => productApi.getById(id!),
    enabled:  !!id,
    staleTime: 1000 * 60 * 5,
  })
}
