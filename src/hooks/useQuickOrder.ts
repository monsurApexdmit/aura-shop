import { useMutation, useQuery } from '@tanstack/react-query'
import { quickOrderApi, type QuickOrderPayload } from '@/services/quickOrderApi'

export function useQuickOrder(slug: string | null) {
  return useQuery({
    queryKey: ['quick-order', slug],
    queryFn: () => quickOrderApi.get(slug!),
    enabled: !!slug,
    staleTime: 1000 * 60,
    retry: (count, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status
      return status !== 404 && count < 2
    },
  })
}

export function usePlaceQuickOrder() {
  return useMutation({
    mutationFn: (payload: QuickOrderPayload) => quickOrderApi.place(payload),
  })
}
