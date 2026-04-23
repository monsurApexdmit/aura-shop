import { api } from '@/lib/api'

export interface PaymentMethod {
  id: number
  name: string
  description: string | null
  icon: string | null
}

export const paymentMethodApi = {
  getActive: async (): Promise<PaymentMethod[]> => {
    const res = await api.get('/payment-methods')
    return res.data.data ?? []
  },
}
