import { useQuery } from '@tanstack/react-query'
import { paymentMethodApi } from '@/services/paymentMethodApi'

export function usePaymentMethods() {
  return useQuery({
    queryKey: ['payment-methods'],
    queryFn: paymentMethodApi.getActive,
    staleTime: 1000 * 60 * 10,
  })
}
