import { useQuery } from '@tanstack/react-query'
import { shippingMethodApi, storeHoursApi } from '@/services/shippingMethodApi'

export function useShippingMethods(district?: string) {
  return useQuery({
    queryKey: ['shipping-methods', district ?? ''],
    queryFn: () => shippingMethodApi.getActive(district),
    staleTime: 1000 * 60 * 10,
  })
}

export function usePickupPoints(enabled = true) {
  return useQuery({
    queryKey: ['pickup-points'],
    queryFn: shippingMethodApi.getPickupPoints,
    staleTime: 1000 * 60 * 10,
    enabled,
  })
}

export function useStoreHours() {
  return useQuery({
    queryKey: ['store-hours'],
    queryFn: storeHoursApi.get,
    staleTime: 1000 * 60 * 30,
  })
}
