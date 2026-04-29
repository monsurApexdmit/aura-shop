import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { productApi, type ProductFilters, type DealFilter } from '@/services/productApi'

export function useDeals(filter: DealFilter = 'all', limit = 48) {
  return useQuery({
    queryKey: ['deals', filter, limit],
    queryFn:  () => productApi.getDeals(filter, limit),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn:  () => productApi.getAll(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: (prev) => prev,
  })
}

export function useProduct(slug: string | null) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn:  () => productApi.getBySlug(slug!),
    enabled:  !!slug,
    staleTime: 1000 * 60 * 5,
  })
}

export function useProductReviews(slug: string | null) {
  return useQuery({
    queryKey: ['product-reviews', slug],
    queryFn: () => productApi.getReviews(slug!, { per_page: 20 }),
    enabled: !!slug,
    staleTime: 1000 * 60,
  })
}

export function useSubmitProductReview(slug: string | null) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: { rating: number; comment: string }) => productApi.submitReview(slug!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] })
      queryClient.invalidateQueries({ queryKey: ['product', slug] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}
