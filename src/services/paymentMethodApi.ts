import { api } from '@/lib/api'

export type PaymentGatewayType = 'cod' | 'manual' | 'sslcommerz' | 'portwallet' | 'stripe' | 'paypal' | 'bkash' | 'nagad'

export interface PaymentMethod {
  id: number
  name: string
  description: string | null
  icon: string | null
  gateway_type: PaymentGatewayType
  cod_deposit_required?: boolean
  cod_deposit_amount?: number | null
}

export const paymentMethodApi = {
  getActive: async (): Promise<PaymentMethod[]> => {
    const res = await api.get('/payment-methods')
    return res.data.data ?? []
  },
}
