import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { orderApi, type PlaceOrderPayload } from '@/services/orderApi'

export function useOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders'],
    queryFn:  orderApi.getAll,
    enabled,
    staleTime: 1000 * 60 * 2,
  })
}

export function useOrder(id: number | null) {
  return useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderApi.getById(id!),
    enabled:  !!id,
  })
}

export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: PlaceOrderPayload) => orderApi.place(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
