import { api } from '@/lib/api'

export interface ShippingMethod {
  id: number
  name: string
  description: string | null
  price: number
  estimated_days: string | null
  icon: string | null
}

export const shippingMethodApi = {
  getActive: async (): Promise<ShippingMethod[]> => {
    const res = await api.get('/shipping-methods')
    return res.data.data ?? []
  },
}
