import { api } from '@/lib/api'

export type PaymentGatewayType = 'cod' | 'sslcommerz' | 'portwallet'

export interface PaymentMethod {
  id: number
  name: string
  description: string | null
  icon: string | null
  gateway_type: PaymentGatewayType
}

export const paymentMethodApi = {
  getActive: async (): Promise<PaymentMethod[]> => {
    const res = await api.get('/payment-methods')
    return res.data.data ?? []
  },
}
