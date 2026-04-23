import { useQuery } from '@tanstack/react-query'
import { shippingMethodApi } from '@/services/shippingMethodApi'

export function useShippingMethods() {
  return useQuery({
    queryKey: ['shipping-methods'],
    queryFn: shippingMethodApi.getActive,
    staleTime: 1000 * 60 * 10,
  })
}
